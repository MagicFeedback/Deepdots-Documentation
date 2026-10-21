---
title: Angular
description: Sådan bruger du Deepdots Popup SDK i en Angular-applikation, med SSR, zone.js og en striks Content-Security-Policy.
---

## Kompatibilitet

SDK'et er et browserbibliotek: det afhænger af `window` og `document` og monterer sin egen container på `document.body`. Det fungerer i enhver Angular-app, der kører i browseren, med eller uden SSR, og kræver ingen Angular-specifik pakke.

Eksemplerne nedenfor bruger standalone-API'er fra **Angular 19+** (`provideAppInitializer`) og er testet på Angular 22 med SSR, hydration og zone.js.

Tre ting er værd at håndtere én gang, i en lille service, i stedet for i hver komponent:

- **SSR**: SDK'et må kun starte i browseren.
- **zone.js**: SDK'et holder timere og listeners i gang hele sessionen. Inde i Angulars zone udløser hver af dem change detection for hele appen, så det skal køre uden for zonen.
- **Content-Security-Policy**: hvis din app bruger en nonce-baseret CSP, skal SDK'et have den nonce til de styles, det indsætter.

## Installation

```bash
npm install @magicfeedback/popup-sdk
```

## Grundlæggende integration

### 1. Opret servicen

Servicen indlæser SDK'et med en dynamisk `import()`, så det aldrig evalueres på serveren og holdes ude af dit initiale bundle. Kald, der foretages, før SDK'et er indlæst, venter på det i stedet for at gå tabt.

```ts
// src/app/deepdots.service.ts
import {
  CSP_NONCE, EnvironmentProviders, Injectable, InjectionToken, NgZone, PLATFORM_ID,
  inject, makeEnvironmentProviders, provideAppInitializer,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type {
  DeepdotsEvent, DeepdotsEventType, DeepdotsInitParams, DeepdotsPopups,
} from '@magicfeedback/popup-sdk';

export const DEEPDOTS_CONFIG = new InjectionToken<DeepdotsInitParams>('DEEPDOTS_CONFIG');

@Injectable({ providedIn: 'root' })
export class DeepdotsService {
  private readonly zone = inject(NgZone);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cspNonce = inject(CSP_NONCE, { optional: true });
  private sdk: Promise<DeepdotsPopups | null> = Promise.resolve(null);
  private started = false;

  /** Called once by provideDeepdots(). No-op on the server. */
  init(config: DeepdotsInitParams): void {
    if (!this.isBrowser || this.started) return;
    this.started = true;
    this.sdk = import('@magicfeedback/popup-sdk').then(({ DeepdotsPopups }) =>
      // Outside Angular's zone: the SDK's timers and listeners must not trigger change detection.
      this.zone.runOutsideAngular(() => {
        const sdk = new DeepdotsPopups();
        sdk.init({ cspNonce: this.cspNonce ?? undefined, ...config });
        sdk.autoLaunch();
        return sdk;
      }),
    );
  }

  triggerEvent(name: string): void {
    void this.sdk.then((sdk) => sdk?.triggerEvent(name));
  }

  track(name: string, params?: Record<string, unknown>): void {
    void this.sdk.then((sdk) => sdk?.track(name, params));
  }

  setUserId(userId?: string): void {
    void this.sdk.then((sdk) => sdk?.setUserId(userId));
  }

  /** Subscribes to an SDK event. The listener runs inside Angular's zone. Returns the unsubscribe. */
  on(type: DeepdotsEventType, listener: (event: DeepdotsEvent) => void): () => void {
    const wrapped = (event: DeepdotsEvent) => this.zone.run(() => listener(event));
    void this.sdk.then((sdk) => sdk?.on(type, wrapped));
    return () => void this.sdk.then((sdk) => sdk?.off(type, wrapped));
  }
}

export function provideDeepdots(config: DeepdotsInitParams): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: DEEPDOTS_CONFIG, useValue: config },
    provideAppInitializer(() => inject(DeepdotsService).init(inject(DEEPDOTS_CONFIG))),
  ]);
}
```

Initializeren blokerer ikke appen: den begynder at indlæse SDK'et og returnerer med det samme.

### 2. Registrér den

```ts
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideDeepdots } from './deepdots.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideDeepdots({ apiKey: 'YOUR_PUBLIC_API_KEY' }),
  ],
};
```

Det er hele integrationen. Popups med tids-, scroll-, exit- eller rute-triggers virker nu af sig selv.

## Udløs en popup fra en komponent

```ts
import { Component, inject } from '@angular/core';
import { DeepdotsService } from './deepdots.service';

@Component({
  selector: 'app-checkout',
  template: `<button (click)="onPaid()">Pay</button>`,
})
export class Checkout {
  private readonly deepdots = inject(DeepdotsService);

  onPaid(): void {
    this.deepdots.triggerEvent('purchase_completed');
  }
}
```

## Lyt til events

`on()` kører din listener inde i Angulars zone, så du kan opdatere signals eller komponentens tilstand direkte. Afmeld, når komponenten destrueres.

```ts
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DeepdotsService } from './deepdots.service';

@Component({
  selector: 'app-feedback-status',
  template: `<p>{{ status() }}</p>`,
})
export class FeedbackStatus {
  readonly status = signal('No survey yet');

  constructor() {
    const deepdots = inject(DeepdotsService);
    const off = deepdots.on('survey_completed', () => this.status.set('Thanks for your feedback'));
    inject(DestroyRef).onDestroy(off);
  }
}
```

## Identificér brugeren

Hvis brugeren er kendt, når appen starter, så giv `userId` til `provideDeepdots()`. Hvis brugeren logger ind senere, så kald `setUserId()`: det lukker den anonyme session og starter en ny for den bruger. Kald det uden argumenter ved logout.

```ts
this.deepdots.setUserId(user.id); // after login
this.deepdots.setUserId();        // after logout
```

## Navigation og page views

Der er intet at forbinde. Angular Router navigerer med `history.pushState`, som SDK'et allerede observerer, så rutebaserede popups (`segments.path`, `excludedPaths`) og analytics-page views følger dine ruter automatisk. Dynamiske segmenter normaliseres, så `/product/123` og `/product/456` begge rapporteres som `/product/:id`.

## Server-side rendering

Med `@angular/ssr` gør servicen intet på serveren: SDK'et importeres og startes kun i browseren, når appen starter der. Popuppen monteres på `document.body`, uden for dit rodelement, og renderes aldrig på serveren, så hydration påvirkes ikke.

## Content Security Policy

Hvis din app sender en CSP med en nonce til styles (`style-src 'nonce-…'` uden `'unsafe-inline'`), skal SDK'et sætte den nonce på de `<style>`-elementer, det indsætter. Ellers blokerer browseren dem, og surveyen vises uden sit stylesheet.

Servicen ovenfor gør det allerede via Angulars `CSP_NONCE`-token. Angular udfylder det token fra `ngCspNonce`-attributten på dit rodelement, som din server sætter med den samme nonce, som den sender i CSP-headeren:

```html
<app-root ngCspNonce="RANDOM_NONCE_FOR_THIS_RESPONSE"></app-root>
```

Hvis du selv leverer `CSP_NONCE`, opfanger servicen den på samme måde. Uden for Angular giver du noncen direkte til `init()` som `cspNonce`.

SDK'et har også brug for disse kilder i din CSP:

| Direktiv | Kilder |
| --- | --- |
| `connect-src` | `https://api.deepdots.com` (eller `https://api-dev.deepdots.com` med `nodeEnv: 'development'`). Med `analytics` konfigureret og `geolocation` ikke slået fra, også `https://ipapi.co`, `https://ipwho.is` og `https://ipinfo.io`. |
| `img-src` | De hosts, dine surveys' billeder og logoer serveres fra (`https:` er det enkleste). |
| `font-src` | Hosten for den tilpassede skrifttype, hvis din popups style angiver en skrifttype-`url`. |

:::note
`cspNonce` er tilgængelig fra version 1.15.0 af SDK'et. Med ældre versioner kræver en nonce-baseret CSP `'unsafe-inline'` i `style-src`.
:::

## Almindelige faldgruber

:::caution
Importér ikke `DeepdotsPopups` statisk og kald ikke `init()` fra en komponents constructor. Med SSR kører det på serveren, og i browseren kører det inde i Angulars zone, hvor hver timer og listener i SDK'et udløser change detection for hele appen.
:::

:::caution
Opret SDK'et én gang, via servicen. Kald af `init()` fra flere komponenter ville starte flere instanser, hver med sine egne triggers og sin egen analytics-session.
:::

:::caution
SDK'et indsætter sin egen container i `document.body`, uden for appens rodelement. Forsøg ikke at rendere den i en Angular-template, og bemærk at komponent-styles (`ViewEncapsulation`) ikke når den. Brug `surveyCss`-indstillingen til at omstyle surveyen.
:::

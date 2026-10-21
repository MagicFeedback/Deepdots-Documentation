---
title: Angular
description: How to use the Deepdots Popup SDK inside an Angular application, with SSR, zone.js and a strict Content-Security-Policy.
---

## Compatibility

The SDK is a browser library: it relies on `window` and `document` and mounts its own DOM container on `document.body`. It works in any Angular app that runs in the browser, with or without SSR, and needs no Angular-specific package.

The snippets below use standalone APIs from **Angular 19+** (`provideAppInitializer`) and were tested on Angular 22 with SSR, hydration and zone.js.

Three things are worth handling once, in a small service, instead of in every component:

- **SSR**: the SDK must only start in the browser.
- **zone.js**: the SDK keeps timers and listeners alive for the whole session. Inside Angular's zone each of them triggers change detection for the entire app, so it has to run outside the zone.
- **Content-Security-Policy**: if your app uses a nonce-based CSP, the SDK needs that nonce for the styles it injects.

## Installation

```bash
npm install @magicfeedback/popup-sdk
```

## Basic integration

### 1. Create the service

The service loads the SDK with a dynamic `import()`, so it is never evaluated on the server and stays out of your initial bundle. Calls made before the SDK finishes loading wait for it instead of being lost.

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

The initializer does not block the app: it starts loading the SDK and returns immediately.

### 2. Register it

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

That is the whole integration. Popups with time, scroll, exit or route triggers now work on their own.

## Triggering a popup from a component

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

## Listening to events

`on()` runs your listener inside Angular's zone, so you can update signals or component state directly. Unsubscribe when the component is destroyed.

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

## Identifying the user

If the user is known when the app starts, pass `userId` to `provideDeepdots()`. If they log in later, call `setUserId()`: it closes the anonymous session and starts a new one for that user. Call it without arguments on logout.

```ts
this.deepdots.setUserId(user.id); // after login
this.deepdots.setUserId();        // after logout
```

## Navigation and page views

Nothing to wire. The Angular Router navigates with `history.pushState`, which the SDK already observes, so route-based popups (`segments.path`, `excludedPaths`) and analytics page views follow your routes automatically. Dynamic segments are normalized, so `/product/123` and `/product/456` are both reported as `/product/:id`.

## Server-side rendering

With `@angular/ssr` the service is a no-op on the server: the SDK is only imported and started in the browser, when the app boots there. The popup is mounted on `document.body`, outside your root element, and never rendered on the server, so hydration is not affected.

## Content Security Policy

If your app sends a CSP with a nonce for styles (`style-src 'nonce-…'` without `'unsafe-inline'`), the SDK has to put that nonce on the `<style>` elements it injects. Otherwise the browser blocks them and the survey renders without its stylesheet.

The service above already does this through Angular's `CSP_NONCE` token. Angular fills that token from the `ngCspNonce` attribute on your root element, which your server sets with the same nonce it sends in the CSP header:

```html
<app-root ngCspNonce="RANDOM_NONCE_FOR_THIS_RESPONSE"></app-root>
```

If you provide `CSP_NONCE` yourself, the service picks it up the same way. Outside Angular, pass the nonce to `init()` directly as `cspNonce`.

The SDK also needs these sources in your CSP:

| Directive | Sources |
| --- | --- |
| `connect-src` | `https://api.deepdots.com` (or `https://api-dev.deepdots.com` with `nodeEnv: 'development'`). With `analytics` configured and `geolocation` not disabled, also `https://ipapi.co`, `https://ipwho.is` and `https://ipinfo.io`. |
| `img-src` | The hosts your survey images and logos are served from (`https:` is the simplest). |
| `font-src` | The host of the custom font, if your popup style sets a font `url`. |

:::note
`cspNonce` is available from version 1.15.0 of the SDK. With older versions a nonce-based CSP needs `'unsafe-inline'` in `style-src`.
:::

## Common pitfalls

:::caution
Do not import `DeepdotsPopups` statically and call `init()` from a component constructor. With SSR it runs on the server, and in the browser it runs inside Angular's zone, where every SDK timer and listener triggers change detection for the whole app.
:::

:::caution
Create the SDK once, through the service. Calling `init()` from several components would start several instances, each with its own triggers and analytics session.
:::

:::caution
The SDK injects its own container into `document.body`, outside your app's root element. Don't try to render it inside an Angular template, and note that component styles (`ViewEncapsulation`) don't reach it. To restyle the survey, use the `surveyCss` option.
:::

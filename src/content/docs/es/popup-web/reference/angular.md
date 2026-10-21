---
title: Angular
description: Cómo usar el SDK de popups de Deepdots dentro de una aplicación Angular, con SSR, zone.js y una Content-Security-Policy estricta.
---

## Compatibilidad

El SDK es una librería de navegador: depende de `window` y `document`, y monta su propio contenedor en `document.body`. Funciona en cualquier app Angular que se ejecute en el navegador, con o sin SSR, y no necesita ningún paquete específico de Angular.

Los fragmentos de abajo usan APIs standalone de **Angular 19+** (`provideAppInitializer`) y están probados en Angular 22 con SSR, hidratación y zone.js.

Hay tres cosas que conviene resolver una sola vez, en un servicio pequeño, en lugar de en cada componente:

- **SSR**: el SDK solo debe arrancar en el navegador.
- **zone.js**: el SDK mantiene timers y listeners activos durante toda la sesión. Dentro de la zona de Angular, cada uno de ellos lanza la detección de cambios de toda la app, así que tiene que ejecutarse fuera de la zona.
- **Content-Security-Policy**: si tu app usa una CSP con nonce, el SDK necesita ese nonce para los estilos que inyecta.

## Instalación

```bash
npm install @magicfeedback/popup-sdk
```

## Integración básica

### 1. Crea el servicio

El servicio carga el SDK con un `import()` dinámico, así que nunca se evalúa en el servidor y queda fuera de tu bundle inicial. Las llamadas que se hagan antes de que el SDK termine de cargar esperan a que esté listo en vez de perderse.

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

El initializer no bloquea la app: empieza a cargar el SDK y vuelve enseguida.

### 2. Regístralo

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

Esa es toda la integración. Los popups con triggers de tiempo, scroll, salida o ruta ya funcionan solos.

## Disparar un popup desde un componente

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

## Escuchar eventos

`on()` ejecuta tu listener dentro de la zona de Angular, así que puedes actualizar signals o el estado del componente directamente. Date de baja cuando el componente se destruya.

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

## Identificar al usuario

Si el usuario se conoce al arrancar la app, pasa `userId` a `provideDeepdots()`. Si inicia sesión más tarde, llama a `setUserId()`: cierra la sesión anónima y abre una nueva para ese usuario. Llámalo sin argumentos al cerrar sesión.

```ts
this.deepdots.setUserId(user.id); // after login
this.deepdots.setUserId();        // after logout
```

## Navegación y page views

No hay nada que conectar. El Router de Angular navega con `history.pushState`, que el SDK ya observa, así que los popups por ruta (`segments.path`, `excludedPaths`) y los page views de analytics siguen tus rutas automáticamente. Los segmentos dinámicos se normalizan: `/product/123` y `/product/456` se reportan los dos como `/product/:id`.

## Renderizado en servidor

Con `@angular/ssr` el servicio no hace nada en el servidor: el SDK solo se importa y arranca en el navegador, cuando la app arranca allí. El popup se monta en `document.body`, fuera de tu elemento raíz, y nunca se renderiza en el servidor, así que no afecta a la hidratación.

## Content Security Policy

Si tu app envía una CSP con nonce para los estilos (`style-src 'nonce-…'` sin `'unsafe-inline'`), el SDK tiene que poner ese nonce en los `<style>` que inyecta. Si no, el navegador los bloquea y el survey sale sin su hoja de estilos.

El servicio de arriba ya lo hace a través del token `CSP_NONCE` de Angular. Angular rellena ese token a partir del atributo `ngCspNonce` de tu elemento raíz, que tu servidor pone con el mismo nonce que envía en la cabecera CSP:

```html
<app-root ngCspNonce="RANDOM_NONCE_FOR_THIS_RESPONSE"></app-root>
```

Si proporcionas `CSP_NONCE` tú mismo, el servicio lo recoge igual. Fuera de Angular, pasa el nonce directamente a `init()` como `cspNonce`.

El SDK también necesita estos orígenes en tu CSP:

| Directiva | Orígenes |
| --- | --- |
| `connect-src` | `https://api.deepdots.com` (o `https://api-dev.deepdots.com` con `nodeEnv: 'development'`). Con `analytics` configurado y `geolocation` sin desactivar, también `https://ipapi.co`, `https://ipwho.is` y `https://ipinfo.io`. |
| `img-src` | Los hosts desde los que se sirven las imágenes y logos de tus surveys (`https:` es lo más sencillo). |
| `font-src` | El host de la fuente personalizada, si el estilo de tu popup define una `url` de fuente. |

:::note
`cspNonce` está disponible desde la versión 1.15.0 del SDK. Con versiones anteriores, una CSP con nonce necesita `'unsafe-inline'` en `style-src`.
:::

## Errores comunes

:::caution
No importes `DeepdotsPopups` de forma estática ni llames a `init()` desde el constructor de un componente. Con SSR se ejecuta en el servidor, y en el navegador se ejecuta dentro de la zona de Angular, donde cada timer y listener del SDK lanza la detección de cambios de toda la app.
:::

:::caution
Crea el SDK una sola vez, a través del servicio. Llamar a `init()` desde varios componentes arrancaría varias instancias, cada una con sus propios triggers y su propia sesión de analytics.
:::

:::caution
El SDK inyecta su propio contenedor en `document.body`, fuera del elemento raíz de tu app. No intentes renderizarlo dentro de una plantilla de Angular, y ten en cuenta que los estilos de componente (`ViewEncapsulation`) no le llegan. Para reestilar el survey, usa la opción `surveyCss`.
:::

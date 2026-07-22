---
title: Analytics
description: Análisis de comportamiento automático y seguimiento de eventos personalizados con el SDK de Popups de Deepdots.
---

El SDK de Popups de Deepdots incluye una capa de analytics integrada que recopila datos de comportamiento de tus usuarios y los envía a una integración dedicada en tu workspace de Deepdots. Esto te permite medir engagement, patrones de navegación y eventos clave de negocio sin añadir una herramienta de analytics separada.

## Configuración

Añade un objeto `analytics` en `init()` con el `publicKey` y el ID de `integration` de la integración creada en tu workspace de Deepdots. Sin él, el SDK funciona en **modo dry-run** — todos los eventos se registran en la consola pero no se envía nada.

```ts
import { DeepdotsPopups } from '@magicfeedback/popup-sdk';

const popups = new DeepdotsPopups();
popups.init({
  apiKey: 'TU_API_KEY_PÚBLICA',
  analytics: {
    publicKey: 'TU_PUBLIC_KEY_DE_ANALYTICS',
    integration: 'TU_ID_DE_INTEGRACIÓN',
  },
});
```

:::tip
Omitir `analytics` es seguro durante el desarrollo — el modo dry-run imprime en consola cada payload exactamente como se enviaría, para que puedas verificar los datos antes de activarlo en producción.
:::

---

## Datos automáticos

Los siguientes datos se recopilan **sin ningún código adicional** mientras el SDK esté inicializado:

| Dato | Cómo | Dónde aparece |
| --- | --- | --- |
| Vistas de pantalla (`deepdots_page_view`) | History API (pushState / popstate / hashchange) | Eventos |
| Tiempo activo de engagement (`deepdots_user_engagement`) | Listener de `visibilitychange` | Eventos |
| Identidad persistente del usuario (`user_id`) | Generada en la primera visita, guardada en `localStorage` | Metadata |
| Tipo de dispositivo | Calculado a partir del User-Agent (mobile / tablet / desktop) | Contexto |
| User agent | `navigator.userAgent` | Contexto |
| Idioma (`deepdots_language`) | Detectado automáticamente (ver [Detección de idioma](#detección-de-idioma)) | Contexto |
| Versión de la app | `appVersion` pasado en `init()` | Contexto |

Cada flush (pestaña oculta, página cerrada o `flushAnalytics()` manual) envía los eventos acumulados como un lote. El backend agrupa los lotes por sesión para que veas una única línea de tiempo por visita de usuario, no un registro por flush.

:::note[React Native]
En React Native la History API no está disponible. Usa [`setScreen(name)`](#react-native) para reportar la navegación manualmente. Los eventos de ciclo de vida usan `onForeground()` / `onBackground()` en lugar de `visibilitychange`.
:::

### Detección de idioma

El idioma que se reporta en el contexto de analytics — enviado como `deepdots_language` en el metadata del Feedback — se resuelve **automáticamente**, en este orden:

1. El `language` pasado a `init()` — una etiqueta [BCP-47](https://www.rfc-editor.org/info/bcp47) explícita como `'es-ES'`. Úsalo cuando tu app tiene su propio i18n y quieres forzar el idioma reportado.
2. `navigator.language` — el idioma del navegador (web).
3. El locale de `Intl` (`Intl.DateTimeFormat().resolvedOptions().locale`) — el fallback usado cuando `navigator.language` no está disponible. Es lo que hace que la detección funcione en **React Native con Hermes**, donde `navigator.language` no existe.
4. Si nada de lo anterior resuelve, el campo se omite.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  analytics: { publicKey: 'YOUR_ANALYTICS_PUBLIC_KEY', integration: 'YOUR_INTEGRATION_ID' },
  language: 'es-ES', // opcional — fuerza el idioma de analytics; se detecta automáticamente si se omite
});
```

:::note
Este es el idioma del metadata de la **integración de analytics**, no el metadata de identidad del survey. A diferencia de la navegación y el ciclo de vida, la detección de idioma no requiere ninguna integración en el host en React Native — el fallback de `Intl` se encarga. `country` / `city` se resuelven aparte por geo-IP.
:::

---

## Eventos personalizados

Usa `track(name, params?)` para registrar cualquier evento de negocio. Los nombres de evento son cadenas libres — usa snake_case en minúsculas para mantener consistencia con los eventos automáticos.

```ts
popups.track('add_to_cart', { product_id: 'p-123', value: 49.9, currency: 'EUR' });
popups.track('checkout_started');
popups.track('plan_upgraded', { plan: 'pro', billing: 'annual' });
```

### Búsquedas

`trackSearch` registra una consulta de búsqueda junto con el número de resultados. El SDK añade automáticamente `has_results: boolean` a partir del recuento.

```ts
popups.trackSearch('zapatillas running', 0);   // sin resultados — has_results: false
popups.trackSearch('camiseta', 142);           // has_results: true
```

### Fricción en findability

Registra los momentos en que los usuarios tienen dificultades para encontrar lo que buscan:

```ts
popups.trackFindabilityFriction('checkout_address');
popups.trackFindabilityFriction('comparacion_planes');
```

### Pasos de funnel

Rastrea los pasos dentro de un funnel con nombre. Agrupa los pasos relacionados bajo el mismo `funnel` y `taskId` para que el backend pueda calcular tasas de conversión:

```ts
popups.trackFunnelStep('onboarding', 'cuenta_creada', 'task-42');
popups.trackFunnelStep('onboarding', 'perfil_completado', 'task-42');
popups.trackFunnelStep('onboarding', 'primer_popup_visto', 'task-42');
```

---

## Seguimiento de mini-servicios

Un mini-servicio es cualquier flujo acotado dentro de tu app (proceso de pago, asistente de onboarding, chat de soporte). El SDK rastrea la entrada, la salida y la duración automáticamente una vez que señalizas los límites:

```ts
// El usuario entra en el flujo de pago
popups.enterMiniService('checkout', 'banner_home');

// … el usuario completa o abandona el flujo …

// El usuario sale — pasa el mismo nombre; la duración se calcula automáticamente
popups.exitMiniService('checkout');
```

Puede haber varios mini-servicios activos a la vez (p. ej. un chat de soporte abierto durante el pago). Cierra siempre cada uno por **nombre** para que el flujo correcto reciba su `deepdots_mini_service_exit` y su duración:

```ts
popups.enterMiniService('checkout', 'banner_home');
popups.enterMiniService('support_chat', 'fab');   // ambos activos ahora
popups.exitMiniService('checkout');               // cierra checkout; support_chat sigue abierto
```

Cualquier encuesta mostrada mientras un mini-servicio está activo recibe automáticamente una etiqueta de metadata `mini_service` (el más reciente), lo que te permite filtrar resultados de CSAT por contexto de flujo en Deepdots.

---

## Atributos de usuario

Llama a `setUserAttributes` para adjuntar atributos de negocio al contexto de analytics del usuario. Se incluyen en cada flush posterior.

```ts
popups.setUserAttributes({
  plan: 'pro',
  registration_status: 'registered',
  sector: 'retail',
});
```

Los atributos son acumulativos — cada llamada se fusiona con los anteriores.

### Registro de contacto

`setContactAttributes` envía los atributos a `POST /sdk/popups/contact`, creando o actualizando el registro de contacto del usuario en Deepdots. Este endpoint solo se llama cuando se proporcionó un `userId` en `init()` y el tracking está activado.

```ts
const sent = await popups.setContactAttributes({ language: 'es', age: 34, plan: 'premium' });
// sent: true si se hizo un POST, false si los atributos no han cambiado (deduplicación)
```

También puedes pasar `contactAttributes` directamente en `init()` para disparar la actualización de contacto al arranque:

```ts
popups.init({
  apiKey: 'TU_API_KEY_PÚBLICA',
  userId: 'user-123',
  contactAttributes: { plan: 'premium', language: 'es' },
});
```

---

## Messaging

Rastrea el ciclo de vida de las notificaciones de tu app (push e in-app) para que Deepdots pueda medir entrega, click-through y conversión por mensaje. Usa un único método, `trackMessage(stage, options)`, en cada etapa del funnel del mensaje:

```ts
// La notificación se entregó (push recibida, o mensaje in-app mostrado)
popups.trackMessage('delivered', { id: 'msg-42', title: 'Rebajas de verano', channel: 'push', campaign: 'summer_sale' });

// El usuario la pulsó / hizo click
popups.trackMessage('clicked', { id: 'msg-42', title: 'Rebajas de verano', channel: 'push' });

// El usuario completó la acción prevista (p. ej. compró)
popups.trackMessage('converted', { id: 'msg-42', title: 'Rebajas de verano', channel: 'push', value: 49.9, currency: 'EUR' });
```

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `stage` (1er arg) | `'delivered'` / `'clicked'` / `'converted'` | Etapa del funnel del mensaje |
| `id` | string | Correlaciona las etapas del mismo mensaje |
| `title` | string | Dimensión de agrupación de las métricas de Messaging |
| `channel` | `'push'` / `'in_app'` | Canal de entrega |
| `campaign` | string? | Nombre de la campaña (opcional) |
| `value` / `currency` | number / string | Valor de conversión (típico en `converted`) |
| `params` | object? | Pares clave/valor adicionales |

Cada llamada emite un evento `deepdots_message`; el backend agrupa por `title` (y desglosa por estado de registro / canal) para calcular entregas, CTR, usuarios únicos con click, tasa de conversión y usuarios que realizaron una acción.

:::note
Messaging es host-instrumentado — el SDK no puede observar tu sistema de notificaciones automáticamente, así que llamas a `trackMessage` desde tus propios handlers de push/in-app. Para **push**, la señal real de "delivered" suele ser más fiable desde tu proveedor/backend de push; la app sí ve de forma fiable el click/conversión.
:::

---

## Crashes y reporte de errores

El SDK captura errores de la aplicación y los envía como eventos `deepdots_app_crash`, que alimentan las métricas de Stability (usuarios sin crashes, crashes por versión y dispositivo). En cada `init()` se emite un evento `deepdots_session_start` para que el backend pueda calcular la tasa de sesiones sin crash.

### Captura automática

Los errores no manejados se capturan automáticamente — en web vía `window.onerror` / `unhandledrejection`, y en React Native vía `global.ErrorUtils` (cableado por `setupReactNative`). Los crashes capturados se persisten localmente y se reenvían en el siguiente arranque, porque el proceso puede morir antes del siguiente flush — así el crash que terminó una sesión igualmente llega a Deepdots.

### Reportar errores manualmente

Usa `reportError` para errores manejados, con severidad opcional y contexto libre:

```ts
try {
  await checkout();
} catch (e) {
  popups.reportError(e, { severity: 'error', context: { screen: 'Checkout', order_id: 'o-42' } });
}
```

| Opción | Valores | Por defecto |
| --- | --- | --- |
| `severity` | `'fatal'` / `'error'` / `'warning'` | `'error'` |
| `handled` | `boolean` | `true` |
| `context` | mapa libre clave/valor (prefijado `ctx_` en el payload) | — |

El contexto del crash (versión de la app, OS, dispositivo) se captura en el momento del crash, así que un crash en una versión antigua sigue reportando la versión en la que ocurrió.

:::caution
La cobertura es para **errores JS gestionados**: errores no manejados en web (`window.onerror` / `unhandledrejection`) y en React Native (`global.ErrorUtils`), además de lo que envíes con `reportError`. Los crashes **nativos** bajo React Native (iOS / Android) **no** se capturan — si ya usas un crash reporter nativo (Crashlytics, Sentry), reenvía sus reportes a `reportError`.
:::

El reporte de crashes respeta el mismo kill-switch de consentimiento que el resto de la analítica (`trackingEnabled` / `setTrackingEnabled`).

---

## Privacidad y consentimiento

Establece `trackingEnabled: false` en `init()` para arrancar con toda la analítica y el tracking de contacto desactivados — útil cuando necesitas consentimiento explícito del usuario antes de recopilar datos.

```ts
popups.init({
  apiKey: 'TU_API_KEY_PÚBLICA',
  trackingEnabled: false,
});

// Más tarde, cuando el usuario da su consentimiento:
popups.setTrackingEnabled(true);
```

`setTrackingEnabled(false)` suspende todas las llamadas salientes (analytics, contacto). `setTrackingEnabled(true)` las reanuda y asigna un `user_id` persistente si aún no había uno almacenado.

---

## React Native

En React Native, dos comportamientos automáticos requieren integración explícita del host:

### Seguimiento de navegación

Como la History API no está disponible, reporta los cambios de pantalla manualmente después de cada evento de navegación:

```ts
// En el callback onStateChange de React Navigation:
popups.setScreen(route.name);
```

### Ciclo de vida (tiempo de engagement)

Conecta el SDK al ciclo de vida de primer plano/fondo de la app para que el tiempo de engagement se mida correctamente y los eventos se envíen cuando la app pasa a segundo plano:

```ts
import { AppState } from 'react-native';

AppState.addEventListener('change', (state) => {
  if (state === 'active') popups.onForeground();
  else popups.onBackground(); // también hace flush de la analítica pendiente
});
```

:::tip
Si usas `setupReactNative()`, tanto `setScreen` (mediante React Navigation) como el cableado de `AppState` se gestionan automáticamente. Consulta la [referencia de React Native](/es/popup-web/reference/react-native/) para la configuración completa.
:::

---

## Previsualizar eventos antes de enviar

Durante el desarrollo, inspecciona el buffer de eventos actual sin hacer flush:

```ts
const preview = popups.previewAnalytics();
console.log(preview.events);   // todos los eventos en cola desde el último flush
```

Para forzar un flush manualmente (útil para testing):

```ts
popups.flushAnalytics();
```

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
| Vistas de pantalla (`page_view`) | History API (pushState / popstate / hashchange) | Eventos |
| Tiempo activo de engagement (`user_engagement`) | Listener de `visibilitychange` | Eventos |
| Identidad persistente del usuario (`user_id`) | Generada en la primera visita, guardada en `localStorage` | Metadata |
| Tipo de dispositivo | Calculado a partir del User-Agent (mobile / tablet / desktop) | Contexto |
| User agent | `navigator.userAgent` | Contexto |
| Idioma del navegador | `navigator.language` | Contexto |
| Versión de la app | `appVersion` pasado en `init()` | Contexto |

Cada flush (pestaña oculta, página cerrada o `flushAnalytics()` manual) envía los eventos acumulados como un lote. El backend agrupa los lotes por sesión para que veas una única línea de tiempo por visita de usuario, no un registro por flush.

:::note[React Native]
En React Native la History API no está disponible. Usa [`setScreen(name)`](#react-native) para reportar la navegación manualmente. Los eventos de ciclo de vida usan `onForeground()` / `onBackground()` en lugar de `visibilitychange`.
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

// El usuario sale — la duración se calcula automáticamente
popups.exitMiniService();
```

Cualquier encuesta mostrada mientras un mini-servicio está activo recibe automáticamente una etiqueta de metadata `mini_service`, lo que te permite filtrar resultados de CSAT por contexto de flujo en Deepdots.

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

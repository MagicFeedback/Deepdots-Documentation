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

El idioma resuelto es también aquello contra lo que se compara la **segmentación por idioma** de los popups (`segments.lang`), así que fijar `language` explícitamente fija ambas cosas a la vez. En React Native esto requiere **1.1.8 o superior** — ver [React Native → Segmentación por idioma](/es/popup-web/reference/react-native/#segmentación-por-idioma).

---

## Sesiones

Una sesión es una visita continua. El id de sesión es propiedad del backend, que cose los lotes por `user_id`, así que una visita se lee como una única línea temporal en lugar de un registro por flush.

Desde la **1.2.0** los dos extremos de la sesión se señalizan explícitamente:

- **`deepdots_session_start`** — en cada apertura de sesión. Es decir: `init()`, la vuelta a primer plano, dar consentimiento con `setTrackingEnabled(true)` y después de un cambio de usuario. Si inicializas con `trackingEnabled: false`, la primera sesión se abre al dar el consentimiento.
- **`deepdots_session_end`** — al cerrar, con un `reason`. El lote de cierre se envía con `completed: true`, que es lo que le indica al backend que el registro está terminado.

El lote de cierre hace flush de todo lo que quedaba abierto, en orden: el `deepdots_page_view` de la pantalla actual, cualquier `deepdots_mini_service_exit` pendiente, el `deepdots_user_engagement` acumulado y, por último, `deepdots_session_end`. Nada queda esperando un flush que no llegará.

| `reason` | Cuándo |
| --- | --- |
| `page_hide` | Se cierra la página (`pagehide`) — web |
| `background` | La app pasa a segundo plano (`onBackground()`) — React Native |
| `user_change` | `setUserId()` cambió de usuario |
| `tracking_disabled` | `setTrackingEnabled(false)` |
| `manual` | `endSession()` |

### `endSession()`

Cierra la sesión explícitamente. Úsalo al hacer logout o al terminar un flujo autocontenido, cuando la visita ha acabado pero la página o la app no:

```ts
popups.endSession();
```

El siguiente evento trackeado abre una sesión nueva.

### `setUserId(userId?)`

Reporta un cambio de usuario — login, logout o cambio de cuenta. Cierra la sesión del usuario anterior con `reason: 'user_change'`, intercambia la identidad y abre una sesión nueva, de forma que los dos usuarios nunca comparten línea temporal:

```ts
// Login: atribuye lo que viene a tu propio id de usuario
popups.setUserId('customer-123');

// Logout: vuelta al id anónimo del SDK
popups.setUserId();
```

:::caution
Los atributos de usuario y las métricas definidos con [`setUserAttributes`](#atributos-de-usuario) y [`setMetric`](#métricas) se **descartan** al cambiar de usuario — pertenecían al anterior. Vuelve a definirlos después del cambio.
:::

:::note
`setUserId()` es para un cambio *durante* la sesión. Para identificar al usuario que ya conoces al arrancar, pasa `userId` a `init()`.
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

### Interacciones significativas

Registra una interacción significativa: un momento que indica que el usuario obtuvo valor real de tu app. `interactionType` es la dimensión de agrupación, así que mantén un conjunto de nombres pequeño y estable (`get_help`, `homepage`, `contact_support`):

```ts
popups.trackMeaningfulInteraction('get_help');
popups.trackMeaningfulInteraction('homepage', { screen: '/home' });
```

Cada llamada emite un evento `deepdots_meaningful_interaction` que alimenta el panel de **Effectiveness**.

:::caution
Usa este helper en lugar de `track('meaningful_interaction')`. Un evento custom sale con el namespace `deepdots_event_meaningful_interaction`, que los informes de Effectiveness no leen, así que el dato llegaría a la integración pero nunca aparecería en esa página. Una llamada con `interactionType` vacío se descarta con un warning en consola.
:::

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

## Métricas

Llama a `setMetric(key, value)` para registrar un **valor medible** — una cantidad que quieres reportar junto al contexto de analytics del usuario, como el valor del carrito o el número de artículos en él.

```ts
popups.setMetric('cart_value', 49.99);
popups.setMetric('items_in_cart', 3);
```

La firma es:

```ts
setMetric(key: string, value: string | number | boolean): void
```

Las métricas aterrizan en un **campo dedicado `metrics`** del payload de analytics (`POST /sdk/feedback`), separado de `metadata` y de los [atributos de usuario](#atributos-de-usuario).

### Comportamiento

- **Persistente** — una vez fijado, el valor se reenvía en cada flush hasta que cambie.
- **Sobrescribe por key** — volver a llamar a `setMetric` con la misma key reemplaza el valor anterior.
- **Se coerciona a string** — el valor se almacena como string en el envío (`49.99` → `"49.99"`).
- **Las keys vacías se ignoran** — una llamada con `key` vacía es un no-op.
- **Respeta el kill-switch** — es un no-op mientras el tracking está desactivado (ver [Privacidad y consentimiento](#privacidad-y-consentimiento)).

### Métricas vs. atributos de usuario

Ambos adjuntan contexto al usuario, pero responden a preguntas distintas:

| | [`setUserAttributes`](#atributos-de-usuario) | `setMetric` |
| --- | --- | --- |
| Representa | Dimensiones para **desglosar** | **Valores** medibles a reportar |
| Ejemplo | `plan: 'pro'`, `sector: 'retail'` | `cart_value: 49.99`, `items_in_cart: 3` |
| Campo del payload | `metadata` | `metrics` |

Usa los atributos para el *quién* — las categorías por las que filtras y agrupas — y las métricas para el *cuánto* — las cantidades que mides.

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
Messaging es host-instrumentado — el SDK no puede observar tu sistema de notificaciones automáticamente, así que llamas a `trackMessage` desde tus propios handlers de push/in-app.
:::

### Reglas para un funnel correcto

El CTR y la tasa de conversión son ratios sobre `delivered`. Si las etapas no encajan, esas métricas salen mal — y si falta `delivered` salen valores imposibles, porque el denominador es cero.

1. **Envía las tres etapas.** `delivered` se manda cuando el mensaje llega al dispositivo, *antes* de que el usuario lo abra — en mensajes in-app, cuando se renderiza. Sin él no hay denominador.
2. **Usa el mismo `id` en las tres etapas.** Es lo que correlaciona el funnel, y debe ser único por envío, no por campaña.
3. **Un `id`, un canal.** Si una campaña sale como push *y* como mensaje in-app, usa dos `id` distintos que compartan el mismo `campaign`.
4. **Una llamada por etapa.** Si tu handler de click puede ejecutarse por dos rutas — abrir la notificación más un deep link — asegúrate de que solo una emite `clicked`.

### Validación

Desde la **1.2.0** el SDK descarta las llamadas que rompen estas reglas en lugar de reenviarlas, y avisa por consola:

```
[DeepdotsPopups] trackMessage descartado (channel_conflict): message_id "msg-42" ya se reportó en channel "push"; se descarta "in_app"
```

| Regla | Qué se descarta | `reason` |
| --- | --- | --- |
| `channel` solo puede ser `push` o `in_app` | Cualquier otro valor | `invalid_channel` |
| Cada par `(id, stage)` se envía una vez | La 2ª llamada a la misma etapa del mismo mensaje | `duplicate_stage` |
| Un `id` conserva su canal | Eventos de un canal distinto al primero visto | `channel_conflict` |

Las comprobaciones tienen vigencia de sesión y son por dispositivo, y vigilan hasta 500 ids de mensaje (se descartan primero los más antiguos). Una llamada rechazada no consume estado: tras un `channel_conflict` en `in_app`, la misma etapa en el canal correcto sí se envía.

Si ves estos avisos mientras integras, están señalando un doble conteo real — corrige el punto de llamada en vez de ignorarlos.

:::caution[El `delivered` en push tiene un límite estructural]
En el dispositivo la entrega solo es observable si el proceso de tu app recibe la notificación: un push de tipo *data* en Android, una `UNNotificationServiceExtension` con `mutable-content` en iOS. Las notificaciones que llegan con la app terminada, o con permisos restringidos, nunca lo disparan — así que un `delivered` medido en la app queda por debajo del real, y el CTR sale alto.

Para tener un denominador fiable, toma el `delivered` de tu proveedor de envío (FCM/APNs o tu plataforma de campañas), y usa el `delivered` del SDK como señal secundaria y como fuente de verdad para `in_app`.
:::

---

## Crashes y reporte de errores

El SDK captura errores de la aplicación y los envía como eventos `deepdots_app_crash`, que alimentan las métricas de Stability (usuarios sin crashes, crashes por versión y dispositivo). En cada [apertura de sesión](#sesiones) se emite un evento `deepdots_session_start` para que el backend pueda calcular la tasa de sesiones sin crash.

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

`setTrackingEnabled(false)` cierra la [sesión](#sesiones) actual con `reason: 'tracking_disabled'` y suspende todas las llamadas salientes (analytics, contacto) — los datos recogidos antes del opt-out se entregan, no se descartan. `setTrackingEnabled(true)` las reanuda, asigna un `user_id` persistente si aún no había uno almacenado y abre una sesión nueva.

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
  else popups.onBackground(); // cierra la sesión y hace flush
});
```

:::caution
Desde la **1.2.0** `onBackground()` **cierra la sesión** (`reason: 'background'`) y `onForeground()` abre una nueva. Llámalo solo en una transición real a segundo plano — en iOS, no lo conectes a `willResignActive`: el estado `inactive` es transitorio (una llamada entrante, el conmutador de apps) y partiría una visita en dos sesiones.
:::

:::tip
El `<DeepdotsProvider>` de `@magicfeedback/popup-sdk/react-native` (y `setupReactNative()` por debajo) cablea por ti el ciclo de vida de `AppState` — pero **no** `setScreen`: la navegación siempre hay que reportarla desde tu navegador. Consulta la [referencia de React Native](/es/popup-web/reference/react-native/) para la configuración completa.
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

## Garantías de entrega

Los flushes ocurren automáticamente — cada 30 s en primer plano, cuando el buffer llega a 20 eventos, cuando se oculta la pestaña y cuando se cierra la página o la app. Rara vez necesitas llamar a `flushAnalytics()` tú. A partir de **1.1.8** el canal está endurecido para que no se pierda el último lote de una visita — el que lleva el `deepdots_page_view` y el `deepdots_user_engagement` de cierre:

- **Sobrevive a la navegación y al cierre** — la petición usa `keepalive`, y el flush final al cerrar la página pasa a `navigator.sendBeacon`. Los navegadores ya no la cancelan a medias.
- **Reintenta los fallos transitorios** — un error de red o un `5xx` / `408` / `429` devuelve el lote al principio del buffer, en orden cronológico, para reintentarlo en el flush siguiente. Se retienen hasta 200 eventos; por encima se descartan los más antiguos.
- **Reporta los fallos permanentes** — un `4xx` (por ejemplo un `406` por un Contact desconocido) se loguea con su status y el cuerpo de la respuesta, y el lote se descarta, en lugar de fallar en silencio.
- **Mantiene un registro por visita** — hasta que el backend devuelve un id de sesión, los lotes se serializan en vez de enviarse en paralelo, así una visita no se parte en dos registros.

:::note
Reintentar hace que la entrega sea **at-least-once**: si se pierde una respuesta después de que el backend ya procesara un lote, esos eventos se vuelven a enviar. Un evento se identifica de forma única por usuario + nombre de evento + timestamp — así que si montas reporting sobre los datos crudos de la integración, deduplica por esa terna.
:::

`flushAnalytics()` acepta un flag `final`, que es el que usa el SDK internamente al cerrar la página. Pásalo solo si estás implementando tu propio camino de cierre — prefiere `sendBeacon` y no espera la respuesta:

```ts
popups.flushAnalytics({ final: true });
```

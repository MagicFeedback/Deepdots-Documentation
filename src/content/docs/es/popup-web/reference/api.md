---
title: API
description: Métodos públicos que usarás desde tu aplicación.
---

Estos son los métodos públicos de la clase `DeepdotsPopups`. Cubren todo lo que una aplicación host necesita para montar el SDK, reaccionar a los popups y lanzar eventos de negocio.

## `init(config)`

Inicializa el SDK y carga las definiciones de popup desde Deepdots.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'customer-123', // opcional
});
```

| Campo    | Obligatorio | Descripción                                              |
| -------- | ----------- | -------------------------------------------------------- |
| `apiKey` | sí          | Tu API key pública de Deepdots.                          |
| `userId` | no          | Identificador enviado con cada evento de popup.          |
| `language` | no        | Etiqueta de idioma BCP-47 (p. ej. `es-ES`). Determina tanto el contexto de analytics como la [segmentación por idioma](/es/popup-web/reference/popup-definition/#campos-que-afectan-al-comportamiento) de los popups (`segments.lang`). Se detecta automáticamente desde el navegador (o `Intl` en React Native) si se omite. Ver [Analytics → Detección de idioma](/es/popup-web/guides/analytics/#detección-de-idioma). |
| `contactAttributes` | no | Atributos internos del usuario a enviar al Contact (requiere `userId`). Ver [`setContactAttributes`](#setcontactattributesattributes). |
| `debug`  | no          | Activa la salida de debug del SDK. Desactivada por defecto. |
| `logger` | no          | Destino personalizado para esa salida de debug. Ver [Logger personalizado](#logger-personalizado). |

### Logger personalizado

Por defecto el SDK escribe su salida de debug en `console`. Pasa un `logger` para enrutarla a otro sitio — un archivo de log, un servicio de logging remoto, Firebase, tu propio buffer — lo que resulta útil en React Native, donde la consola de Metro no está disponible en builds de producción.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  debug: true,
  logger: {
    log: (...args) => myLogger.info(...args),
    warn: (...args) => myLogger.warn(...args),
    error: (...args) => myLogger.error(...args),
  },
});
```

Solo `log` es obligatorio — `warn`, `error` e `info` caen a `log` si se omiten. `console` cumple la forma, así que `logger: console` es válido y es el valor por defecto.

```ts
interface DeepdotsLogger {
  log: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
}
```

:::note
`logger` solo cambia **dónde** va la salida, no cuánta hay: los mensajes de debug del SDK siguen requiriendo `debug: true`. Los errores que el SDK reporta independientemente de `debug` (un listener de evento que lanza, un aviso del renderer) también pasan por el logger una vez está fijado.
:::

## `autoLaunch()`

Arranca los triggers derivados de las definiciones cargadas durante `init()`. Llámalo una vez después de `init()`.

```ts
popups.autoLaunch();
```

## `triggerEvent(eventName)`

Lanza un evento de negocio personalizado. Cualquier popup en Deepdots configurado con un trigger de tipo `event` cuyo nombre coincida con `eventName` se mostrará (respetando cooldowns y segmentación).

```ts
popups.triggerEvent('checkout_completed');
```

Consulta [Triggers → event](/es/popup-web/guides/triggers/#event) para más detalles.

## `on(event, listener)` / `off(event, listener)`

Suscríbete a los eventos del SDK: `popup_shown`, `popup_clicked`, `survey_completed`.

```ts
const onShown = (event) => analytics.track('popup_shown', event);

popups.on('popup_shown', onShown);
popups.off('popup_shown', onShown);
```

Mira [Events](/es/popup-web/guides/events/) para el payload completo.

## `setContactAttributes(attributes)`

Envía atributos internos del usuario que solo conoce tu aplicación — idioma, edad, plan, segmento, etc. — al **Contact** del usuario en Deepdots, para usarlos en la segmentación y el targeting de popups.

Requiere un `userId` en `init()`: los atributos se asocian a esa identidad (el mismo id de tu propio sistema). Los valores de los atributos deben ser `string`, `number` o `boolean`.

```ts
const enviado = await popups.setContactAttributes({
  language: 'es',
  age: 34,
  plan: 'premium',
});
```

El SDK solo envía cuando los atributos **cambian** respecto al último envío — guarda un diff en el almacenamiento persistente —, así que puedes llamarlo en cada identificación de usuario sin generar peticiones de más. La promesa devuelta resuelve a:

- `true` — los atributos se enviaron al backend.
- `false` — no hubo cambios desde el último envío (o el tracking está desactivado, o no hay `userId`).

Por debajo hace `POST /sdk/popups/contact` con el body `{ publicKey, userId, userAttributes }`. El Contact se crea automáticamente en la primera carga de popups, así que no hace falta ningún orden concreto.

También puedes aportar los atributos iniciales directamente en `init()` con `contactAttributes` (equivale a llamar `setContactAttributes` justo después de init):

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'customer-123',
  contactAttributes: { language: 'es', plan: 'premium' },
});
```

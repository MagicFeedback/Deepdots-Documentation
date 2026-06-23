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
| `contactAttributes` | no | Atributos internos del usuario a enviar al Contact (requiere `userId`). Ver [`setContactAttributes`](#setcontactattributesattributes). |

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

## `show({ surveyId, productId })`

Muestra un popup directamente, saltándose los triggers. Los cooldowns y la segmentación por ruta se siguen respetando.

```ts
popups.show({
  surveyId: 'survey-home-001',
  productId: 'product-main',
});
```

## `showByPopupId(popupId)`

Igual que `show()`, pero direccionando el popup por su `id` de Deepdots en lugar de por el par survey/product.

```ts
popups.showByPopupId('popup-home-5s');
```

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

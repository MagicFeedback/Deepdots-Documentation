---
title: Events
description: Eventos emitidos por el SDK y el payload que recibe el host.
---

## Eventos

- `popup_shown`
- `popup_clicked`
- `survey_completed`

## Tipo base

```ts
interface DeepdotsEvent {
  type: 'popup_shown' | 'popup_clicked' | 'survey_completed';
  surveyId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}
```

## Suscripcion

```ts
const onShown = (event) => console.log(event);

popups.on('popup_shown', onShown);
popups.off('popup_shown', onShown);
```

## Datos frecuentes en `data`

- `popupId`
- `action`
- `userId`

## Nota sobre `popup_clicked`

`popup_clicked` significa que el usuario ha hecho algo en el popup. En web, `data.action` es uno de `start_survey`, `manual_send`, `back`, `complete`, `close_icon` o `partial` (el usuario respondió una página y avanzó; este además marca el popup como `PARTIAL` en el backend).

Cargar el survey, el inicio de un envío y los errores de validación o de envío no son interacción y no lo emiten. Las versiones anteriores también enviaban `loaded`, `before_submit`, `validation_error_required` y `submit_error`, y dos eventos `back` por cada toque en Volver.

En React Native el puente lo emite una vez por popup, con `action: 'partial'`, en la primera interacción real (enviar una respuesta o volver atrás). Cargar el survey no cuenta.

---
title: Cómo se cargan los popups
description: Los popups se gestionan siempre en Deepdots y se cargan desde la API en tiempo de ejecución.
---

Los popups se **gestionan siempre en Deepdots y se cargan desde la API en tiempo de ejecución**. No hay un modo en cliente: tu código nunca define popups a mano.

## Cómo funciona

- Las definiciones de popup, los copys, los triggers, la segmentación y los cooldowns viven en **Deepdots**.
- El SDK los carga en tiempo de ejecución usando tu `apiKey` (`GET /sdk/{apiKey}/popups`).
- Tu código solo monta el SDK y reacciona a sus eventos.

## Configuración mínima

```ts
import { DeepdotsPopups } from '@magicfeedback/popup-sdk';

const popups = new DeepdotsPopups();

popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
});

popups.autoLaunch();
```

## Campos opcionales

| Campo    | Tipo     | Por defecto | Qué hace                                                  |
| -------- | -------- | ----------- | --------------------------------------------------------- |
| `userId` | `string` | ninguno     | Se envía con cada evento de popup para identificar al usuario. |

## ¿Por qué no se definen popups en cliente?

Definir popups en tu código repartiría la propiedad de la experiencia entre tu repositorio y Deepdots. Mantener una única fuente de verdad en Deepdots permite que producto, marketing y CS cambien copys, segmentación y triggers sin necesitar un despliegue por tu parte.

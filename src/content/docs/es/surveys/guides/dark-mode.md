---
title: Modo claro y oscuro
description: Styles oscuros y enlaces de survey que siguen al dispositivo del visitante.
---

Los surveys toman sus colores del **Style** (Admin › survey › Settings › **Survey styling**).

## Styles oscuros

Cuando los colores del Style son oscuros (el fondo de la caja, o el de la página si no hay color de caja), el survey pasa a texto claro por sí solo: preguntas, respuestas, campos, botones y pantalla final. Un botón de marca claro sobre una tarjeta oscura lleva texto oscuro.

## Colores oscuros opcionales

En **Survey styling** los campos de color tienen dos pestañas, **Light** y **Dark (optional)**. Rellena la pestaña Dark cuando el survey se muestre en los dos modos:

- Un campo oscuro vacío usa el color claro.
- Un color claro en un campo oscuro se ignora (se usa un oscuro por defecto) y el Admin avisa.

Quién elige el modo:

| Dónde | Modo |
|---|---|
| Enlace del survey | El dispositivo del visitante (`prefers-color-scheme`). Añade `?mode=dark` o `?mode=light` al enlace para forzar uno. |
| Popup web | La opción `appearance` del [SDK de popups](/es/popup-web/guides/dark-mode/). |
| Popup en app | La opción `appearance` del [SDK nativo](/es/popup-native/guides/dark-mode/). |

Sin colores oscuros no se fuerza nada: decide el Style, como hasta ahora.

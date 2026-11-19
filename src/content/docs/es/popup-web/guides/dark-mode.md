---
title: Modo claro y oscuro
description: Los colores oscuros del survey funcionan solos, y tu web puede elegir claro, oscuro o el del sistema.
---

El popup y el survey que lleva dentro toman sus colores del **Style** del survey en Deepdots. El modo oscuro funciona de dos formas.

## 1. Un Style oscuro funciona solo

Si los colores del Style son oscuros (por ejemplo un *Survey box background color* oscuro), el popup pasa a texto claro por sí solo: título, botón de cerrar, progreso, preguntas, respuestas y botones. Sin cambios de código, solo `@magicfeedback/popup-sdk` **1.22.0** o posterior.

## 2. Seguir el modo claro u oscuro de tu web

Si tu web tiene modo claro y oscuro, configura los colores oscuros en Deepdots (**Survey styling › Dark (optional)**) e indica al SDK qué modo usar:

```ts
const popups = new DeepdotsPopups();
popups.init({
  apiKey: '<your-api-key>',
  appearance: 'system', // 'light' | 'dark' | 'system'
});

// Tu web tiene su propio interruptor:
popups.setAppearance('dark');
```

| `appearance` | Resultado |
|---|---|
| sin definir | Como hasta ahora: deciden los colores del Style. |
| `'light'` | Popup claro. Los colores oscuros del Style se ignoran. |
| `'dark'` | Popup oscuro con los colores oscuros del Style. Sin ellos usa el color del Style si ya es oscuro, o una paleta oscura por defecto. |
| `'system'` | Sigue al dispositivo (`prefers-color-scheme`). |

- `setAppearance()` se aplica al siguiente popup que se abra. `getAppearance()` devuelve el valor actual.
- Con `'system'` el marco del popup sigue un cambio con el popup abierto; el survey mantiene el modo con el que se abrió.
- En una tarjeta oscura, un botón de marca claro lleva texto oscuro para que se lea.
- React Native: las mismas opciones, en `init()` o `setupReactNative()`.

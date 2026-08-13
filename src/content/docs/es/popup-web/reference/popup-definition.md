---
title: Popup Definition
description: Estructura de un popup tal y como la entrega la API de Deepdots. Informativa — no la construyes tú.
---

Esta página documenta la estructura de un popup **tal y como la entrega la API de Deepdots**. No necesitas construir estos objetos en tu código — Deepdots los almacena y el SDK los carga en tiempo de ejecución.

Se publica aquí para que los integradores puedan entender qué llega al SDK y qué campos determinan el comportamiento.

## Estructura

```ts
interface PopupDefinition {
  id: string;
  title: string;
  message: string;
  triggers: Array<{
    type: 'time_on_page' | 'scroll' | 'exit' | 'click' | 'event';
    value: number | string;
  }>;
  cooldown?: Array<{
    answered: 'SHOWED' | 'PARTIAL' | 'COMPLETED';
    cooldownDays: number;
  }>;
  actions?: {
    accept?:   { label: string; surveyId: string };
    start?:    { label: string };
    back?:     { label: string; cooldownDays?: number };
    complete?: { label: string; surveyId: string; autoCompleteParams: Record<string, unknown>; cooldownDays?: number };
    decline?:  { label: string; cooldownDays?: number };
  };
  surveyId: string;
  productId: string;
  style?: {
    theme: 'light' | 'dark';
    position: 'bottom' | 'bottom-right' | 'bottom-left' | 'top' | 'top-right' | 'top-left' | 'center';
    font?: {
      family: string;   // ej. 'Inter' — un nombre de familia, no un stack CSS
      url?: string;     // opcional: archivo woff2/woff/ttf/otf desde el que cargarla
    };
  };
  segments?: {
    path?: string[];
    lang?: string[];
  };
}
```

## Campos que afectan al comportamiento

- **`title`** — desde 1.5.0, se pinta en la cabecera del popup, a la izquierda del botón de cerrar. Pertenece al popup, así que dos popups sobre el mismo survey pueden llevar títulos distintos, y la cadena vacía es una opción válida: la cabecera se queda solo con el botón de cerrar. El SDK nunca cae al título del propio survey.
- **`triggers`** — cuándo se muestra el popup. Consulta [Triggers](/es/popup-web/guides/triggers/) para la semántica de `value` por tipo.
- **`cooldown`** — cuánto esperar antes de mostrarlo de nuevo, según el progreso del usuario (`SHOWED`, `PARTIAL`, `COMPLETED`).
- **`segments.path`** — lista de rutas donde el popup puede aparecer.
- **`segments.lang`** — idiomas en los que el popup puede aparecer; se comparan como prefijo contra el idioma resuelto en `init()` (`en` coincide con `en-US`). Ese idioma es el `language` que pasaste a `init()`, si no `navigator.language`, si no el locale de `Intl` — así que también funciona en React Native (1.1.8+). Si no se puede resolver ningún idioma, el segmento se ignora y el popup se muestra.
- **`style.theme` / `style.position`** — variante visual.
- **`style.font`** — fuente personalizada para el popup y el survey que contiene. Ver [Fuente personalizada](#fuente-personalizada).

## Fuente personalizada

`style.font` sobreescribe la tipografía por defecto del SDK para un popup concreto. Se aplica al contenedor del popup, a su título, a sus controles de formulario (botones, inputs, selects) y al survey renderizado dentro — también en React Native, donde la fuente se aplica dentro del WebView del survey.

```json
{
  "style": {
    "theme": "light",
    "position": "center",
    "font": {
      "family": "Inter",
      "url": "https://cdn.example.com/fonts/Inter-Regular.woff2"
    }
  }
}
```

| Campo | Obligatorio | Descripción |
| --- | --- | --- |
| `family` | sí | Un único **nombre** de familia (`Inter`, `Roboto`), no un stack CSS. El SDK añade sus propios fallbacks de sistema. |
| `url` | no | URL de un archivo de fuente desde el que cargarla. Omítela si la fuente ya está disponible en el dispositivo o la carga tu página. |

Cómo se comporta:

- **Solo `family`** — el SDK aplica la familia y deja que la plataforma la resuelva. Úsalo para fuentes de sistema o fuentes que tu app ya carga; si el dispositivo no puede resolverla, se usa el fallback de sistema.
- **`family` + `url`** — el SDK inyecta un único `@font-face` (deduplicado entre renders) con `font-display: swap`, y deriva el `format()` de la extensión del archivo (`.woff2`, `.woff`, `.ttf`, `.otf`).
- **Saneado** — de `family` se eliminan todos los caracteres que no sean letras, dígitos, espacios, `.`, `_` o `-`; una `url` solo se acepta si es `http(s):` o `data:` y no contiene comillas, `<`/`>`, backslashes, espacios ni caracteres de control. Los valores que no pasan se ignoran en lugar de inyectarse.
- **Omitido** — el popup mantiene la tipografía por defecto del SDK. No se inyecta nada.

:::note
Los formatos no soportados (por ejemplo `.eot`) se cargan sin pista explícita de `format()`, así que el navegador puede rechazarlos. Usa preferentemente `woff2`.
:::

## Dónde se configura esto

Las definiciones de popup se crean y editan en **Deepdots**, no en tu código. Los campos de arriba se listan para que tu equipo entienda exactamente qué palancas hay disponibles al configurar un popup.

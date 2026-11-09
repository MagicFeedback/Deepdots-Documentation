---
title: Compatibilidad de versiones de encuesta
description: Con qué SDK de encuestas pinta cada SDK de popup y qué versiones de encuesta asignadas en el Admin sigue.
sidebar:
  hidden: true
pagefind: false
head:
  - tag: meta
    attrs:
      name: robots
      content: noindex
---

Cada encuesta tiene una **versión de encuesta** en el Admin (*Survey frontend version*: **latest** o una versión fijada). Cada versión de encuesta es una release de la app de encuestas construida con una versión de `@magicfeedback/native`, el **SDK de encuestas** que pinta las preguntas.

Desde **el SDK de popup web 1.19.0 y nativo 0.7.11**, un popup pinta su encuesta con el SDK de encuestas de la versión asignada en el Admin, como hace la página de la encuesta, siempre que el SDK de popup soporte ese SDK de encuestas. Los SDK de popup anteriores usan siempre el SDK de encuestas que llevan dentro.

:::note
El nativo 0.7.10 se etiquetó pero nunca se publicó. Actualiza las apps nativas de 0.7.9 directamente a 0.7.11.
:::

## SDK de popup

| SDK de popup | SDK de encuestas incluido | SDK de encuestas soportados | Versiones de encuesta que sigue |
|---|---|---|---|
| Web 1.19.0 y posteriores (`@magicfeedback/popup-sdk`) | 2.2.39 | 2.2.38, 2.2.39 | 3.4.1, 3.6.0 |
| Nativo 0.7.11 y posteriores (Android, iOS) | 2.2.39 | 2.2.38, 2.2.39 | 3.4.1, 3.6.0 |
| Web 1.18.0 y anteriores | 2.2.37 (1.18.0) | Fijo | Ninguna: siempre el SDK de encuestas incluido |
| Nativo 0.7.9 y anteriores | 2.2.31 (0.7.9) | Fijo | Ninguna: siempre el SDK de encuestas incluido |

## Versiones de encuesta

| Versión de encuesta | SDK de encuestas | La siguen los popups (web 1.19.0+, nativo 0.7.11+) | Producción |
|---|---|---|---|
| 3.6.0 | 2.2.39 | Sí | Candidata (se puede fijar) |
| 3.4.1 | 2.2.39 | Sí | Candidata (se puede fijar) |
| 3.2.1 | 2.2.36 | No: SDK de encuestas incluido | Candidata |
| 3.2.0 | 2.2.36 | No: SDK de encuestas incluido | Estable (latest) |
| 3.1.0 | 2.2.35 | No: SDK de encuestas incluido | Estable |
| 3.0.0 y anteriores | Sin registrar | No: SDK de encuestas incluido | Estable u obsoleta |

Producción, según el registro de versiones el 9 de noviembre de 2026. La lista al día, con el estado de cada versión de encuesta en producción, está en `GET https://api.deepdots.com/sdk/survey-versions` (pública, de solo lectura).

## Cuándo usa el popup el SDK de encuestas incluido

El popup vuelve al SDK de encuestas que lleva dentro cuando:

- la versión de encuesta asignada en el Admin usa un SDK de encuestas que el SDK de popup no soporta (ver la tabla);
- la API no envía la versión de encuesta con el popup (API anterior);
- el SDK de encuestas asignado no se puede descargar (sin red, o una Content-Security-Policy que bloquea `cdn.jsdelivr.net` y `unpkg.com`).

La encuesta sigue funcionando: se ve y se comporta como el SDK de encuestas incluido. El JavaScript y los estilos de un SDK de encuestas cambian siempre juntos.

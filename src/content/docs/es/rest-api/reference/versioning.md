---
title: Versiones y cambios
description: Cómo se mantiene estable la API REST de Deepdots, cómo se anuncian los cambios y qué tener en cuenta en tu integración.
sidebar:
  order: 3
---

Los endpoints de esta documentación son una parte central de Deepdots y los tratamos como estables.

## A qué nos comprometemos

- **Ningún cambio incompatible sin una versión nueva.** Eliminar o renombrar un campo, cambiar su tipo, hacer obligatorio un campo o cambiar un código de respuesta solo ocurriría en una versión nueva del endpoint. La versión actual sigue funcionando.
- **Aviso con antelación.** Antes de que una versión nueva sustituya a una antigua, te avisamos con tiempo y mantenemos ambas en marcha mientras migras.
- **Los cambios se anuncian.** Cada cambio aparece en el [changelog](/es/rest-api/reference/changelog/).

## Cambios que pueden llegar en cualquier momento

No rompen una integración bien construida, así que se publican sin versión nueva:

- Campos opcionales nuevos en una petición.
- Campos nuevos en una respuesta.
- Endpoints nuevos.
- Valores nuevos en `status` y otros campos de texto.

## Qué tener en cuenta en tu integración

Mantener tu integración al día te corresponde a ti. Para facilitarlo:

- **Ignora los campos que no conozcas.** No falles cuando una respuesta traiga un campo que no esperabas.
- **No dependas del orden de los campos** en los objetos JSON ni del texto exacto de los mensajes de error. Usa el código de estado.
- **Lee el changelog** cuando anunciemos un cambio y prueba contra el entorno de desarrollo (`https://api-dev.deepdots.com`) antes de que llegue a producción.
- **Mantén un contacto registrado** con nosotros, para que los anuncios lleguen a quienes mantienen la integración.

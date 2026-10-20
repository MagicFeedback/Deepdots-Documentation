---
title: Modelos
description: Shapes de datos retornados por la API de Deepdots — objetos de feedback, contacto, campaña, sesión, producto y pregunta.
---

El SDK retorna dicts de Python planos. Los shapes a continuación describen las claves que puedes esperar en cada objeto.

## Feedback

Retornado por `feedbacks.create()`, `feedbacks.get()` y `feedbacks.get_id()`. (`feedbacks.update()` y `feedbacks.delete()` retornan un dict vacío.)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único |
| `name` | string | Etiqueta legible |
| `type` | string | Tipo de fuente (`"APP"`, `"SURVEY"`, `"DOCUMENT"`) |
| `identity` | string | Identidad de la fuente (`"MAGICFORM"`, …) |
| `integrationId` | string | UUID de la integración vinculada |
| `companyId` | string | Identificador de empresa |
| `productId` | string | Identificador de producto |
| `text` | string | Texto libre del feedback |
| `answers` | Answer[] | Lista de respuestas enviadas |
| `questions` | Question[] | Snapshot de preguntas al momento de la submission |
| `status` | string | Estado de procesamiento: `"REGISTERED"` al recibirse, luego `"PROCESSING"` y después `"DONE"`, `"PARTIAL"`, `"ERROR"` o `"EMPTY"`; `"DEPRECATED"` después de `delete()` (el feedback eliminado solo se retorna si filtras por `status`) |
| `metrics` | Metric[] | Valores de métricas enviados con el feedback (en `create()` o `update()`). Las métricas que deriva el análisis, por ejemplo a partir de las respuestas, no se incluyen aquí |
| `metadata` | Metadata[] | Entradas de metadatos clave/valor personalizadas |
| `crmContactId` | string \| None | ID del contacto CRM vinculado |
| `external_id` | string | ID del registro en el sistema de origen |
| `externalGeneratedAt` | string | Cuándo se creó el feedback en el sistema de origen — la fecha que usa el panel. Se retorna exactamente como se envió (recomendado: UTC ISO 8601, como `"2026-10-06T11:00:00.000Z"`); por defecto, el momento en que la API lo recibió |
| `externalUpdatedAt` | string | Cuándo se modificó el registro por última vez en el sistema de origen. Se retorna exactamente como se envió; por defecto, el momento en que la API lo recibió |
| `externalUrl` | string | Enlace al registro original |
| `createdAt` | string | Timestamp ISO 8601 del momento en que la API recibió el feedback |
| `updatedAt` | string | Timestamp de última actualización ISO 8601 |

Defines `external_id`, `externalGeneratedAt`, `externalUpdatedAt` y `externalUrl` al crear el feedback. Los tres últimos se pueden cambiar después con `update()`; `external_id`, no. Ver [Campos del sistema de origen](/es/python-sdk/guides/feedback/#campos-del-sistema-de-origen).

### Answer

| Campo | Tipo | Descripción |
|---|---|---|
| `key` | string | `ref` de la pregunta a la que pertenece esta respuesta |
| `value` | string[] | Uno o más valores de respuesta |

### Metric

| Campo | Tipo | Descripción |
|---|---|---|
| `key` | string | Nombre de la métrica |
| `value` | string[] | Uno o más valores, como strings (ej. `["9"]`) |

### Metadata

| Campo | Tipo | Descripción |
|---|---|---|
| `key` | string | Clave de metadatos |
| `value` | string[] | Uno o más valores de metadatos |

## Contacto

Retornado por `contacts.create()`, `contacts.get()` y `contacts.update()`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único |
| `name` | string | Nombre |
| `lastname` | string | Apellido |
| `email` | string | Dirección de correo |
| `companyId` | string | Identificador de empresa |
| `createdAt` | string | Timestamp de creación ISO 8601 |
| `updatedAt` | string | Timestamp de última actualización ISO 8601 |

## Campaña

Retornado por `campaigns.create()` y `campaigns.get()`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único |
| `name` | string | Nombre de la campaña |
| `companyId` | string | Identificador de empresa |
| `createdAt` | string | Timestamp de creación ISO 8601 |
| `updatedAt` | string | Timestamp de última actualización ISO 8601 |

## Sesión

Retornado por `campaigns.create_session()` y `campaigns.get_sessions()`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único |
| `campaignId` | string | ID de la campaña padre |
| `crmContactId` | string[] | IDs de los contactos en esta sesión |
| `createdAt` | string | Timestamp de creación ISO 8601 |

## Producto

Retornado por `products.get()`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único / clave del producto |
| `name` | string | Nombre a mostrar |
| `companyId` | string | Empresa propietaria |

## Pregunta de Integración

Retornado por `integrations_questions.get()`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único |
| `ref` | string | Clave de respuesta — usa esto en `answers[].key` al crear feedback |
| `title` | string | Texto de la pregunta que se muestra a los encuestados |
| `type` | string | Tipo de pregunta (ej. `"TEXT"`, `"LONGTEXT"`, `"RATING_NUMBER"`) |
| `integrationId` | string | Integración a la que pertenece esta pregunta |

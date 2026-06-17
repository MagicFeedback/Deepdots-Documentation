---
title: Modelos
description: Shapes de datos retornados por la API de MagicFeedback — objetos de feedback, contacto, campaña, sesión, producto y pregunta.
---

El SDK retorna dicts de Python planos. Los shapes a continuación describen las claves que puedes esperar en cada objeto.

## Feedback

Retornado por `feedbacks.create()`, `feedbacks.get()`, `feedbacks.get_id()` y `feedbacks.update()`.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único |
| `name` | string | Etiqueta legible |
| `type` | string | Tipo de fuente (`"APP"`, `"DOCUMENT"`, …) |
| `identity` | string | Identidad del renderer (`"MAGICFORM"`, …) |
| `integrationId` | string | UUID de la integración vinculada |
| `companyId` | string | Identificador de empresa |
| `productId` | string | Identificador de producto |
| `answers` | Answer[] | Lista de respuestas enviadas |
| `questions` | Question[] | Snapshot de preguntas al momento de la submission |
| `createdAt` | string | Timestamp de creación ISO 8601 |
| `updatedAt` | string | Timestamp de última actualización ISO 8601 |

### Answer

| Campo | Tipo | Descripción |
|---|---|---|
| `key` | string | Clave de la pregunta a la que pertenece esta respuesta |
| `value` | string[] | Uno o más valores de respuesta |

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
| `key` | string | Clave de respuesta — usa esto en `answers[].key` al crear feedback |
| `type` | string | Tipo de pregunta (ej. `"TEXT"`, `"RATING"`) |
| `label` | string | Etiqueta legible de la pregunta |
| `integrationId` | string | Integración a la que pertenece esta pregunta |

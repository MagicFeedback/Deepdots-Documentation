---
title: Endpoints
description: Petición y respuesta de cada endpoint de feedback y contactos de la API REST de Deepdots.
sidebar:
  order: 1
---

Todos los endpoints reciben y devuelven JSON. Todos salvo los dos de `/auth/token` necesitan `Authorization: Bearer <token>` (ver [Autenticación](/es/rest-api/getting-started/authentication/)).

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/auth/token` | Inicia sesión con el email y la contraseña de un usuario de API |
| `POST` | `/auth/token/refresh` | Renueva un token de inicio de sesión |
| `POST` | `/feedbacks` | Envía un feedback |
| `POST` | `/feedbacks/bulk` | Envía muchos feedbacks de una compañía y un producto |
| `GET` | `/feedbacks/{id}` | Lee un feedback |
| `POST` | `/crm/contacts/upsert` | Crea o actualiza un contacto por email |
| `POST` | `/crm/contacts/upsert/batch` | Crea o actualiza hasta 500 contactos |
| `PATCH` | `/crm/contacts/{id}/fields` | Actualiza los campos personalizados y los datos de un contacto |
| `GET` | `/crm/contacts` | Busca contactos |

---

## `POST /auth/token`

Inicia sesión con el email y la contraseña de un usuario de API. No necesita cabecera `Authorization`.

**Cuerpo**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `email` | string | Sí | |
| `password` | string | Sí | |

**Respuesta `200`:**

| Campo | Tipo | Notas |
|---|---|---|
| `idToken` | string | Envíalo como `Authorization: Bearer <idToken>` |
| `refreshToken` | string | Para `POST /auth/token/refresh` |
| `expiresIn` | number | Segundos hasta que caduca `idToken` (3600) |
| `tokenType` | string | Siempre `Bearer` |

**Errores:** `401` con un email o contraseña incorrectos, `403` cuando el usuario está deshabilitado, `429` tras demasiados intentos fallidos, `422` cuando falta un campo.

---

## `POST /auth/token/refresh`

Obtén un `idToken` nuevo sin volver a enviar la contraseña. No necesita cabecera `Authorization`.

**Cuerpo**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `refreshToken` | string | Sí | El del inicio de sesión o de la renovación anterior |

**Respuesta `200`:** los mismos campos que `POST /auth/token`, con un `refreshToken` nuevo para la próxima vez.

**Errores:** `401` cuando el token de refresco no es válido o ha caducado (vuelve a iniciar sesión), `403` cuando el usuario está deshabilitado.

---

## `POST /feedbacks`

Envía un feedback.

**Cuerpo**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `integrationId` | string | Sí | Rellena `companyId`, `productId`, `type` e `identity` cuando no los envías |
| `external_id` | string | Recomendado | Tu id. Un `external_id` existente para la misma integración devuelve ese feedback en lugar de crear uno nuevo |
| `name` | string | No | |
| `text` | string | No | Texto libre |
| `answers` | array de `{key, value: string[]}` | No | |
| `metrics` | array de `{key, value}` | No | |
| `metadata` | array de `{key, value}` | No | |
| `externalGeneratedAt` | string ISO 8601 | No | Por defecto, ahora |
| `externalUpdatedAt` | string ISO 8601 | No | Por defecto, ahora |
| `externalUrl` | string | No | |
| `crmContactId` | string | No | Un contacto de la misma compañía |

**Respuesta `200`:** el feedback, incluidos `id`, `status` (`REGISTERED` si es nuevo) y `createdAt`.

**Errores:** `404` cuando no se puede leer la integración, `400` cuando pertenece a otra compañía, `422` cuando el cuerpo no es válido.

---

## `POST /feedbacks/bulk`

Envía muchos feedbacks de una compañía y un producto.

**Cuerpo**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `company` | string | Sí | Tu `companyId` |
| `product` | string | Sí | Tu `productId` |
| `feedbacks` | array | Sí | Los mismos campos que `POST /feedbacks`, más `type` e `identity`, que aquí son obligatorios |

**Respuesta `200`:** la lista de feedbacks creados. Los feedbacks cuyo `external_id` ya existe para la misma integración se omiten y no se devuelven.

**Errores:** `400` cuando falta `company` o `product` o no existen, o un feedback indica otra compañía u otro producto. `422` cuando el cuerpo no es válido.

---

## `GET /feedbacks/{id}`

Lee un feedback por su `id` de Deepdots.

**Respuesta `200`:** el feedback. `status` es `DONE` cuando ya se ha analizado.

---

## `POST /crm/contacts/upsert`

Crea o actualiza un contacto, buscándolo por email dentro de tu compañía.

**Cuerpo**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `email` | string | Sí | Sin espacios y en minúsculas. Es la clave de búsqueda; una actualización nunca lo cambia |
| `name`, `lastname` | string | No | |
| `externalId` | string | No | Tu id para el contacto |
| `phone`, `address`, `city`, `state`, `postalCode` | string | No | |
| `country` | string | No | ISO 3166-1 alpha-2 |
| `customFields` | object | No | Los valores son strings, números o booleanos. Se fusionan al actualizar; `null` elimina una clave |

**Respuesta `200`:** el contacto, incluido `id`.

**Errores:** `400` para un email no válido, `406` cuando la compañía no es tuya, `422` cuando el cuerpo no es válido.

---

## `POST /crm/contacts/upsert/batch`

Crea o actualiza hasta 500 contactos en una sola petición.

**Cuerpo**

```json
{ "items": [ { "email": "...", "customFields": { } } ] }
```

Cada elemento tiene los mismos campos que `POST /crm/contacts/upsert`.

**Respuesta `200`**

```json
{
  "contacts": 2,
  "created": 1,
  "updated": 0,
  "failed": [{ "index": 1, "email": "bad", "error": "Invalid email format." }]
}
```

**Errores:** `400` cuando `items` está vacío o tiene más de 500 elementos. Los errores de elementos individuales se devuelven en `failed`.

---

## `PATCH /crm/contacts/{id}/fields`

Actualiza los campos personalizados y los datos de contacto de un contacto.

**Cuerpo**

| Campo | Tipo | Notas |
|---|---|---|
| `customFields` | object | Se fusionan: las claves que envías se fijan, `null` elimina una clave y el resto se mantiene |
| `name`, `lastname`, `phone`, `address`, `city`, `state`, `postalCode` | string | Se sobrescriben cuando se envían |

Cualquier otro campo se rechaza con `400`. `email` y `externalId` no se pueden cambiar aquí.

**Respuesta `200`**

```json
{ "id": "<contact-id>", "customFields": { "tier": "platinum" } }
```

**Errores:** `406` cuando el contacto no existe o no es tuyo.

---

## `GET /crm/contacts`

Busca contactos con un parámetro de consulta `filter` (JSON):

| Clave | Ejemplo |
|---|---|
| `where` | `{"where": {"externalId": "SF-0035g00000XyZ12"}}` |
| `limit` | `{"limit": 100}` |
| `skip` | `{"skip": 100}` |
| `order` | `{"order": ["createdAt DESC"]}` |

**Respuesta `200`:** una lista de contactos. Solo se devuelven los contactos activos de tu compañía.

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
| `POST` | `/crm/contacts/upsert` | Crea o actualiza un contacto por email o por `externalId` |
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
| `crmContactId` | string | No | Un contacto activo de la misma compañía |

**Respuesta `200`:** el feedback, incluidos `id`, `status` (`REGISTERED` si es nuevo) y `createdAt`.

**Errores:** `404` cuando no se puede leer la integración o `crmContactId` no es un contacto activo que puedas ver, `400` cuando la integración, o el contacto de `crmContactId`, pertenece a otra compañía, `422` cuando el cuerpo no es válido.

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

**Errores:** `400` cuando `company` o `product` están vacíos o no existen, un feedback indica otra compañía u otro producto, o un `crmContactId` pertenece a otra compañía. `404` cuando un `crmContactId` no es un contacto activo que puedas ver, y entonces no se guarda ningún feedback de la petición. `422` cuando el cuerpo no es válido, por ejemplo sin `company` o `product`.

---

## `GET /feedbacks/{id}`

Lee un feedback por su `id` de Deepdots.

**Respuesta `200`:** el feedback. `status` es `DONE` cuando ya se ha analizado.

---

## `POST /crm/contacts/upsert`

Crea o actualiza un contacto de tu compañía, buscándolo por email entre los contactos activos o, en su defecto, por `externalId`.

**Cuerpo**

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `email` | string | Sí | Sin espacios y en minúsculas. Es la primera clave de búsqueda, entre los contactos activos. Un contacto encontrado por `externalId` toma este email |
| `name` | string | Sí | |
| `lastname` | string | No | |
| `externalId` | string | No | Tu id para el contacto. Es la clave de búsqueda cuando ningún contacto activo tiene el email |
| `phone`, `address`, `city`, `state`, `postalCode` | string | No | |
| `country` | string | No | ISO 3166-1 alpha-2, en minúsculas (`dk`) |
| `customFields` | object | No | Los valores son strings, números o booleanos. Se fusionan al actualizar; `null` elimina una clave |

**Respuesta `200`:** el contacto, incluidos `id` y `status`. Un contacto encontrado por `externalId` puede estar `UNSUBSCRIBED`.

**Errores:** `400` para un email no válido, `406` cuando la compañía no es tuya, `422` cuando el cuerpo no es válido (por ejemplo, falta `name` o `country` está en mayúsculas).

---

## `POST /crm/contacts/upsert/batch`

Crea o actualiza hasta 500 contactos en una sola petición.

**Cuerpo**

```json
{ "items": [ { "email": "...", "name": "...", "customFields": { } } ] }
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

**Errores:** `400` cuando `items` está vacío o tiene más de 500 elementos, `422` cuando algún elemento no se ajusta a los campos de `POST /crm/contacts/upsert`; en ese caso no se guarda nada. Los demás errores de elementos individuales, como un email no válido, se devuelven en `failed`, y el resto se guarda.

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

**Errores:** `406` cuando el contacto no existe, no es tuyo o no está activo (dado de baja o eliminado).

---

## `GET /crm/contacts`

Busca contactos con un parámetro de consulta `filter` (JSON):

| Clave | Ejemplo |
|---|---|
| `where` | `{"where": {"externalId": "SF-0035g00000XyZ12"}}` |
| `limit` | `{"limit": 100}` |
| `skip` | `{"skip": 100}` |
| `order` | `{"order": ["createdAt DESC"]}` |

**Respuesta `200`:** una lista de los contactos de tu compañía. Solo se devuelven los activos, salvo que tu `where` tenga una clave `status` en su primer nivel. `status` es `ACTIVE`, `UNSUBSCRIBED` o `DEPRECATED` (eliminado).

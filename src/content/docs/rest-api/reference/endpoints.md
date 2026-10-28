---
title: Endpoints
description: Request and response of every feedback and contact endpoint in the Deepdots REST API.
sidebar:
  order: 1
---

All endpoints take and return JSON. All of them except the two `/auth/token` ones need `Authorization: Bearer <token>` (see [Authentication](/rest-api/getting-started/authentication/)).

| Method | Path | What it does |
|---|---|---|
| `POST` | `/auth/token` | Sign in with an API user's email and password |
| `POST` | `/auth/token/refresh` | Renew a signed-in token |
| `POST` | `/feedbacks` | Send one feedback |
| `POST` | `/feedbacks/bulk` | Send many feedbacks for one company and product |
| `GET` | `/feedbacks/{id}` | Read one feedback |
| `POST` | `/crm/contacts/upsert` | Create or update one contact by email |
| `POST` | `/crm/contacts/upsert/batch` | Create or update up to 500 contacts |
| `PATCH` | `/crm/contacts/{id}/fields` | Update a contact's custom fields and details |
| `GET` | `/crm/contacts` | Find contacts |

---

## `POST /auth/token`

Sign in with an API user's email and password. Needs no `Authorization` header.

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | |
| `password` | string | Yes | |

**Response `200`:**

| Field | Type | Notes |
|---|---|---|
| `idToken` | string | Send it as `Authorization: Bearer <idToken>` |
| `refreshToken` | string | For `POST /auth/token/refresh` |
| `expiresIn` | number | Seconds until `idToken` expires (3600) |
| `tokenType` | string | Always `Bearer` |

**Errors:** `401` for a wrong email or password, `403` when the user is disabled, `429` after too many failed attempts, `422` when a field is missing.

---

## `POST /auth/token/refresh`

Get a new `idToken` without sending the password again. Needs no `Authorization` header.

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `refreshToken` | string | Yes | From the sign-in or the previous refresh |

**Response `200`:** the same fields as `POST /auth/token`, with a new `refreshToken` to use next time.

**Errors:** `401` when the refresh token is invalid or expired (sign in again), `403` when the user is disabled.

---

## `POST /feedbacks`

Send one feedback.

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `integrationId` | string | Yes | Fills in `companyId`, `productId`, `type` and `identity` when you leave them out |
| `external_id` | string | Recommended | Your id. An existing `external_id` for the same integration returns that feedback instead of creating a new one |
| `name` | string | No | |
| `text` | string | No | Free text |
| `answers` | array of `{key, value: string[]}` | No | |
| `metrics` | array of `{key, value}` | No | |
| `metadata` | array of `{key, value}` | No | |
| `externalGeneratedAt` | ISO 8601 string | No | Defaults to now |
| `externalUpdatedAt` | ISO 8601 string | No | Defaults to now |
| `externalUrl` | string | No | |
| `crmContactId` | string | No | A contact of the same company |

**Response `200`:** the feedback, including `id`, `status` (`REGISTERED` when new) and `createdAt`.

**Errors:** `404` when the integration can't be read, `400` when it belongs to another company, `422` when the body is not valid.

---

## `POST /feedbacks/bulk`

Send many feedbacks for one company and product.

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `company` | string | Yes | Your `companyId` |
| `product` | string | Yes | Your `productId` |
| `feedbacks` | array | Yes | Same fields as `POST /feedbacks`, plus `type` and `identity`, which are required here |

**Response `200`:** the list of feedbacks created. Feedbacks whose `external_id` already exists for the same integration are skipped and not returned.

**Errors:** `400` when `company` or `product` is missing or doesn't exist, or a feedback names another company or product. `422` when the body is not valid.

---

## `GET /feedbacks/{id}`

Read one feedback by its Deepdots `id`.

**Response `200`:** the feedback. `status` is `DONE` once it has been analysed.

---

## `POST /crm/contacts/upsert`

Create or update one contact, matched by email within your company.

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | Trimmed and lowercased. The match key, never changed by an update |
| `name`, `lastname` | string | No | |
| `externalId` | string | No | Your id for the contact |
| `phone`, `address`, `city`, `state`, `postalCode` | string | No | |
| `country` | string | No | ISO 3166-1 alpha-2 |
| `customFields` | object | No | Values are strings, numbers or booleans. Merged on update; `null` removes a key |

**Response `200`:** the contact, including `id`.

**Errors:** `400` for an invalid email, `406` when the company is not yours, `422` when the body is not valid.

---

## `POST /crm/contacts/upsert/batch`

Create or update up to 500 contacts in one request.

**Body**

```json
{ "items": [ { "email": "...", "customFields": { } } ] }
```

Each item has the same fields as `POST /crm/contacts/upsert`.

**Response `200`**

```json
{
  "contacts": 2,
  "created": 1,
  "updated": 0,
  "failed": [{ "index": 1, "email": "bad", "error": "Invalid email format." }]
}
```

**Errors:** `400` when `items` is empty or has more than 500 entries. Errors on single items are returned in `failed`.

---

## `PATCH /crm/contacts/{id}/fields`

Update a contact's custom fields and contact details.

**Body**

| Field | Type | Notes |
|---|---|---|
| `customFields` | object | Merged: keys you send are set, `null` removes a key, the rest are kept |
| `name`, `lastname`, `phone`, `address`, `city`, `state`, `postalCode` | string | Overwritten when sent |

Any other field is rejected with `400`. `email` and `externalId` can't be changed here.

**Response `200`**

```json
{ "id": "<contact-id>", "customFields": { "tier": "platinum" } }
```

**Errors:** `406` when the contact doesn't exist or is not yours.

---

## `GET /crm/contacts`

Find contacts with a `filter` query parameter (JSON):

| Key | Example |
|---|---|
| `where` | `{"where": {"externalId": "SF-0035g00000XyZ12"}}` |
| `limit` | `{"limit": 100}` |
| `skip` | `{"skip": 100}` |
| `order` | `{"order": ["createdAt DESC"]}` |

**Response `200`:** a list of contacts. Only active contacts of your company are returned.

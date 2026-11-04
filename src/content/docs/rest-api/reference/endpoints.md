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
| `POST` | `/crm/contacts/upsert` | Create or update one contact by email or `externalId` |
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
| `crmContactId` | string | No | An active contact of the same company |

**Response `200`:** the feedback, including `id`, `status` (`REGISTERED` when new) and `createdAt`.

**Errors:** `404` when the integration can't be read or `crmContactId` is not an active contact you can see, `400` when the integration, or the contact in `crmContactId`, belongs to another company, `422` when the body is not valid.

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

**Errors:** `400` when `company` or `product` is empty or doesn't exist, a feedback names another company or product, or a `crmContactId` belongs to another company. `404` when a `crmContactId` is not an active contact you can see, and then no feedback of the request is saved. `422` when the body is not valid, for example without `company` or `product`.

---

## `GET /feedbacks/{id}`

Read one feedback by its Deepdots `id`.

**Response `200`:** the feedback. `status` is `DONE` once it has been analysed.

---

## `POST /crm/contacts/upsert`

Create or update one contact in your company, matched by email among active contacts, or else by `externalId`.

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `email` | string | Yes | Trimmed and lowercased. Matched first, among active contacts. A contact matched by `externalId` takes this email |
| `name` | string | Yes | |
| `lastname` | string | No | |
| `externalId` | string | No | Your id for the contact. Matched when no active contact has the email |
| `phone`, `address`, `city`, `state`, `postalCode` | string | No | |
| `country` | string | No | ISO 3166-1 alpha-2, lowercase (`dk`) |
| `customFields` | object | No | Values are strings, numbers or booleans. Merged on update; `null` removes a key |

**Response `200`:** the contact, including `id` and `status`. A contact matched by `externalId` can be `UNSUBSCRIBED`.

**Errors:** `400` for an invalid email, `406` when the company is not yours, `422` when the body is not valid (for example a missing `name` or an uppercase `country`).

---

## `POST /crm/contacts/upsert/batch`

Create or update up to 500 contacts in one request.

**Body**

```json
{ "items": [ { "email": "...", "name": "...", "customFields": { } } ] }
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

**Errors:** `400` when `items` is empty or has more than 500 entries, `422` when any item doesn't match the fields of `POST /crm/contacts/upsert`; nothing is saved then. Other errors on single items, such as an invalid email, are returned in `failed`, and the rest are saved.

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

**Errors:** `406` when the contact doesn't exist, is not yours, or is not active (unsubscribed or deleted).

---

## `GET /crm/contacts`

Find contacts with a `filter` query parameter (JSON):

| Key | Example |
|---|---|
| `where` | `{"where": {"externalId": "SF-0035g00000XyZ12"}}` |
| `limit` | `{"limit": 100}` |
| `skip` | `{"skip": 100}` |
| `order` | `{"order": ["createdAt DESC"]}` |

**Response `200`:** a list of your company's contacts. Only active ones are returned, unless your `where` has a top-level `status` key. `status` is `ACTIVE`, `UNSUBSCRIBED` or `DEPRECATED` (deleted).

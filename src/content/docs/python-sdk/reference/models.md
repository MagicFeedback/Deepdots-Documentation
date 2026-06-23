---
title: Models
description: Data shapes returned by the MagicFeedback API — feedback, contact, campaign, session, product, and question objects.
---

The SDK returns plain Python dicts. The shapes below describe the keys you can expect on each object.

## Feedback

Returned by `feedbacks.create()`, `feedbacks.get()`, `feedbacks.get_id()`, and `feedbacks.update()`.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Human-readable label |
| `type` | string | Source type (`"APP"`, `"DOCUMENT"`, …) |
| `identity` | string | Renderer identity (`"MAGICFORM"`, …) |
| `integrationId` | string | UUID of the linked integration |
| `companyId` | string | Company identifier |
| `productId` | string | Product identifier |
| `answers` | Answer[] | List of submitted answers |
| `questions` | Question[] | Snapshot of questions at submission time |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-update timestamp |

### Answer

| Field | Type | Description |
|---|---|---|
| `key` | string | Question key this answer belongs to |
| `value` | string[] | One or more answer values |

## Contact

Returned by `contacts.create()`, `contacts.get()`, and `contacts.update()`.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | First name |
| `lastname` | string | Last name |
| `email` | string | Email address |
| `companyId` | string | Company identifier |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-update timestamp |

## Campaign

Returned by `campaigns.create()` and `campaigns.get()`.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Campaign name |
| `companyId` | string | Company identifier |
| `createdAt` | string | ISO 8601 creation timestamp |
| `updatedAt` | string | ISO 8601 last-update timestamp |

## Session

Returned by `campaigns.create_session()` and `campaigns.get_sessions()`.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `campaignId` | string | ID of the parent campaign |
| `crmContactId` | string[] | IDs of the contacts in this session |
| `createdAt` | string | ISO 8601 creation timestamp |

## Product

Returned by `products.get()`.

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier / product key |
| `name` | string | Display name |
| `companyId` | string | Owning company |

## Integration Question

Returned by `integrations_questions.get()`.

| Field | Type | Description |
|---|---|---|
| `key` | string | Answer key — use this in `answers[].key` when creating feedback |
| `type` | string | Question type (e.g. `"TEXT"`, `"RATING"`) |
| `label` | string | Human-readable question label |
| `integrationId` | string | Integration this question belongs to |

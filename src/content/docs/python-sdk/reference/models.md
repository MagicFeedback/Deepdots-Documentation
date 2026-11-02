---
title: Models
description: Data shapes returned by the Deepdots API — feedback, contact, campaign, session, product, and question objects.
---

The SDK returns plain Python dicts. The shapes below describe the keys you can expect on each object.

## Feedback

Returned by `feedbacks.create()`, `feedbacks.get()`, and `feedbacks.get_id()`. (`feedbacks.update()` and `feedbacks.delete()` return an empty dict.)

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Human-readable label |
| `type` | string | Source type (`"APP"`, `"SURVEY"`, `"DOCUMENT"`) |
| `identity` | string | Source identity (`"MAGICFORM"`, …) |
| `integrationId` | string | UUID of the linked integration |
| `companyId` | string | Company identifier |
| `productId` | string | Product identifier |
| `text` | string | Free text of the feedback |
| `answers` | Answer[] | List of submitted answers |
| `questions` | Question[] | Snapshot of questions at submission time |
| `status` | string | Processing status: `"REGISTERED"` when received, then `"PROCESSING"`, then `"DONE"`, `"PARTIAL"`, `"ERROR"` or `"EMPTY"`; `"DEPRECATED"` after `delete()` (deleted feedback is returned only when you filter on `status`) |
| `metrics` | Metric[] | Metric values sent with the feedback (in `create()` or `update()`). Metrics the analysis derives, for example from answers, are not included here |
| `metadata` | Metadata[] | Custom key/value metadata entries |
| `crmContactId` | string \| None | ID of the linked CRM contact |
| `external_id` | string | ID of the record in the source system |
| `externalGeneratedAt` | string | When the feedback was created in the source system — the date the dashboard uses. Returned exactly as it was sent (recommended: UTC ISO 8601 such as `"2026-10-06T11:00:00.000Z"`); defaults to the time the API received it |
| `externalUpdatedAt` | string | When the record was last changed in the source system. Returned exactly as it was sent; defaults to the time the API received it |
| `externalUrl` | string | Link to the original record |
| `createdAt` | string | ISO 8601 timestamp of when the API received the feedback |
| `updatedAt` | string | ISO 8601 last-update timestamp |

You set `external_id`, `externalGeneratedAt`, `externalUpdatedAt` and `externalUrl` when you create the feedback. The last three can be changed later with `update()`; `external_id` cannot. See [Source-system fields](/python-sdk/guides/feedback/#source-system-fields).

### Answer

| Field | Type | Description |
|---|---|---|
| `key` | string | `ref` of the question this answer belongs to |
| `value` | string[] | One or more answer values |

### Metric

| Field | Type | Description |
|---|---|---|
| `key` | string | Metric name |
| `value` | string[] | One or more values, as strings (e.g. `["9"]`) |

### Metadata

| Field | Type | Description |
|---|---|---|
| `key` | string | Metadata key |
| `value` | string[] | One or more metadata values |

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
| `id` | string | Unique identifier |
| `ref` | string | Answer key — use this in `answers[].key` when creating feedback |
| `title` | string | Question text shown to respondents |
| `type` | string | Question type (e.g. `"TEXT"`, `"LONGTEXT"`, `"RATING_NUMBER"`) |
| `integrationId` | string | Integration this question belongs to |

---
title: API Reference
description: Complete reference for every public class and method in the Deepdots Python SDK.
---

## Deepdots

The main entry point. Import and instantiate once; reuse the client across your application.

```python
from deepdots_sdk import Deepdots

client = Deepdots(
    user="you@example.com",
    password="your-password",
    base_url="https://api.magicfeedback.io",  # optional
)
```

### Constructor parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `user` | string | — | Account email address |
| `password` | string | — | Account password |
| `base_url` | string | `"https://api.magicfeedback.io"` | API root URL |
| `auth_source` | string | `"datastore"` | Where the token comes from. Pass `"identity"` to log in with `user` and `password`, which is what you want outside Deepdots' own Google Cloud. The default first looks for a token cached in Deepdots' Google Cloud Datastore and logs in with `user` and `password` when there is none |

The constructor logs in straight away. A token lasts about an hour.

### Properties

| Property | Type | Description |
|---|---|---|
| `feedbacks` | `FeedbackAPI` | Feedback submission operations |
| `contacts` | `ContactsAPI` | CRM contact operations |
| `campaigns` | `CampaignsAPI` | Campaign and session operations |
| `products` | `ProductsAPI` | Product listing |
| `metrics` | `MetricsAPI` | Metrics retrieval |
| `integrations_questions` | `IntegrationsQuestionsAPI` | Questions for an integration |
| `reports` | `ReportsAPI` | Reporting endpoints |
| `crm` | `CrmAPI` | CRM objects and connectors (SDK 1.0.23) |
| `companies` | `CompaniesAPI` | Company listing |
| `requests` | `RequestsAPI` | Research requests |
| `signals` | `SignalsAPI` | Signals |

### Methods

#### `set_logging(level)`

Configure the SDK's internal logger.

```python
import logging
client.set_logging(logging.DEBUG)
```

#### `refresh_token()`

Gets a new token (with the same `auth_source`) and updates every sub-API in place. Call it in a long-running process when requests start failing with 401. `client.crm` does this by itself.

---

## FeedbackAPI

Access via `client.feedbacks`.

### `create(feedback)`

| Parameter | Type | Description |
|---|---|---|
| `feedback` | dict | Feedback payload (see [Managing Feedback](/python-sdk/guides/feedback/)) |

Checks that the required keys are present (raising `ValueError` if one is missing), wraps bare `value`s in lists (see [Answer value wrapping](/python-sdk/guides/feedback/#answer-value-wrapping)), and sends `feedback` as the JSON body of `POST /feedbacks` with your keys unchanged. Returns the created feedback object. If `external_id` matches a feedback that already exists for the same company, product and integration and has not been deleted, it returns that existing feedback unchanged instead.

### `get(filter=None)`

| Parameter | Type | Description |
|---|---|---|
| `filter` | dict \| None | LoopBack filter (see [Querying](/python-sdk/guides/querying/)) |

Returns a list of feedback objects.

### `get_id(feedback_id, filter=None)`

| Parameter | Type | Description |
|---|---|---|
| `feedback_id` | string | ID of the feedback to retrieve |
| `filter` | dict \| None | Optional field/include filter |

Returns a single feedback object.

### `update(feedback_id, feedback)`

| Parameter | Type | Description |
|---|---|---|
| `feedback_id` | string | ID of the feedback to update |
| `feedback` | dict | Fields to change |

Sends `PATCH /feedbacks/{feedback_id}` with only the fields you pass. Returns an empty dict (`{}`), because the API answers `204 No Content`. Include `"status": "REGISTERED"` to have the feedback analysed again (see [Re-run the analysis](/python-sdk/guides/feedback/#re-run-the-analysis)).

### `update_metadata_batch(items, mode=None)`

| Parameter | Type | Description |
|---|---|---|
| `items` | list | `[{"feedbackId": str, "metadata": [{"key": str, "value": [str]}]}]` |
| `mode` | string \| None | `"append"` adds values to the ones a key holds; by default they are replaced (SDK 1.0.22) |

Adds or overwrites the metadata keys you send on many feedbacks in one request, keeps every other key, and queues each feedback for a new analysis. Returns `{"feedbacks", "triggered", "failed"}`. Raises `HTTPError` (404) and writes nothing if any feedback doesn't exist or isn't accessible. See [Add metadata to many feedbacks at once](/python-sdk/guides/feedback/#add-metadata-to-many-feedbacks-at-once). SDK 1.0.21.

### `delete(feedback_id)`

| Parameter | Type | Description |
|---|---|---|
| `feedback_id` | string | ID of the feedback to delete |

Retires the feedback (its status becomes `DEPRECATED`, and it is hidden from reports and from reads that do not filter on `status`). Returns an empty dict (`{}`).

### `upload_attachment(feedback_id, file_path, filename=None, extra_data=None, max_attachments=3, check_duplicate_content=True)`

| Parameter | Type | Description |
|---|---|---|
| `feedback_id` | string | ID of the feedback to attach the file to |
| `file_path` | string | Path to the file on disk |
| `filename` | string \| None | Display name — defaults to the file's base name |
| `extra_data` | dict \| None | Any JSON-serialisable dict stored with the attachment |
| `max_attachments` | int | Most attachments a feedback may have (SDK 1.0.20) |
| `check_duplicate_content` | bool | Refuse a file whose content is already attached (SDK 1.0.20) |

Uploads the file as a multipart request. Returns the created attachment object. Raises `ValueError` without uploading when the feedback already has `max_attachments` files, when the same content is already attached, or when its attachments can't be read.

---

## ContactsAPI

Access via `client.contacts`.

### `create(contact)`

| Parameter | Type | Description |
|---|---|---|
| `contact` | dict | Contact payload (see [Contacts](/python-sdk/guides/contacts/)) |

Returns the created contact object.

### `get(filter=None)`

Returns a list of contact objects.

### `update(contact_id, contact)`

| Parameter | Type | Description |
|---|---|---|
| `contact_id` | string | ID of the contact to update |
| `contact` | dict | Fields to change |

Returns the updated contact object.

### `upsert(contact)`

| Parameter | Type | Description |
|---|---|---|
| `contact` | dict | Contact payload; `name`, `email` and `companyId` are required |

Updates the company's active contact with the same email, or creates one. On an update, the fields you send are overwritten and `customFields` is merged. Returns the contact. See [Create or update by email](/python-sdk/guides/contacts/#create-or-update-by-email). SDK 1.0.22.

### `upsert_batch(items, chunk_size=500)`

| Parameter | Type | Description |
|---|---|---|
| `items` | list | Contacts, each like `upsert()`'s |
| `chunk_size` | int | Contacts per request, 1 to 500 |

Upserts a list of any length, 500 contacts per request. Returns `{"contacts", "created", "updated", "failed"}`; each `failed` entry's `index` points into `items`. SDK 1.0.22.

### `update_fields(contact_id, custom_fields=None, **native_fields)`

| Parameter | Type | Description |
|---|---|---|
| `contact_id` | string | ID of the contact |
| `custom_fields` | dict \| None | Custom fields to add or change; `None` as a value removes that field |
| `**native_fields` | | Any of `name`, `lastname`, `phone`, `address`, `city`, `state`, `postalCode` |

Adds or changes the custom fields you send and keeps the others. Returns `{"id", "customFields"}`. See [Update custom fields](/python-sdk/guides/contacts/#update-custom-fields). SDK 1.0.22.

### `delete(contact_id)`

| Parameter | Type | Description |
|---|---|---|
| `contact_id` | string | ID of the contact to delete |

Returns the deleted contact object.

---

## CrmAPI

Access via `client.crm`. SDK 1.0.23. See [CRM objects](/python-sdk/guides/crm-objects/).

Every method sends 500 records per request, resends a request that fails temporarily (502, 503, 504, a connection error or a 300-second timeout) up to 3 times, and logs in again once when the token has expired. When a request still fails, it raises a `requests.RequestException`. Write methods return totals over all requests, and each `failed` entry's `index` points into the list you passed.

### `upsert_objects(object_type, items, company_id=None, chunk_size=500)`

| Parameter | Type | Description |
|---|---|---|
| `object_type` | string | Lowercase letters, digits and `_`, e.g. `"match"` |
| `items` | list | Objects; each needs an `externalId` (see [Store objects](/python-sdk/guides/crm-objects/#store-objects)) |
| `company_id` | string \| None | Required for admin accounts (the API answers 400 without it). Other users write to their own company by default; they can also name another company they belong to, and any other company is refused with 403. The same applies to the other `CrmAPI` methods |
| `chunk_size` | int | Records per request, 1 to 500 |

Returns `{"count", "created", "updated", "failed"}`; a `failed` entry is `{"index", "externalId", "error"}`.

### `get_objects(object_type, company_id=None, external_id=None, status=None, parent_type=None, parent_key=None, contact_key=None, limit=None, after=None)`

Returns a list of objects of one type, ordered by `externalId`. Filters match exactly. `limit` defaults to 100 (at most 1000); pass the last `externalId` you received as `after` for the next page.

### `sync_fck_users(users, company_id=None, chunk_size=500)`

Creates or updates contacts from FCK user objects, sent as they are. Returns `{"count", "created", "updated", "failed"}`; a `failed` entry is `{"index", "id", "error"}`.

### `ingest_roboticket(lines, company_id=None, chunk_size=500)`

Stores Roboticket ticket and membership lines, sent as they are. Returns `{"count", "applied", "ignored", "failed"}`; a `failed` entry is `{"index", "id", "error"}`.

---

## CampaignsAPI

Access via `client.campaigns`.

### `create(campaign)`

| Parameter | Type | Description |
|---|---|---|
| `campaign` | dict | Campaign payload (see [Campaigns](/python-sdk/guides/campaigns/)) |

Returns the created campaign object.

### `get(filter=None)`

Returns a list of campaign objects.

### `create_session(campaign_id, session)`

| Parameter | Type | Description |
|---|---|---|
| `campaign_id` | string | ID of the campaign to add a session to |
| `session` | dict | Session payload — must include `crmContactId` (string[]) |

Returns the created session object.

### `get_sessions(campaign_id, filter=None)`

| Parameter | Type | Description |
|---|---|---|
| `campaign_id` | string | ID of the campaign |
| `filter` | dict \| None | Optional LoopBack filter |

Returns a list of session objects.

### `get_sessions_feedbacks(campaign_id, filter=None)`

| Parameter | Type | Description |
|---|---|---|
| `campaign_id` | string | ID of the campaign |
| `filter` | dict \| None | Optional LoopBack filter |

Returns a list of feedback objects linked to this campaign's sessions.

---

## ProductsAPI

Access via `client.products`.

### `get(filter=None)`

Returns a list of product objects registered under your account.

---

## MetricsAPI

Access via `client.metrics`.

### `get(filter=None)`

Returns a list of metric objects.

---

## IntegrationsQuestionsAPI

Access via `client.integrations_questions`.

### `get(integration_id, filter=None)`

| Parameter | Type | Description |
|---|---|---|
| `integration_id` | string | UUID of the integration |
| `filter` | dict \| None | Optional LoopBack filter |

Returns the list of questions configured for the given integration. Use this to look up valid answer keys before creating feedback: each question's `ref` is the `key` to use in `answers`.

```python
questions = client.integrations_questions.get("YOUR_INTEGRATION_ID")
for q in questions:
    print(q["ref"], q["type"], q["title"])
```

---

## ReportsAPI

Access via `client.reports`.

### `get(filter=None)`

Returns general report data.

### `get_newsletter(filter=None)`

Returns newsletter-specific report data.

### `update(report_id, report)`

| Parameter | Type | Description |
|---|---|---|
| `report_id` | string | ID of the report to update |
| `report` | dict | Fields to change |

Returns the updated report object.

### `regenerate(report_id, body=None)`

| Parameter | Type | Description |
|---|---|---|
| `report_id` | string | ID of the report to regenerate |
| `body` | dict \| None | Optional publish configuration |

Republishes the report by calling `POST /reporting/report/{report_id}/publish`. Returns the response from the publish endpoint.

---

## Error handling

All HTTP errors raise `requests.exceptions.HTTPError`. Wrap calls in a try/except when you need to handle specific status codes:

```python
import requests

try:
    feedback = client.feedbacks.create({…})
except requests.exceptions.HTTPError as e:
    print(e.response.status_code, e.response.text)
```

Client-side validation (missing required fields) raises `ValueError` before the request is sent.

`client.crm` methods resend temporary failures themselves (see [CrmAPI](#crmapi)). When they still fail they can also raise `requests.ConnectionError` or `requests.Timeout`, so catch `requests.RequestException` around them.

Status codes you may see:

| Status | Meaning |
|---|---|
| `400` | The request is malformed or not allowed — for example a filter value containing `&` or `#` (see [Querying](/python-sdk/guides/querying/)), or a `crmContactId` from a different company than the feedback's, when your user can access both companies (a contact in a company you cannot access returns `404`) |
| `401` | The token is missing, invalid or expired, or your user is deactivated. Tokens expire after about an hour: in long-running jobs such as an import, create a new client (or, from SDK 1.0.17, call `client.refresh_token()`) and retry |
| `403` | You filtered on a company your user cannot access, for example a wrong `companyId` in `where` |
| `404` | Something the request refers to does not exist or is not visible to you — for example a `crmContactId`, a campaign or a report |
| `405` | Your user's role does not allow this operation (e.g. updating feedback) |
| `406` | The record does not exist, was deleted, or belongs to a company you cannot access — for example `feedbacks.get_id()`, `update()` or `delete()` on such a feedback (these return 406, not 404) |
| `422` | The request body is invalid — an unknown or misspelled field, a wrong type, or a value outside the allowed list |

A `422` response lists every problem in `details`; with the SDK, read it from the exception as `e.response.json()["error"]["details"]`. For example, sending `externalId` instead of `external_id` returns:

```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid. See error object `details` property for more info.",
    "code": "VALIDATION_FAILED",
    "details": [
      {
        "path": "",
        "code": "additionalProperties",
        "message": "must NOT have additional properties",
        "info": {"additionalProperty": "externalId"}
      }
    ]
  }
}
```

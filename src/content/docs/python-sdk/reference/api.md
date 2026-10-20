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

### Methods

#### `set_logging(level)`

Configure the SDK's internal logger.

```python
import logging
client.set_logging(logging.DEBUG)
```

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

### `delete(feedback_id)`

| Parameter | Type | Description |
|---|---|---|
| `feedback_id` | string | ID of the feedback to delete |

Retires the feedback (its status becomes `DEPRECATED`, and it is hidden from reports and from reads that do not filter on `status`). Returns an empty dict (`{}`).

### `upload_attachment(feedback_id, file_path, filename=None, extra_data=None)`

| Parameter | Type | Description |
|---|---|---|
| `feedback_id` | string | ID of the feedback to attach the file to |
| `file_path` | string | Path to the file on disk |
| `filename` | string \| None | Display name — defaults to the file's base name |
| `extra_data` | dict \| None | Any JSON-serialisable dict stored with the attachment |

Uploads the file as a multipart request. Returns the created attachment object.

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

### `delete(contact_id)`

| Parameter | Type | Description |
|---|---|---|
| `contact_id` | string | ID of the contact to delete |

Returns the deleted contact object.

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

Status codes you may see:

| Status | Meaning |
|---|---|
| `400` | The request is malformed or not allowed — for example a filter value containing `&` or `#` (see [Querying](/python-sdk/guides/querying/)), or a `crmContactId` that belongs to another company |
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

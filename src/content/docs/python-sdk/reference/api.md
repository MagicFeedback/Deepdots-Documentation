---
title: API Reference
description: Complete reference for every public class and method in the MagicFeedback Python SDK.
---

## MagicFeedback

The main entry point. Import and instantiate once; reuse the client across your application.

```python
from magicfeedback_sdk import MagicFeedback

client = MagicFeedback(
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

Returns the created feedback object.

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

Returns the updated feedback object.

### `delete(feedback_id)`

| Parameter | Type | Description |
|---|---|---|
| `feedback_id` | string | ID of the feedback to delete |

Returns the deleted feedback object.

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

Returns the list of questions configured for the given integration. Use this to look up valid answer keys before creating feedback.

```python
questions = client.integrations_questions.get("0eb9d270-6dd7-11ef-9987-21e04f383573")
for q in questions:
    print(q["key"], q["type"])
```

---

## ReportsAPI

Access via `client.reports`.

### `get(filter=None)`

Returns general report data.

### `get_newsletter(filter=None)`

Returns newsletter-specific report data.

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

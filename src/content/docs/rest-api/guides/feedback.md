---
title: Sending feedback
description: Send feedback with answers, metrics and metadata, one at a time or in bulk, without creating duplicates.
sidebar:
  order: 1
---

A feedback is one response from one person: a survey answer, a review, a support conversation. You send it with `POST /feedbacks`, or many at once with `POST /feedbacks/bulk`.

## Send one feedback

```bash
curl -X POST "https://api.deepdots.com/feedbacks" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "<your-integration-id>",
    "external_id": "survey-2026-10-26-000123",
    "name": "Post-purchase survey",
    "externalGeneratedAt": "2026-10-26T09:41:00Z",
    "answers": [
      {"key": "nps", "value": ["9"]},
      {"key": "comment", "value": ["The staff were really helpful"]}
    ],
    "metrics": [
      {"key": "store", "value": "Copenhagen Central"},
      {"key": "channel", "value": "email"}
    ],
    "metadata": [
      {"key": "order_id", "value": "10045"}
    ]
  }'
```

The response is the stored feedback, with its Deepdots `id`.

### Fields

| Field | Type | Description |
|---|---|---|
| `integrationId` | string | **Required.** The source this feedback comes from. Deepdots gives you one per source. |
| `external_id` | string | Recommended. Your own id for this feedback. Prevents duplicates (see below). |
| `name` | string | A short label shown in the dashboard. |
| `externalGeneratedAt` | string (ISO 8601) | When the feedback was given. Defaults to the time of the request. |
| `externalUpdatedAt` | string (ISO 8601) | When the feedback was last changed in your system. |
| `externalUrl` | string | A link back to the feedback in your system. |
| `answers` | array | The answers: `{"key": "<question>", "value": ["<answer>"]}`. `value` is always a list. |
| `text` | string | Free text, for feedback that is not a set of answers (a review, a conversation). |
| `metrics` | array | Values you want to filter and group by in the dashboard: `{"key": "<name>", "value": "<value>"}`. |
| `metadata` | array | Extra context kept with the feedback: `{"key": "<name>", "value": "<value>"}`. |
| `crmContactId` | string | The contact who gave the feedback. See [Contacts](/rest-api/guides/contacts/#link-feedback-to-a-contact). |

`companyId`, `productId`, `type` and `identity` are taken from the integration. You only send them if Deepdots asks you to.

:::tip[Metrics or metadata?]
Use **metrics** for what people will filter on: store, region, channel, customer tier. Use **metadata** for context you want to keep but not filter on, such as an order number.
:::

## Avoid duplicates

Send `external_id` with every feedback. If a feedback with the same `external_id` already exists for that integration, the API **does not create a new one**: it answers `200` with the existing feedback.

That makes retries safe. If a request times out, send it again with the same `external_id`.

## Send many feedbacks at once

`POST /feedbacks/bulk` takes a list of feedbacks for one company and product:

```bash
curl -X POST "https://api.deepdots.com/feedbacks/bulk" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "<your-company-id>",
    "product": "<your-product-id>",
    "feedbacks": [
      {
        "integrationId": "<your-integration-id>",
        "type": "SURVEY",
        "identity": "CUSTOM",
        "external_id": "survey-000124",
        "answers": [{"key": "nps", "value": ["10"]}]
      },
      {
        "integrationId": "<your-integration-id>",
        "type": "SURVEY",
        "identity": "CUSTOM",
        "external_id": "survey-000125",
        "answers": [{"key": "nps", "value": ["6"]}]
      }
    ]
  }'
```

Differences from `POST /feedbacks`:

- `company` and `product` are **required**, and every feedback in the list must belong to them.
- Nothing is taken from the integration: each feedback needs its own `type` and `identity`. Deepdots tells you which values to use.
- The response is the list of feedbacks **created**. Feedbacks whose `external_id` already existed are skipped and left out of the response, so a retried bulk does not create duplicates.

See [Batches and limits](/rest-api/guides/batch-and-limits/) for batch sizes.

## Next steps

- [Contacts](/rest-api/guides/contacts/) — record who gave each feedback.
- [Endpoints](/rest-api/reference/endpoints/) — the full request and response of each call.

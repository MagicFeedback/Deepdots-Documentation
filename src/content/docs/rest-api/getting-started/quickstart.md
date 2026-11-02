---
title: Quickstart
description: Get a token, send a feedback and read it back, in three requests.
sidebar:
  order: 2
---

This quickstart sends one feedback to the development environment. You need the credentials and the `integrationId` described in [Authentication](/rest-api/getting-started/authentication/).

## 1. Get a token

```bash
export DEEPDOTS_TOKEN=$(curl -s -X POST "https://api-dev.deepdots.com/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"email": "api-user@yourcompany.com", "password": "your-password"}' \
  | jq -r .idToken)
```

## 2. Send a feedback

```bash
curl -X POST "https://api-dev.deepdots.com/feedbacks" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "<your-integration-id>",
    "external_id": "order-10045",
    "name": "Order 10045",
    "answers": [
      {"key": "nps", "value": ["9"]},
      {"key": "comment", "value": ["Fast delivery, great service"]}
    ]
  }'
```

The API answers with the stored feedback. Keep its `id`:

```json
{
  "id": "5f0c2a10-...",
  "status": "REGISTERED",
  "integrationId": "<your-integration-id>",
  "companyId": "YOUR_COMPANY",
  "external_id": "order-10045",
  ...
}
```

:::note
Company, product, type and identity are taken from the integration, so you don't need to send them.
:::

## 3. Read it back

```bash
curl "https://api-dev.deepdots.com/feedbacks/<feedback-id>" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

`status` moves from `REGISTERED` to `DONE` once Deepdots has analysed the feedback. From then on it shows up in the dashboard.

## Next steps

- [Feedback](/rest-api/guides/feedback/) — metrics, metadata, bulk sends and duplicates.
- [Contacts](/rest-api/guides/contacts/) — create contacts and link them to feedback.

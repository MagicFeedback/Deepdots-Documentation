---
title: Batches, limits and retries
description: How large a request can be, how to retry safely and how to handle partial failures.
sidebar:
  order: 3
---

## Limits

| What | Limit |
|---|---|
| Contacts per `POST /crm/contacts/upsert/batch` | 500 |
| Request body | 1 MB |
| Token lifetime | 1 hour |

For `POST /feedbacks/bulk`, keep each request under the 1 MB body limit. A few hundred feedbacks per request is a good size.

## Retry safely

- **Feedback:** always send `external_id`. A retried request returns the feedback that already exists instead of creating a second one.
- **Contacts:** use the upsert endpoints. Sending the same contact again after the first request has answered updates it instead of creating a duplicate. Don't send the same contact in two requests at the same time: both can create it.
- **When to retry:** on network errors, timeouts and `5xx` responses, with an increasing wait between attempts (for example 1 s, 2 s, 4 s). Retry a `401` once, after refreshing the token.
- **When not to retry:** `400`, `404`, `406` and `422` mean the request itself is wrong. Fix it before sending it again.

## Partial failures

`POST /crm/contacts/upsert/batch` handles each contact on its own. A malformed request fails the whole call, and nothing is saved: `400` for an empty list or more than 500 items, and `422` when an item doesn't match the contact fields (a missing `name` or `email`, an unknown field, a value of the wrong type, or a `country` the API doesn't accept, such as an uppercase code). An error found while saving one contact, such as an invalid email, is listed in `failed` and the rest are saved:

```json
{
  "contacts": 3,
  "created": 1,
  "updated": 1,
  "failed": [
    {"index": 2, "email": "not-an-email", "error": "Invalid email format."}
  ]
}
```

Check `failed` after every batch and resend only those items once they are fixed.

`POST /feedbacks/bulk` validates the whole request first: if anything is wrong, nothing is saved.

## Next steps

- [Errors](/rest-api/reference/errors/) — every status code and what it means.

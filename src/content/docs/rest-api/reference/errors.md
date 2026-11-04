---
title: Errors
description: The error format and every status code the Deepdots REST API returns.
sidebar:
  order: 2
---

## Error format

Errors come back as JSON with an `error` object:

```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid. See error object `details` property for more info.",
    "details": [
      {
        "path": "/answers/0",
        "code": "type",
        "message": "must be object"
      }
    ]
  }
}
```

`details` is only there for validation errors (`422`) and lists each field that failed.

## Status codes

| Status | Meaning | Retry? |
|---|---|---|
| `200` | Success | — |
| `400` | The request is wrong: an invalid email, a company or product that is empty or doesn't exist, a field `PATCH /crm/contacts/{id}/fields` doesn't take, or an integration or contact of another company | No, fix the request |
| `401` | The token is missing, invalid or expired | Once, after refreshing the token |
| `403` | The API user is not active | No, contact Deepdots |
| `404` | The integration doesn't exist or is not visible to you, or `crmContactId` is not an active contact you can see | No |
| `405` | The API user lacks permission for this endpoint | No, contact Deepdots |
| `406` | The company or contact is not yours, a feedback you read with `GET /feedbacks/{id}` doesn't exist or is not visible to you, or the contact you update is not active | No |
| `422` | The body doesn't match the schema (see `details`): a missing or unknown field, a value of the wrong type, or a value that isn't allowed, such as an uppercase `country` | No, fix the request |
| `429` | Too many failed sign-ins for this account (`/auth/token` only) | Yes, after a wait |
| `5xx` | A problem on our side | Yes, with an increasing wait |

If a `5xx` persists, or you see an error you can't explain, send us the request time, the endpoint and the `external_id` (or email) involved.

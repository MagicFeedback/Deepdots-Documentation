---
title: Managing contacts
description: Create or update CRM contacts by email, keep their custom fields in sync and link them to feedback.
sidebar:
  order: 2
---

Contacts are the people behind your feedback. Each contact belongs to your company and is identified by its **email**.

## Create or update a contact

Use `POST /crm/contacts/upsert`. If a contact with that email already exists in your company it is updated, otherwise it is created:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anna.jensen@example.com",
    "name": "Anna",
    "lastname": "Jensen",
    "externalId": "SF-0035g00000XyZ12",
    "country": "DK",
    "customFields": {
      "tier": "gold",
      "customer_since": "2019-04-01",
      "newsletter": true,
      "lifetime_orders": 42
    }
  }'
```

The response is the contact, with its Deepdots `id`.

### How updates work

- The email is the match key. It is stored trimmed and lowercased, so `Anna.Jensen@Example.com` and `anna.jensen@example.com` are the same contact.
- Fields you send are overwritten. Fields you leave out are kept.
- `customFields` are **merged**: the keys you send are added or updated, a key sent as `null` is removed, and every other custom field is kept.

:::caution
`POST /crm/contacts` also exists, but it **always creates** a new contact, even if the email is already there. Use the upsert so you never get duplicates.
:::

### Fields

| Field | Type | Description |
|---|---|---|
| `email` | string | **Required.** The contact's email, and the key used to find it. |
| `name`, `lastname` | string | The contact's name. |
| `externalId` | string | Your own id for the contact, for example its id in your CRM. |
| `phone`, `address`, `city`, `state`, `postalCode` | string | Contact details. |
| `country` | string | ISO 3166-1 alpha-2 code, for example `DK`. |
| `customFields` | object | Your own fields. Each value is a string, a number or a boolean. |

## Many contacts at once

`POST /crm/contacts/upsert/batch` upserts up to **500** contacts in one request:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert/batch" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"email": "anna.jensen@example.com", "customFields": {"tier": "gold"}},
      {"email": "lars.nielsen@example.com", "customFields": {"tier": "silver"}}
    ]
  }'
```

Each contact is handled like a single upsert. One bad item does not stop the rest: it is reported in `failed`, with its position in the list.

```json
{
  "contacts": 2,
  "created": 1,
  "updated": 1,
  "failed": []
}
```

## Update only some fields

When you already have the contact's Deepdots `id`, `PATCH /crm/contacts/{id}/fields` updates its custom fields (merged the same way) and its contact details:

```bash
curl -X PATCH "https://api.deepdots.com/crm/contacts/<contact-id>/fields" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customFields": {"tier": "platinum", "newsletter": null},
    "city": "Aarhus"
  }'
```

The response is the contact's `id` and its `customFields` after the merge. This endpoint does not change `email` or `externalId`.

## Find a contact

`GET /crm/contacts` takes a `filter` to find contacts, for example by your own id:

```bash
curl -G "https://api.deepdots.com/crm/contacts" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  --data-urlencode 'filter={"where": {"externalId": "SF-0035g00000XyZ12"}, "limit": 1}'
```

## Link feedback to a contact

To record who gave a feedback, send the contact's Deepdots `id` as `crmContactId` when you send the feedback:

```bash
curl -X POST "https://api.deepdots.com/feedbacks" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "<your-integration-id>",
    "external_id": "survey-000126",
    "crmContactId": "<contact-id>",
    "answers": [{"key": "nps", "value": ["8"]}]
  }'
```

The contact must belong to the same company as the feedback. Deepdots keeps a copy of the contact's fields as they were when the feedback was given, so later changes to the contact do not rewrite past feedback.

A typical flow: upsert the contact, keep the `id` it returns, then send the feedback with that `crmContactId`.

## Next steps

- [Batches and limits](/rest-api/guides/batch-and-limits/) — batch sizes, retries and errors.
- [Endpoints](/rest-api/reference/endpoints/) — the full request and response of each call.

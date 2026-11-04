---
title: Managing contacts
description: Create or update CRM contacts by email or your own id, keep their custom fields in sync and link them to feedback.
sidebar:
  order: 2
---

Contacts are the people behind your feedback. Each contact belongs to your company and is found by its **email**, or by your own `externalId`.

## Create or update a contact

Use `POST /crm/contacts/upsert`. It updates your company's active contact with that email, or else the one with the `externalId` you send, and creates a contact when there is neither:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anna.jensen@example.com",
    "name": "Anna",
    "lastname": "Jensen",
    "externalId": "SF-0035g00000XyZ12",
    "country": "dk",
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

- The email is matched first. It is stored trimmed and lowercased, so `Anna.Jensen@Example.com` and `anna.jensen@example.com` are the same contact. Only active contacts are matched by email.
- When no active contact has that email, the contact with the `externalId` you send is updated instead, whatever its status: it takes the new email, and becomes active again if it was deleted. An unsubscribed contact stays unsubscribed: the response has `"status": "UNSUBSCRIBED"`, and the contact can't be linked to feedback.
- When no contact has the `externalId` you send, or you send none, a new contact is created, even if an unsubscribed or deleted contact has that email. Send your `externalId` whenever you have one, so a person who unsubscribed is matched instead of coming back as a new, active contact.
- Several contacts can have the same `externalId`, for example contacts created before the change of November 2026, or two contacts created by requests sent at the same time. Then only one of them is updated: the oldest active one, or else the oldest unsubscribed one, or else the oldest deleted one.
- Fields you send are overwritten. Fields you leave out are kept.
- `customFields` are **merged**: the keys you send are added or updated, a key sent as `null` is removed, and every other custom field is kept.

:::caution
`POST /crm/contacts` also exists. When your company already has a contact with the `externalId` you send, it updates and returns that contact the same way, instead of creating one; if your API user may create contacts but not update them, the contact comes back unchanged. Otherwise it **always creates** a new contact, even if the email is already there. Use the upsert to avoid duplicates.
:::

### Fields

| Field | Type | Description |
|---|---|---|
| `email` | string | **Required.** The contact's email, and the first key used to find it. |
| `name` | string | **Required.** The contact's first name. |
| `lastname` | string | The contact's last name. |
| `externalId` | string | Your own id for the contact, for example its id in your CRM. Used to find the contact when no active contact has the email. |
| `phone`, `address`, `city`, `state`, `postalCode` | string | Contact details. |
| `country` | string | ISO 3166-1 alpha-2 code in lowercase, for example `dk`. A value the API doesn't accept, such as `DK`, is rejected with `422`. |
| `customFields` | object | Your own fields. Each value is a string, a number or a boolean. |

## Many contacts at once

`POST /crm/contacts/upsert/batch` upserts up to **500** contacts in one request:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert/batch" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"email": "anna.jensen@example.com", "name": "Anna", "customFields": {"tier": "gold"}},
      {"email": "lars.nielsen@example.com", "name": "Lars", "customFields": {"tier": "silver"}}
    ]
  }'
```

Each contact is handled like a single upsert. A contact that fails on its own, such as one with an invalid email, is reported in `failed` with its position in the list, and the rest are saved. A contact that doesn't match the fields above, for example one without `name`, makes the whole request fail with `422`, and nothing is saved.

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

The response is the contact's `id` and its `customFields` after the merge. This endpoint does not change `email` or `externalId`, and only works on an active contact: for an unsubscribed or deleted one it answers `406`.

## Find a contact

`GET /crm/contacts` takes a `filter` to find contacts, for example by your own id:

```bash
curl -G "https://api.deepdots.com/crm/contacts" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  --data-urlencode 'filter={"where": {"externalId": "SF-0035g00000XyZ12"}, "limit": 1}'
```

It returns only active contacts unless your `where` has a `status` key at its top level (`ACTIVE`, `UNSUBSCRIBED`, or `DEPRECATED` for a deleted contact), so don't use it to decide whether to create a contact: the upsert also finds unsubscribed and deleted contacts by their `externalId`.

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

The contact must be active and belong to the same company as the feedback. Deepdots keeps a copy of the contact's fields as they were when the feedback was given, so later changes to the contact do not rewrite past feedback.

A typical flow: upsert the contact, keep the `id` it returns, then send the feedback with that `crmContactId`. Only an active contact can be linked, so check the `status` the upsert returns.

## Next steps

- [Batches and limits](/rest-api/guides/batch-and-limits/) — batch sizes, retries and errors.
- [Endpoints](/rest-api/reference/endpoints/) — the full request and response of each call.

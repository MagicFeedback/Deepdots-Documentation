---
title: Managing Contacts
description: Create, update, upsert, list and delete CRM contacts with the Deepdots Python SDK.
---

Contacts represent the people in your CRM — customers, users, or any individual you want to associate with campaigns or feedback.

## Create a contact

```python
contact = client.contacts.create({
    "name": "Jane",
    "lastname": "Smith",
    "email": "jane.smith@example.com",
    "companyId": "YOUR_COMPANY_ID",
})
print(contact["id"])
```

### Required fields

| Field | Type | Description |
|---|---|---|
| `name` | string | First name |
| `lastname` | string | Last name |
| `email` | string | Email address |
| `companyId` | string | Your company identifier |

If the company already has a contact with the `externalId` you send, `create()` doesn't add one: it updates that contact with the fields you send (`email` included, `customFields` merged) and returns it. A deleted contact becomes active again; an unsubscribed one stays unsubscribed. If your role can't update contacts, the contact comes back unchanged. The API has worked this way since November 2026, with every SDK version.

Otherwise, `create()` always adds a new contact, even when the company already has one with the same email. To match by email, use [`upsert()`](#create-or-update-by-email).

Several contacts can still have the same `externalId`, for example contacts created before the change of November 2026, or two contacts created by calls sent at the same time. Then `create()`, and `upsert()` when no active contact has your email, update only one of them: the oldest active one, or else the oldest unsubscribed one, or else the oldest deleted one.

## Create or update by email

`upsert()` updates the company's active contact with the same email (case and surrounding spaces don't matter). If there is none, it updates the contact with the `externalId` you send, which then takes your email and becomes active again if it was deleted; an unsubscribed one stays unsubscribed. If no contact has that `externalId` either, it creates one. Available from SDK 1.0.22.

Only active contacts are matched by email: an unsubscribed or deleted contact is found only through its `externalId`. If you don't send it, `upsert()` creates a new active contact with the same email. An unsubscribed contact can't be sent as a feedback's `crmContactId`, so check the `status` that `create()` or `upsert()` returns before you use its `id` that way.

```python
contact = client.contacts.upsert({
    "name": "Jane",
    "email": "jane.smith@example.com",
    "companyId": "YOUR_COMPANY_ID",
    "customFields": {"loyalty_tier": "gold"},
})
```

`name`, `email` and `companyId` are required. When the contact already exists, the fields you send are overwritten and `customFields` is merged: the custom fields you send are added or changed, and the others are kept. Returns the contact.

### Many contacts at once

`upsert_batch()` does the same for a list of any length. The SDK sends it 500 contacts per request.

```python
result = client.contacts.upsert_batch([
    {"name": "Jane", "email": "jane.smith@example.com", "companyId": "YOUR_COMPANY_ID"},
    {"name": "John", "email": "john.doe@example.com", "companyId": "YOUR_COMPANY_ID"},
])
print(result["created"], result["updated"], result["failed"])
```

A contact that fails on its own (an invalid email, or a company you can't access) is listed in `failed` with its `index` in the list you passed, and the others are still saved. A contact the API can't accept at all — missing `name` or `email`, a field it doesn't know, a value of the wrong type or `None`, or a `country` that isn't a lowercase ISO code — makes the API reject its whole request of up to 500 contacts with a 422, and `upsert_batch()` raises `requests.HTTPError`. The requests sent before it are already saved, and the rest of the list is not sent. Returns `{"contacts", "created", "updated", "failed"}`.

## List contacts

```python
contacts = client.contacts.get()
```

Filter with a LoopBack-style dict (see [Querying](/python-sdk/guides/querying/)):

```python
contacts = client.contacts.get({
    "where": {"companyId": "YOUR_COMPANY_ID"},
    "limit": 100,
})
```

`get()` returns only active contacts unless your `where` has a `status` key at its top level, for example `{"where": {"externalId": "C-1001", "status": "UNSUBSCRIBED"}}`. So don't use it to decide whether to create a contact: `create()` and `upsert()` also find unsubscribed and deleted contacts by their `externalId`.

## Update a contact

Pass only the fields you want to change:

```python
client.contacts.update(contact["id"], {
    "name": "Janet",
})
```

`update()` returns an empty dict (`{}`). `update()`, `update_fields()` and `delete()` only work on active contacts: on an unsubscribed or deleted contact they raise `requests.HTTPError` with HTTP 406.

## Update custom fields

`update()` replaces the whole `customFields` object, so setting one custom field with it deletes all the others. Use `update_fields()` instead. It adds or changes the custom fields you send, keeps the rest, and removes those you set to `None`. Available from SDK 1.0.22.

```python
# Add or change custom fields, keeping the others
client.contacts.update_fields(contact["id"], {"loyalty_tier": "gold", "vip": True})

# Remove a custom field
client.contacts.update_fields(contact["id"], {"loyalty_tier": None})

# Custom fields and native fields in one call
client.contacts.update_fields(contact["id"], {"nps_segment": "promoter"}, city="Copenhagen")
```

Values can be strings, numbers or booleans. As keyword arguments you can also change `name`, `lastname`, `phone`, `address`, `city`, `state` and `postalCode`. Any other field is rejected with a 400; change it with `update()`. Returns `{"id": ..., "customFields": {...}}` with every custom field after the change.

## Delete a contact

```python
client.contacts.delete(contact["id"])
```

:::tip
Store the contact `id` returned by `create()` when you need to reference the contact later — for example, when creating campaign sessions. See [Campaigns](/python-sdk/guides/campaigns/).
:::

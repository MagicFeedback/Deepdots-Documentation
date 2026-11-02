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

`create()` always adds a new contact, even when the company already has one with the same email. To avoid duplicates, use [`upsert()`](#create-or-update-by-email).

## Create or update by email

`upsert()` updates the company's active contact with the same email (case and surrounding spaces don't matter), or creates one when there is none. Available from SDK 1.0.22.

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

## Update a contact

Pass only the fields you want to change:

```python
updated = client.contacts.update(contact["id"], {
    "name": "Janet",
})
```

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

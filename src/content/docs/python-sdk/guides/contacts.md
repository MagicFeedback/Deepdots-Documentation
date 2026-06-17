---
title: Managing Contacts
description: Create, list, update, and delete CRM contacts with the MagicFeedback Python SDK.
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
| `email` | string | Email address (must be unique per company) |
| `companyId` | string | Your company identifier |

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

## Delete a contact

```python
client.contacts.delete(contact["id"])
```

:::tip
Store the contact `id` returned by `create()` when you need to reference the contact later — for example, when creating campaign sessions. See [Campaigns](/python-sdk/guides/campaigns/).
:::

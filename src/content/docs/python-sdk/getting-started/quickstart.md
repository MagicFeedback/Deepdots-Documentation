---
title: Quickstart
description: Install the SDK, authenticate, and make your first API call in under a minute.
---

## 1. Install

```bash
pip install MagicFeedback
```

## 2. Create a client

Import `MagicFeedback` and pass your account credentials. The constructor authenticates immediately and stores the bearer token for all subsequent requests.

```python
from magicfeedback_sdk import MagicFeedback

client = MagicFeedback(
    user="you@example.com",
    password="your-password",
)
```

## 3. Make your first call

List the products registered under your account:

```python
products = client.products.get()
for product in products:
    print(product["id"], product["name"])
```

## 4. Submit a feedback entry

```python
feedback = client.feedbacks.create({
    "name": "First submission",
    "type": "APP",
    "identity": "MAGICFORM",
    "answers": [
        {"key": "rating", "value": "5"},
        {"key": "comment", "value": "Works great!"},
    ],
    "integrationId": "<your-integration-id>",
    "companyId": "<your-company-id>",
    "productId": "<your-product-id>",
})
print(feedback["id"])
```

:::tip
`integrationId`, `companyId`, and `productId` come from your MagicFeedback dashboard. Use `client.products.get()` to retrieve them programmatically.
:::

## Next steps

- [Managing Feedback](/python-sdk/guides/feedback/) — full CRUD for feedback entries
- [Contacts](/python-sdk/guides/contacts/) — create and manage CRM contacts
- [Campaigns](/python-sdk/guides/campaigns/) — organise outreach and track sessions
- [API Reference](/python-sdk/reference/api/) — every class and method in the SDK

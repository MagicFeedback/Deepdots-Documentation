---
title: Quickstart
description: Install the SDK, authenticate, and make your first API call in under a minute.
---

## 1. Install

```bash
pip install deepdots
```

## 2. Create a client

Import `Deepdots` and pass the API key Deepdots gave you. The key is sent on every request; it does not expire.

```python
from deepdots_sdk import Deepdots

client = Deepdots(api_key="dd_live_...")
```

Or sign in with your API user's email and password. The constructor signs in immediately and stores the token for all subsequent requests:

```python
client = Deepdots(
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
`integrationId`, `companyId`, and `productId` come from your Deepdots dashboard. Use `client.products.get()` to retrieve them programmatically.
:::

## Next steps

- [Managing Feedback](/python-sdk/guides/feedback/) — full CRUD for feedback entries
- [Contacts](/python-sdk/guides/contacts/) — create and manage CRM contacts
- [Campaigns](/python-sdk/guides/campaigns/) — organise outreach and track sessions
- [API Reference](/python-sdk/reference/api/) — every class and method in the SDK

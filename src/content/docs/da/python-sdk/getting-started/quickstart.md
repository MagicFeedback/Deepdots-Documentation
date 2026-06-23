---
title: Hurtigstart
description: Installer SDK'en, autentificer og foretag dit første API-kald på under et minut.
---

## 1. Installer

```bash
pip install MagicFeedback
```

## 2. Opret en klient

Importer `MagicFeedback` og send dine kontooplysninger. Konstruktøren autentificerer med det samme og gemmer bearer-tokenet til alle efterfølgende requests.

```python
from magicfeedback_sdk import MagicFeedback

client = MagicFeedback(
    user="dig@eksempel.com",
    password="din-adgangskode",
)
```

## 3. Dit første kald

List produkterne registreret under din konto:

```python
products = client.products.get()
for product in products:
    print(product["id"], product["name"])
```

## 4. Indsend en feedback-post

```python
feedback = client.feedbacks.create({
    "name": "Første submission",
    "type": "APP",
    "identity": "MAGICFORM",
    "answers": [
        {"key": "rating", "value": "5"},
        {"key": "comment", "value": "Fungerer fantastisk!"},
    ],
    "integrationId": "<dit-integration-id>",
    "companyId": "<dit-company-id>",
    "productId": "<dit-product-id>",
})
print(feedback["id"])
```

:::tip
`integrationId`, `companyId` og `productId` kommer fra dit MagicFeedback-dashboard. Brug `client.products.get()` til at hente dem programmatisk.
:::

## Næste skridt

- [Administration af Feedback](/da/python-sdk/guides/feedback/) — fuld CRUD for feedback-poster
- [Kontakter](/da/python-sdk/guides/contacts/) — opret og administrer CRM-kontakter
- [Kampagner](/da/python-sdk/guides/campaigns/) — organiser opsøgende arbejde og spor sessioner
- [API-reference](/da/python-sdk/reference/api/) — alle klasser og metoder i SDK'en

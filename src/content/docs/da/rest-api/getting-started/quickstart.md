---
title: Hurtig start
description: Godkend, send en feedback, og læs den igen, i tre forespørgsler.
sidebar:
  order: 2
---

Denne hurtige start sender én feedback til udviklingsmiljøet. Du skal bruge de loginoplysninger og det `integrationId`, der er beskrevet i [Godkendelse](/da/rest-api/getting-started/authentication/).

## 1. Klargør dine loginoplysninger

Med en API-nøgle til udvikling er nøglen selve tokenet:

```bash
export DEEPDOTS_TOKEN="dd_test_..."
```

Med en API-bruger logger du i stedet ind for at få et:

```bash
export DEEPDOTS_TOKEN=$(curl -s -X POST "https://api-dev.deepdots.com/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"email": "api-user@yourcompany.com", "password": "your-password"}' \
  | jq -r .idToken)
```

## 2. Send en feedback

```bash
curl -X POST "https://api-dev.deepdots.com/feedbacks" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "<your-integration-id>",
    "external_id": "order-10045",
    "name": "Order 10045",
    "answers": [
      {"key": "nps", "value": ["9"]},
      {"key": "comment", "value": ["Fast delivery, great service"]}
    ]
  }'
```

API'et svarer med den gemte feedback. Gem dens `id`:

```json
{
  "id": "5f0c2a10-...",
  "status": "REGISTERED",
  "integrationId": "<your-integration-id>",
  "companyId": "YOUR_COMPANY",
  "external_id": "order-10045",
  ...
}
```

:::note
Virksomhed, produkt, type og identitet hentes fra integrationen, så dem behøver du ikke sende.
:::

## 3. Læs den igen

```bash
curl "https://api-dev.deepdots.com/feedbacks/<feedback-id>" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

`status` skifter fra `REGISTERED` til `DONE`, når Deepdots har analyseret feedbacken. Derefter vises den i dashboardet.

## Næste skridt

- [Feedback](/da/rest-api/guides/feedback/) — metrics, metadata, bulk-afsendelser og dubletter.
- [Kontakter](/da/rest-api/guides/contacts/) — opret kontakter, og knyt dem til feedback.

---
title: Administrer kontakter
description: Opret eller opdater CRM-kontakter ud fra e-mail, hold deres brugerdefinerede felter synkroniseret, og knyt dem til feedback.
sidebar:
  order: 2
---

Kontakter er personerne bag din feedback. Hver kontakt hører til din virksomhed og identificeres ved sin **e-mail**.

## Opret eller opdater en kontakt

Brug `POST /crm/contacts/upsert`. Hvis der allerede findes en kontakt med den e-mail i din virksomhed, bliver den opdateret, ellers bliver den oprettet:

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

Svaret er kontakten med dens Deepdots-`id`.

### Sådan virker opdateringer

- E-mailen er opslagsnøglen. Den gemmes uden mellemrum og med små bogstaver, så `Anna.Jensen@Example.com` og `anna.jensen@example.com` er den samme kontakt.
- Felter, du sender, overskrives. Felter, du udelader, bevares.
- `customFields` **flettes**: de nøgler, du sender, tilføjes eller opdateres, en nøgle sendt som `null` fjernes, og alle andre brugerdefinerede felter bevares.

:::caution
`POST /crm/contacts` findes også, men den **opretter altid** en ny kontakt, også selvom e-mailen allerede findes. Brug upsert, så du aldrig får dubletter.
:::

### Felter

| Felt | Type | Beskrivelse |
|---|---|---|
| `email` | string | **Påkrævet.** Kontaktens e-mail og nøglen, der bruges til at finde den. |
| `name`, `lastname` | string | Kontaktens navn. |
| `externalId` | string | Dit eget id for kontakten, fx dens id i dit CRM. |
| `phone`, `address`, `city`, `state`, `postalCode` | string | Kontaktoplysninger. |
| `country` | string | ISO 3166-1 alpha-2-kode, fx `DK`. |
| `customFields` | object | Dine egne felter. Hver værdi er en string, et tal eller en boolean. |

## Mange kontakter på én gang

`POST /crm/contacts/upsert/batch` laver upsert af op til **500** kontakter i én forespørgsel:

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

Hver kontakt behandles som en enkelt upsert. Ét fejlbehæftet element stopper ikke resten: det rapporteres i `failed` med sin position i listen.

```json
{
  "contacts": 2,
  "created": 1,
  "updated": 1,
  "failed": []
}
```

## Opdater kun nogle felter

Når du allerede har kontaktens Deepdots-`id`, opdaterer `PATCH /crm/contacts/{id}/fields` dens brugerdefinerede felter (flettet på samme måde) og dens kontaktoplysninger:

```bash
curl -X PATCH "https://api.deepdots.com/crm/contacts/<contact-id>/fields" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customFields": {"tier": "platinum", "newsletter": null},
    "city": "Aarhus"
  }'
```

Svaret er kontaktens `id` og dens `customFields` efter fletningen. Dette endpoint ændrer ikke `email` eller `externalId`.

## Find en kontakt

`GET /crm/contacts` tager et `filter` til at finde kontakter, fx ud fra dit eget id:

```bash
curl -G "https://api.deepdots.com/crm/contacts" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  --data-urlencode 'filter={"where": {"externalId": "SF-0035g00000XyZ12"}, "limit": 1}'
```

## Knyt feedback til en kontakt

For at registrere, hvem der gav en feedback, sender du kontaktens Deepdots-`id` som `crmContactId`, når du sender feedbacken:

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

Kontakten skal høre til samme virksomhed som feedbacken. Deepdots gemmer en kopi af kontaktens felter, som de var, da feedbacken blev givet, så senere ændringer på kontakten omskriver ikke tidligere feedback.

Et typisk flow: lav upsert af kontakten, gem det `id`, den returnerer, og send derefter feedbacken med det `crmContactId`.

## Næste skridt

- [Batches og grænser](/da/rest-api/guides/batch-and-limits/) — batchstørrelser, genforsøg og fejl.
- [Endpoints](/da/rest-api/reference/endpoints/) — den fulde forespørgsel og det fulde svar for hvert kald.

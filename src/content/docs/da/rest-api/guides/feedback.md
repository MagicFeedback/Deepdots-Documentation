---
title: Send feedback
description: Send feedback med svar, metrics og metadata, én ad gangen eller i bulk, uden at oprette dubletter.
sidebar:
  order: 1
---

En feedback er ét svar fra én person: et svar på en undersøgelse, en anmeldelse, en supportsamtale. Du sender den med `POST /feedbacks`, eller mange på én gang med `POST /feedbacks/bulk`.

## Send én feedback

```bash
curl -X POST "https://api.deepdots.com/feedbacks" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "<your-integration-id>",
    "external_id": "survey-2026-10-26-000123",
    "name": "Post-purchase survey",
    "externalGeneratedAt": "2026-10-26T09:41:00Z",
    "answers": [
      {"key": "nps", "value": ["9"]},
      {"key": "comment", "value": ["The staff were really helpful"]}
    ],
    "metrics": [
      {"key": "store", "value": "Copenhagen Central"},
      {"key": "channel", "value": "email"}
    ],
    "metadata": [
      {"key": "order_id", "value": "10045"}
    ]
  }'
```

Svaret er den gemte feedback med dens Deepdots-`id`.

### Felter

| Felt | Type | Beskrivelse |
|---|---|---|
| `integrationId` | string | **Påkrævet.** Den kilde, feedbacken kommer fra. Deepdots giver dig ét pr. kilde. |
| `external_id` | string | Anbefalet. Dit eget id for denne feedback. Forhindrer dubletter (se nedenfor). |
| `name` | string | En kort etiket, der vises i dashboardet. |
| `externalGeneratedAt` | string (ISO 8601) | Hvornår feedbacken blev givet. Standard er tidspunktet for forespørgslen. |
| `externalUpdatedAt` | string (ISO 8601) | Hvornår feedbacken sidst blev ændret i dit system. |
| `externalUrl` | string | Et link tilbage til feedbacken i dit system. |
| `answers` | array | Svarene: `{"key": "<spørgsmål>", "value": ["<svar>"]}`. `value` er altid en liste. |
| `text` | string | Fritekst til feedback, der ikke er et sæt svar (en anmeldelse, en samtale). |
| `metrics` | array | Værdier, du vil filtrere og gruppere efter i dashboardet: `{"key": "<navn>", "value": "<værdi>"}`. |
| `metadata` | array | Ekstra kontekst, der gemmes sammen med feedbacken: `{"key": "<navn>", "value": "<værdi>"}`. |
| `crmContactId` | string | Den kontakt, der gav feedbacken. Se [Kontakter](/da/rest-api/guides/contacts/#knyt-feedback-til-en-kontakt). |

`companyId`, `productId`, `type` og `identity` hentes fra integrationen. Du sender dem kun, hvis Deepdots beder dig om det.

:::tip[Metrics eller metadata?]
Brug **metrics** til det, folk vil filtrere på: butik, region, kanal, kundeniveau. Brug **metadata** til kontekst, du vil gemme, men ikke filtrere på, fx et ordrenummer.
:::

## Undgå dubletter

Send `external_id` med hver feedback. Hvis der allerede findes en feedback med samme `external_id` for den integration, **opretter API'et ikke en ny**: det svarer `200` med den eksisterende feedback.

Det gør genforsøg sikre. Hvis en forespørgsel får timeout, så send den igen med samme `external_id`.

## Send mange feedbacks på én gang

`POST /feedbacks/bulk` modtager en liste af feedbacks for én virksomhed og ét produkt:

```bash
curl -X POST "https://api.deepdots.com/feedbacks/bulk" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "<your-company-id>",
    "product": "<your-product-id>",
    "feedbacks": [
      {
        "integrationId": "<your-integration-id>",
        "type": "SURVEY",
        "identity": "CUSTOM",
        "external_id": "survey-000124",
        "answers": [{"key": "nps", "value": ["10"]}]
      },
      {
        "integrationId": "<your-integration-id>",
        "type": "SURVEY",
        "identity": "CUSTOM",
        "external_id": "survey-000125",
        "answers": [{"key": "nps", "value": ["6"]}]
      }
    ]
  }'
```

Forskelle fra `POST /feedbacks`:

- `company` og `product` er **påkrævede**, og alle feedbacks i listen skal høre til dem.
- Intet hentes fra integrationen: hver feedback skal have sin egen `type` og `identity`. Deepdots fortæller dig, hvilke værdier du skal bruge.
- Svaret er listen over **oprettede** feedbacks. Feedbacks, hvis `external_id` allerede fandtes, springes over og er ikke med i svaret, så et genforsøg på en bulk opretter ikke dubletter.

Se [Batches og grænser](/da/rest-api/guides/batch-and-limits/) for batchstørrelser.

## Næste skridt

- [Kontakter](/da/rest-api/guides/contacts/) — registrer, hvem der gav hver feedback.
- [Endpoints](/da/rest-api/reference/endpoints/) — den fulde forespørgsel og det fulde svar for hvert kald.

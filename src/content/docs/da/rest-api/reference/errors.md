---
title: Fejl
description: Fejlformatet og alle de statuskoder, Deepdots REST API returnerer.
sidebar:
  order: 2
---

## Fejlformat

Fejl returneres som JSON med et `error`-objekt:

```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid. See error object `details` property for more info.",
    "details": [
      {
        "path": "/answers/0",
        "code": "type",
        "message": "must be object"
      }
    ]
  }
}
```

`details` findes kun ved valideringsfejl (`422`) og viser hvert felt, der fejlede.

## Statuskoder

| Status | Betydning | Prøv igen? |
|---|---|---|
| `200` | Gennemført | — |
| `400` | Forespørgslen er forkert: en ugyldig e-mail, en virksomhed eller et produkt, der er tomt eller ikke findes, et felt, som `PATCH /crm/contacts/{id}/fields` ikke tager imod, eller en integration eller kontakt fra en anden virksomhed | Nej, ret forespørgslen |
| `401` | Tokenet mangler, er ugyldigt eller udløbet | Én gang, efter tokenet er fornyet |
| `403` | API-brugeren er ikke aktiv | Nej, kontakt Deepdots |
| `404` | Integrationen findes ikke eller er ikke synlig for dig, eller `crmContactId` er ikke en aktiv kontakt, du kan se | Nej |
| `405` | API-brugeren har ikke adgang til dette endpoint | Nej, kontakt Deepdots |
| `406` | Virksomheden eller kontakten er ikke din, en feedback, du læser med `GET /feedbacks/{id}`, findes ikke eller er ikke synlig for dig, eller den kontakt, du opdaterer, er ikke aktiv | Nej |
| `422` | Body'en passer ikke til skemaet (se `details`): et manglende eller ukendt felt, en værdi af forkert type eller en værdi, der ikke er tilladt, fx et `country` med store bogstaver | Nej, ret forespørgslen |
| `429` | For mange mislykkede login for denne konto (kun `/auth/token`) | Ja, efter en pause |
| `5xx` | Et problem hos os | Ja, med stigende ventetid |

Hvis en `5xx` bliver ved, eller du ser en fejl, du ikke kan forklare, så send os tidspunktet for forespørgslen, endpointet og det berørte `external_id` (eller e-mail).

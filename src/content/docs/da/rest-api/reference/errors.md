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
| `400` | Forespørgslen er forkert: et manglende eller ukendt felt, en ugyldig e-mail, en virksomhed eller et produkt, der ikke findes | Nej, ret forespørgslen |
| `401` | Tokenet mangler, er ugyldigt eller udløbet | Én gang, efter tokenet er fornyet |
| `403` | API-brugeren er ikke aktiv | Nej, kontakt Deepdots |
| `404` | Ressourcen (feedback, integration) findes ikke eller er ikke synlig for dig | Nej |
| `405` | API-brugeren har ikke adgang til dette endpoint | Nej, kontakt Deepdots |
| `406` | Virksomheden eller kontakten er ikke din | Nej |
| `422` | Body'en passer ikke til skemaet (se `details`) | Nej, ret forespørgslen |
| `5xx` | Et problem hos os | Ja, med stigende ventetid |

Hvis en `5xx` bliver ved, eller du ser en fejl, du ikke kan forklare, så send os tidspunktet for forespørgslen, endpointet og det berørte `external_id` (eller e-mail).

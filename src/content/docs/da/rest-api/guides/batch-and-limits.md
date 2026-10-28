---
title: Batches, grænser og genforsøg
description: Hvor stor en forespørgsel må være, hvordan du prøver igen sikkert, og hvordan du håndterer delvise fejl.
sidebar:
  order: 3
---

## Grænser

| Hvad | Grænse |
|---|---|
| Kontakter pr. `POST /crm/contacts/upsert/batch` | 500 |
| Forespørgslens body | 1 MB |
| Tokenets levetid | 1 time |

For `POST /feedbacks/bulk` skal hver forespørgsel holdes under grænsen på 1 MB. Et par hundrede feedbacks pr. forespørgsel er en god størrelse.

## Prøv igen sikkert

- **Feedback:** send altid `external_id`. En gentaget forespørgsel returnerer den feedback, der allerede findes, i stedet for at oprette en ny.
- **Kontakter:** brug upsert-endpoints. Sender du den samme kontakt to gange, bliver den opdateret i stedet for at blive oprettet som dublet.
- **Hvornår du prøver igen:** ved netværksfejl, timeouts og `5xx`-svar, med stigende ventetid mellem forsøgene (fx 1 s, 2 s, 4 s). Prøv en `401` igen én gang, efter du har fornyet tokenet.
- **Hvornår du ikke prøver igen:** `400`, `404`, `406` og `422` betyder, at selve forespørgslen er forkert. Ret den, før du sender den igen.

## Delvise fejl

`POST /crm/contacts/upsert/batch` behandler hver kontakt for sig. En forkert opbygget forespørgsel (en tom liste eller mere end 500 elementer) får hele kaldet til at fejle med `400`. Alt, der kun påvirker én kontakt, fx en ugyldig e-mail, står i `failed`, og resten gemmes:

```json
{
  "contacts": 3,
  "created": 1,
  "updated": 1,
  "failed": [
    {"index": 2, "email": "not-an-email", "error": "Invalid email format."}
  ]
}
```

Tjek `failed` efter hver batch, og send kun de elementer igen, når de er rettet.

`POST /feedbacks/bulk` validerer hele forespørgslen først: hvis noget er forkert, gemmes intet.

## Næste skridt

- [Fejl](/da/rest-api/reference/errors/) — alle statuskoder, og hvad de betyder.

---
title: Administrer kontakter
description: Opret eller opdater CRM-kontakter ud fra e-mail eller dit eget id, hold deres brugerdefinerede felter synkroniseret, og knyt dem til feedback.
sidebar:
  order: 2
---

Kontakter er personerne bag din feedback. Hver kontakt hører til din virksomhed og findes ud fra sin **e-mail** eller ud fra dit eget `externalId`.

## Opret eller opdater en kontakt

Brug `POST /crm/contacts/upsert`. Den opdaterer din virksomheds aktive kontakt med den e-mail, ellers den med det `externalId`, du sender, og opretter en kontakt, når ingen af dem findes:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anna.jensen@example.com",
    "name": "Anna",
    "lastname": "Jensen",
    "externalId": "SF-0035g00000XyZ12",
    "country": "dk",
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

- E-mailen matches først. Den gemmes uden mellemrum og med små bogstaver, så `Anna.Jensen@Example.com` og `anna.jensen@example.com` er den samme kontakt. Kun aktive kontakter matches på e-mail.
- Når ingen aktiv kontakt har den e-mail, opdateres kontakten med det `externalId`, du sender, i stedet, uanset dens status: den får den nye e-mail og bliver aktiv igen, hvis den var slettet. En afmeldt kontakt forbliver afmeldt: svaret har `"status": "UNSUBSCRIBED"`, og kontakten kan ikke knyttes til feedback.
- Når ingen kontakt har det `externalId`, du sender, eller du ikke sender et, oprettes der en ny kontakt, også selvom en afmeldt eller slettet kontakt har den e-mail. Send dit `externalId`, når du har et, så en person, der har afmeldt sig, bliver fundet i stedet for at komme tilbage som en ny, aktiv kontakt.
- Flere kontakter kan have samme `externalId`, fx kontakter oprettet før ændringen i november 2026, eller to kontakter oprettet af forespørgsler, der blev sendt samtidig. Så opdateres kun én af dem: den ældste aktive, ellers den ældste afmeldte, ellers den ældste slettede.
- Felter, du sender, overskrives. Felter, du udelader, bevares.
- `customFields` **flettes**: de nøgler, du sender, tilføjes eller opdateres, en nøgle sendt som `null` fjernes, og alle andre brugerdefinerede felter bevares.

:::caution
`POST /crm/contacts` findes også. Når din virksomhed allerede har en kontakt med det `externalId`, du sender, opretter den ikke en ny, men opdaterer og returnerer kontakten på samme måde; må din API-bruger oprette kontakter, men ikke opdatere dem, returneres kontakten uændret. Ellers **opretter den altid** en ny kontakt, også selvom e-mailen allerede findes. Brug upsert for at undgå dubletter.
:::

### Felter

| Felt | Type | Beskrivelse |
|---|---|---|
| `email` | string | **Påkrævet.** Kontaktens e-mail og den første nøgle, der bruges til at finde den. |
| `name` | string | **Påkrævet.** Kontaktens fornavn. |
| `lastname` | string | Kontaktens efternavn. |
| `externalId` | string | Dit eget id for kontakten, fx dens id i dit CRM. Bruges til at finde kontakten, når ingen aktiv kontakt har e-mailen. |
| `phone`, `address`, `city`, `state`, `postalCode` | string | Kontaktoplysninger. |
| `country` | string | ISO 3166-1 alpha-2-kode med små bogstaver, fx `dk`. En værdi, API'et ikke accepterer, fx `DK`, afvises med `422`. |
| `customFields` | object | Dine egne felter. Hver værdi er en string, et tal eller en boolean. |

## Mange kontakter på én gang

`POST /crm/contacts/upsert/batch` laver upsert af op til **500** kontakter i én forespørgsel:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert/batch" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"email": "anna.jensen@example.com", "name": "Anna", "customFields": {"tier": "gold"}},
      {"email": "lars.nielsen@example.com", "name": "Lars", "customFields": {"tier": "silver"}}
    ]
  }'
```

Hver kontakt behandles som en enkelt upsert. En kontakt, der fejler for sig selv, fx på grund af en ugyldig e-mail, rapporteres i `failed` med sin position i listen, og resten gemmes. En kontakt, der ikke passer til felterne ovenfor, fx en uden `name`, får hele forespørgslen til at fejle med `422`, og intet gemmes.

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

Svaret er kontaktens `id` og dens `customFields` efter fletningen. Dette endpoint ændrer ikke `email` eller `externalId` og virker kun på en aktiv kontakt: for en afmeldt eller slettet kontakt svarer det `406`.

## Find en kontakt

`GET /crm/contacts` tager et `filter` til at finde kontakter, fx ud fra dit eget id:

```bash
curl -G "https://api.deepdots.com/crm/contacts" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  --data-urlencode 'filter={"where": {"externalId": "SF-0035g00000XyZ12"}, "limit": 1}'
```

Den returnerer kun aktive kontakter, medmindre dit `where` har en `status`-nøgle på øverste niveau (`ACTIVE`, `UNSUBSCRIBED` eller `DEPRECATED` for en slettet kontakt), så brug den ikke til at afgøre, om du skal oprette en kontakt: upsert finder også afmeldte og slettede kontakter ud fra deres `externalId`.

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

Kontakten skal være aktiv og høre til samme virksomhed som feedbacken. Deepdots gemmer en kopi af kontaktens felter, som de var, da feedbacken blev givet, så senere ændringer på kontakten omskriver ikke tidligere feedback.

Et typisk flow: lav upsert af kontakten, gem det `id`, den returnerer, og send derefter feedbacken med det `crmContactId`. Kun en aktiv kontakt kan knyttes, så tjek den `status`, upsert returnerer.

## Næste skridt

- [Batches og grænser](/da/rest-api/guides/batch-and-limits/) — batchstørrelser, genforsøg og fejl.
- [Endpoints](/da/rest-api/reference/endpoints/) — den fulde forespørgsel og det fulde svar for hvert kald.

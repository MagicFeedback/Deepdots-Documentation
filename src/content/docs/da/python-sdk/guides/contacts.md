---
title: Administration af Kontakter
description: Opret, opdater, upsert, list og slet CRM-kontakter med Deepdots Python SDK.
---

Kontakter repræsenterer personerne i dit CRM — kunder, brugere eller enhver person du ønsker at associere med kampagner eller feedback.

## Opret en kontakt

```python
contact = client.contacts.create({
    "name": "Jane",
    "lastname": "Smith",
    "email": "jane.smith@eksempel.com",
    "companyId": "DIT_COMPANY_ID",
})
print(contact["id"])
```

### Påkrævede felter

| Felt | Type | Beskrivelse |
|---|---|---|
| `name` | string | Fornavn |
| `lastname` | string | Efternavn |
| `email` | string | E-mailadresse |
| `companyId` | string | Dit virksomhedsidentifikator |

Har virksomheden allerede en kontakt med det `externalId` du sender, tilføjer `create()` ikke en ny: den opdaterer kontakten med de felter du sender (inklusive `email`, og `customFields` flettes) og returnerer den. En slettet kontakt bliver aktiv igen; en afmeldt kontakt forbliver afmeldt. Har din rolle ikke lov til at opdatere kontakter, returneres kontakten uændret. Sådan har API'en virket siden november 2026, med alle SDK-versioner.

Ellers tilføjer `create()` altid en ny kontakt, også når virksomheden allerede har en med samme e-mail. Brug [`upsert()`](#opret-eller-opdater-ud-fra-e-mail) for at matche på e-mail.

Flere kontakter kan stadig have samme `externalId`, for eksempel kontakter oprettet før ændringen i november 2026, eller to kontakter oprettet af kald, der blev sendt samtidig. Så opdaterer `create()`, og `upsert()`, når ingen aktiv kontakt har din e-mail, kun én af dem: den ældste aktive, ellers den ældste afmeldte, ellers den ældste slettede.

## Opret eller opdater ud fra e-mail

`upsert()` opdaterer virksomhedens aktive kontakt med samme e-mail (store og små bogstaver og mellemrum før og efter er ligegyldige). Findes der ingen, opdaterer den kontakten med det `externalId` du sender; kontakten får så din e-mail og bliver aktiv igen, hvis den var slettet, mens en afmeldt kontakt forbliver afmeldt. Har ingen kontakt det `externalId`, opretter `upsert()` en ny. Tilgængelig fra SDK 1.0.22.

Kun aktive kontakter matches på e-mail: en afmeldt eller slettet kontakt findes kun via sit `externalId`. Sender du det ikke, opretter `upsert()` en ny aktiv kontakt med samme e-mail. En afmeldt kontakt kan ikke sendes som et feedbacks `crmContactId`, så tjek den `status`, `create()` eller `upsert()` returnerer, før du bruger dens `id` sådan.

```python
contact = client.contacts.upsert({
    "name": "Jane",
    "email": "jane.smith@eksempel.com",
    "companyId": "DIT_COMPANY_ID",
    "customFields": {"loyalty_tier": "gold"},
})
```

`name`, `email` og `companyId` er påkrævede. Når kontakten allerede findes, overskrives de felter du sender, og `customFields` flettes: de brugerdefinerede felter du sender, tilføjes eller ændres, og de øvrige bevares. Returnerer kontakten.

### Mange kontakter på én gang

`upsert_batch()` gør det samme for en liste af vilkårlig længde. SDK'en sender 500 kontakter per request.

```python
result = client.contacts.upsert_batch([
    {"name": "Jane", "email": "jane.smith@eksempel.com", "companyId": "DIT_COMPANY_ID"},
    {"name": "John", "email": "john.doe@eksempel.com", "companyId": "DIT_COMPANY_ID"},
])
print(result["created"], result["updated"], result["failed"])
```

En kontakt der fejler for sig selv (en ugyldig e-mail eller en virksomhed du ikke har adgang til), står i `failed` med sit `index` i den liste du sendte, og de øvrige gemmes stadig. En kontakt som API'en slet ikke kan tage imod — uden `name` eller `email`, med et felt den ikke kender, en værdi af forkert type eller `None`, eller et `country` der ikke er en ISO-kode med små bogstaver — får API'en til at afvise hele den request på op til 500 kontakter som kontakten er med i, med 422, og `upsert_batch()` kaster `requests.HTTPError`. De requests der blev sendt før, er allerede gemt, og resten af listen bliver ikke sendt. Returnerer `{"contacts", "created", "updated", "failed"}`.

## List kontakter

```python
contacts = client.contacts.get()
```

Filtrer med et LoopBack-filter-dict (se [Forespørgsler](/da/python-sdk/guides/querying/)):

```python
contacts = client.contacts.get({
    "where": {"companyId": "DIT_COMPANY_ID"},
    "limit": 100,
})
```

`get()` returnerer kun aktive kontakter, medmindre dit `where` har en `status`-nøgle på øverste niveau, for eksempel `{"where": {"externalId": "C-1001", "status": "UNSUBSCRIBED"}}`. Brug den derfor ikke til at afgøre, om du skal oprette en kontakt: `create()` og `upsert()` finder også afmeldte og slettede kontakter ud fra deres `externalId`.

## Opdater en kontakt

Send kun de felter du vil ændre:

```python
client.contacts.update(contact["id"], {
    "name": "Janet",
})
```

`update()` returnerer et tomt dict (`{}`). `update()`, `update_fields()` og `delete()` virker kun på aktive kontakter: på en afmeldt eller slettet kontakt kaster de `requests.HTTPError` med HTTP 406.

## Opdater brugerdefinerede felter

`update()` erstatter hele `customFields`-objektet, så hvis du sætter ét brugerdefineret felt med den, slettes alle de andre. Brug i stedet `update_fields()`. Den tilføjer eller ændrer de brugerdefinerede felter du sender, bevarer resten og fjerner dem du sætter til `None`. Tilgængelig fra SDK 1.0.22.

```python
# Tilføj eller ændr brugerdefinerede felter og bevar de øvrige
client.contacts.update_fields(contact["id"], {"loyalty_tier": "gold", "vip": True})

# Fjern et brugerdefineret felt
client.contacts.update_fields(contact["id"], {"loyalty_tier": None})

# Brugerdefinerede felter og faste felter i ét kald
client.contacts.update_fields(contact["id"], {"nps_segment": "promoter"}, city="Copenhagen")
```

Værdier kan være strings, tal eller booleans. Som keyword-argumenter kan du også ændre `name`, `lastname`, `phone`, `address`, `city`, `state` og `postalCode`. Alle andre felter afvises med 400; dem ændrer du med `update()`. Returnerer `{"id": ..., "customFields": {...}}` med alle brugerdefinerede felter efter ændringen.

## Slet en kontakt

```python
client.contacts.delete(contact["id"])
```

:::tip
Gem kontaktens `id` returneret af `create()`, når du har brug for at referere til kontakten senere — f.eks. når du opretter kampagnesessioner. Se [Kampagner](/da/python-sdk/guides/campaigns/).
:::

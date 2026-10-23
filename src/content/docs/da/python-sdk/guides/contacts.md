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

`create()` tilføjer altid en ny kontakt, også når virksomheden allerede har en med samme e-mail. Brug [`upsert()`](#opret-eller-opdater-ud-fra-e-mail) for at undgå dubletter.

## Opret eller opdater ud fra e-mail

`upsert()` opdaterer virksomhedens aktive kontakt med samme e-mail (store og små bogstaver og mellemrum før og efter er ligegyldige), eller opretter en, hvis der ikke findes nogen. Tilgængelig fra SDK 1.0.22.

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

## Opdater en kontakt

Send kun de felter du vil ændre:

```python
updated = client.contacts.update(contact["id"], {
    "name": "Janet",
})
```

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

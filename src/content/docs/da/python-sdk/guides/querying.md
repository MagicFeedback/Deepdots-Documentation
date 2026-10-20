---
title: Forespørgsler
description: Brug LoopBack-filter-dicts til at forespørge, paginere og forme resultater fra enhver liste-metode i SDK'en.
---

Alle `.get()`-metoder i SDK'en accepterer en valgfri `filter`-dict. Filteret følger LoopBack-forespørgselssyntaksen brugt af Deepdots API.

## Grundlæggende struktur

```python
filter = {
    "where": {…},
    "limit": 50,
    "skip": 0,
    "order": "createdAt DESC",
    "fields": {…},
    "include": […],
}
```

Alle nøgler er valgfrie. Send kun dem du har brug for.

## Filtrer efter feltværdi

```python
contacts = client.contacts.get({
    "where": {
        "companyId": "DIT_COMPANY_ID",
    }
})
```

Flere betingelser i `where` kombineres som AND:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "companyId": "DIT_COMPANY_ID",
        "type": "APP",
    }
})
```

## Datointervaller

Brug LoopBack-operatoren `between` til at vælge poster inden for et tidsvindue. Send ISO 8601-tidsstempler:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "createdAt": {"between": ["2026-07-01T00:00:00Z", "2026-07-01T23:59:59.999Z"]},
    }
})
```

Range-operatorerne `gt`, `gte`, `lt` og `lte` fungerer på samme måde til åbne vinduer:

```python
feedbacks = client.feedbacks.get({
    "where": {"createdAt": {"gte": "2026-07-01T00:00:00Z"}},
})
```

:::caution
Brug én operator pr. betingelse. API'en anvender kun den første operator i en betingelse, så `{"createdAt": {"gte": ..., "lt": ...}}` ignorerer `lt` uden varsel og returnerer alt fra den første dato og frem. Vil du afgrænse et vindue i begge ender, så brug `between`, eller sæt hver grænse i sin egen betingelse inde i `and`, som vist nedenfor.
:::

### Filtrer feedback efter hvornår det fandt sted

`createdAt` er det tidspunkt hvor API'en modtog en post. For feedback der kommer fra et andet system, er den dato der tæller — den dashboardet viser — `externalGeneratedAt` (se [Kildesystemfelter](/da/python-sdk/guides/feedback/#kildesystemfelter)). Filtrer på den med et halvåbent interval af rene datoer: `gte` den første dag og `lt` dagen efter den sidste, hver i sin egen betingelse inde i `and`:

```python
feedbacks = client.feedbacks.get({
    "where": {"and": [
        {"externalGeneratedAt": {"gte": "2026-09-01"}},
        {"externalGeneratedAt": {"lt": "2026-10-01"}},
    ]},
    "order": "externalGeneratedAt DESC",
})
```

`externalGeneratedAt` gemmes som tekst, så grænserne sammenlignes som strings. Datoer i det anbefalede format (`2026-09-30T12:00:00.000Z`) sorteres kronologisk, og intervallet ovenfor returnerer dem alle fra 1. september til og med 30. september, regnet i UTC-døgn.

:::caution
For `externalGeneratedAt` skal du bruge rene datoer, som vist ovenfor. Bruger du tidsstempler, så skriv dem i præcis samme format som dine gemte værdier: som tekst sorteres for eksempel grænsen `2026-09-01T00:00:00Z` efter `2026-09-01T00:00:00.500Z`, så den værdi ville blive udeladt. Brug ikke tidszoneforskydninger som `+02:00`: de sammenlignes også som almindelig tekst.
:::

:::caution
SDK'en sætter filteret ind i URL'en uden at URL-kode det, så nogle tegn i filterværdier bliver læst forkert: `+` bliver til et mellemrum, `&` og `#` afkorter filteret (HTTP 400), og `%` efterfulgt af to hexadecimale cifre bliver afkodet. Requesten finder så ingenting, finder de forkerte poster eller fejler. Et `]` umiddelbart efterfulgt af `=` (som i en URL, der indeholder `ids[]=4`) får API'et til at ignorere hele filteret og returnere alle de feedbacks, du kan se. Escape disse tegn som vist i [Find et feedback ud fra dets kilde-ID](#find-et-feedback-ud-fra-dets-kilde-id).
:::

## Find et feedback ud fra dets kilde-ID

Filtrer på `external_id` for at finde det feedback der blev oprettet ud fra en post i dit eget system:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "integrationId": "DIT_INTEGRATION_ID",
        "external_id": {"inq": ["48213", "48214"]},
    },
    "fields": {"id": True, "external_id": True, "externalGeneratedAt": True},
})
```

Slå lange lister af ID'er op i portioner (for eksempel 100 ad gangen), så URL'en holdes kort. Hvis dine ID'er kan indeholde `%`, `+`, `&`, `#` eller `=`, så escape disse tegn først (se bemærkningen ovenfor):

```python
def filter_value(value: str) -> str:
    """Escape de tegn som filter-URL'en ellers ville læse forkert."""
    return value.replace("%", "%25").replace("+", "%2B").replace("&", "%26").replace("#", "%23").replace("=", "%3D")

feedbacks = client.feedbacks.get({
    "where": {
        "integrationId": "DIT_INTEGRATION_ID",
        "external_id": {"inq": [filter_value(i) for i in ["+4512345678", "R&D-17"]]},
    },
})
```

## Paginering

Brug `limit` og `skip` til paginerede requests:

```python
page_1 = client.feedbacks.get({"limit": 20, "skip": 0})
page_2 = client.feedbacks.get({"limit": 20, "skip": 20})
```

## Sortering

```python
feedbacks = client.feedbacks.get({
    "order": "createdAt DESC",
    "limit": 10,
})
```

Angiv `order` eksplicit: uden den returneres resultaterne ikke i datorækkefølge. Brug `"externalGeneratedAt DESC"` til at liste feedback efter hvornår det fandt sted, frem for hvornår det blev modtaget. Når du paginerer, så tilføj `id` som sekundær sorteringsnøgle — `"order": ["externalGeneratedAt DESC", "id ASC"]` — fordi mange feedbacks kan have samme dato, og sider der kun er sorteret efter den, kan gentage eller springe poster over.

## Vælg specifikke felter

Returner kun de felter du behøver for at reducere payload-størrelsen:

```python
contacts = client.contacts.get({
    "fields": {
        "id": True,
        "email": True,
    }
})
```

## Kombinér betingelser

```python
result = client.feedbacks.get({
    "where": {"companyId": "DIT_COMPANY_ID"},
    "order": "createdAt DESC",
    "limit": 50,
    "skip": 0,
})
```

:::tip
`where`-objektet sendes som en JSON-forespørgselsparameter til API'en. Komplekse indlejrede betingelser (LoopBack `and`/`or`-operatorer) understøttes, så længe API-endpointet accepterer dem.
:::

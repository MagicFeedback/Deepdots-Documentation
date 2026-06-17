---
title: Forespørgsler
description: Brug LoopBack-filter-dicts til at forespørge, paginere og forme resultater fra enhver liste-metode i SDK'en.
---

Alle `.get()`-metoder i SDK'en accepterer en valgfri `filter`-dict. Filteret følger LoopBack-forespørgselssyntaksen brugt af MagicFeedback API.

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

:::tip
`where`-objektet sendes som en JSON-forespørgselsparameter til API'en. Komplekse indlejrede betingelser (LoopBack `and`/`or`-operatorer) understøttes, så længe API-endpointet accepterer dem.
:::

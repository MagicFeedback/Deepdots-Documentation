---
title: Administration af Kontakter
description: Opret, list, opdater og slet CRM-kontakter med MagicFeedback Python SDK.
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
| `email` | string | E-mailadresse (skal være unik per virksomhed) |
| `companyId` | string | Dit virksomhedsidentifikator |

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

## Slet en kontakt

```python
client.contacts.delete(contact["id"])
```

:::tip
Gem kontaktens `id` returneret af `create()`, når du har brug for at referere til kontakten senere — f.eks. når du opretter kampagnesessioner. Se [Kampagner](/da/python-sdk/guides/campaigns/).
:::

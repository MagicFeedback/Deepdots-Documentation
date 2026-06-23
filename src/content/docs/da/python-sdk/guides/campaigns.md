---
title: Kampagner
description: Opret kampagner, tilknyt kontakter via sessioner og hent sessions-feedback med MagicFeedback Python SDK.
---

Kampagner lader dig gruppere opsøgende indsatser og spore hvilke kontakter der deltog. Hver kampagne indeholder en eller flere sessioner; hver session linker til en liste af kontakter.

## Opret en kampagne

```python
campaign = client.campaigns.create({
    "name": "NPS-undersøgelse Q3",
    "companyId": "DIT_COMPANY_ID",
})
print(campaign["id"])
```

### Påkrævede felter

| Felt | Type | Beskrivelse |
|---|---|---|
| `name` | string | Læsbart kampagnenavn |
| `companyId` | string | Dit virksomhedsidentifikator |

## List kampagner

```python
campaigns = client.campaigns.get()
```

## Opret en session

En session knytter et sæt kontakter til en kampagne. Hver kontakt refereres med sit `id`.

```python
session = client.campaigns.create_session(campaign["id"], {
    "crmContactId": ["contact-uuid-1", "contact-uuid-2"],
})
```

:::caution
`crmContactId` skal være en ikke-tom liste. En tom liste eller en bare string vil få API'en til at afvise requesten.
:::

## List sessioner for en kampagne

```python
sessions = client.campaigns.get_sessions(campaign["id"])
```

## Hent feedback fra sessioner

```python
feedbacks = client.campaigns.get_sessions_feedbacks(campaign["id"])
```

### Typisk arbejdsgang

```python
# 1. Opret kontakter
contact_a = client.contacts.create({
    "name": "Alice", "lastname": "Doe",
    "email": "alice@eksempel.com", "companyId": "DIT_COMPANY_ID",
})
contact_b = client.contacts.create({
    "name": "Bob", "lastname": "Doe",
    "email": "bob@eksempel.com", "companyId": "DIT_COMPANY_ID",
})

# 2. Opret en kampagne
campaign = client.campaigns.create({
    "name": "NPS-undersøgelse Q3", "companyId": "DIT_COMPANY_ID",
})

# 3. Tilføj en session med begge kontakter
session = client.campaigns.create_session(campaign["id"], {
    "crmContactId": [contact_a["id"], contact_b["id"]],
})

# 4. Senere: hent al feedback for denne kampagne
feedbacks = client.campaigns.get_sessions_feedbacks(campaign["id"])
```

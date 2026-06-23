---
title: Administration af Feedback
description: Opret, læs, opdater og slet feedback-submissions med MagicFeedback Python SDK.
---

Feedback-submissions er den primære ressource i MagicFeedback. Hver submission registrerer et sæt svar for en specifik integration og et specifikt produkt.

## Opret en submission

```python
feedback = client.feedbacks.create({
    "name": "Bruger-undersøgelsessvar",
    "type": "APP",
    "identity": "MAGICFORM",
    "answers": [
        {"key": "nps", "value": "9"},
        {"key": "reason", "value": "Hurtig og pålidelig"},
    ],
    "integrationId": "0eb9d270-6dd7-11ef-9987-21e04f383573",
    "companyId": "DIT_COMPANY_ID",
    "productId": "DIT_PRODUCT_ID",
})
print(feedback["id"])
```

### Påkrævede felter

| Felt | Type | Beskrivelse |
|---|---|---|
| `name` | string | Læsbar etiket for denne submission |
| `type` | string | Kildetype — f.eks. `"APP"`, `"DOCUMENT"` |
| `identity` | string | Renderer-identitet — f.eks. `"MAGICFORM"` |
| `integrationId` | string | UUID for den integration dette feedback tilhører |
| `companyId` | string | Dit virksomhedsidentifikator |
| `productId` | string | Det produkt dette feedback er tilknyttet |

### Automatisk indpakning af svarværdier

SDK'en indsætter automatisk en bare `value`-string i en liste. Begge former nedenfor er ækvivalente:

```python
{"key": "comment", "value": "Godt produkt"}
{"key": "comment", "value": ["Godt produkt"]}
```

## List alle submissions

```python
feedbacks = client.feedbacks.get()
```

Filtrer med et LoopBack-filter-dict (se [Forespørgsler](/da/python-sdk/guides/querying/)):

```python
feedbacks = client.feedbacks.get({
    "where": {"companyId": "DIT_COMPANY_ID"},
    "limit": 50,
})
```

## Hent en enkelt submission

```python
feedback = client.feedbacks.get_id("feedback-uuid-her")
```

Send et filter som andet argument for at forme de returnerede felter:

```python
feedback = client.feedbacks.get_id("feedback-uuid-her", {"fields": {"answers": True}})
```

## Opdater en submission

```python
updated = client.feedbacks.update("feedback-uuid-her", {
    "name": "Opdateret etiket",
})
```

## Slet en submission

```python
client.feedbacks.delete("feedback-uuid-her")
```

:::caution
Sletning er permanent. API'en understøtter ikke soft deletes.
:::

## Upload en fil-vedhæftning

Vedhæft en fil til en eksisterende feedback-submission. Filen sendes som en multipart-upload.

```python
attachment = client.feedbacks.upload_attachment(
    "feedback-uuid-her",
    file_path="/sti/til/rapport.pdf",
)
```

Send valgfrie argumenter for at styre visningsnavnet og vedhæfte ekstra metadata:

```python
attachment = client.feedbacks.upload_attachment(
    "feedback-uuid-her",
    file_path="/sti/til/rapport.pdf",
    filename="q3-rapport.pdf",
    extra_data={"kilde": "crm", "år": 2026},
)
```

| Parameter | Type | Beskrivelse |
|---|---|---|
| `feedback_id` | string | ID på det feedback filen skal vedhæftes |
| `file_path` | string | Absolut eller relativ sti til filen på disk |
| `filename` | string \| None | Visningsnavn i dashboardet — standard er filnavnet |
| `extra_data` | dict \| None | Et JSON-serialiserbart dict gemt sammen med vedhæftningen |

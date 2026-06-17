---
title: Modeller
description: Datashapes returneret af MagicFeedback API — feedback-, kontakt-, kampagne-, sessions-, produkt- og spørgsmålsobjekter.
---

SDK'en returnerer simple Python-dicts. Shapes nedenfor beskriver de nøgler du kan forvente på hvert objekt.

## Feedback

Returneret af `feedbacks.create()`, `feedbacks.get()`, `feedbacks.get_id()` og `feedbacks.update()`.

| Felt | Type | Beskrivelse |
|---|---|---|
| `id` | string | Unik identifikator |
| `name` | string | Læsbar etiket |
| `type` | string | Kildetype (`"APP"`, `"DOCUMENT"`, …) |
| `identity` | string | Renderer-identitet (`"MAGICFORM"`, …) |
| `integrationId` | string | UUID for den tilknyttede integration |
| `companyId` | string | Virksomhedsidentifikator |
| `productId` | string | Produktidentifikator |
| `answers` | Answer[] | Liste af indsendte svar |
| `questions` | Question[] | Snapshot af spørgsmål ved submission-tidspunktet |
| `createdAt` | string | ISO 8601 oprettelsestidsstempel |
| `updatedAt` | string | ISO 8601 senest-opdateret tidsstempel |

### Answer

| Felt | Type | Beskrivelse |
|---|---|---|
| `key` | string | Spørgsmålsnøgle dette svar tilhører |
| `value` | string[] | En eller flere svarværdier |

## Kontakt

Returneret af `contacts.create()`, `contacts.get()` og `contacts.update()`.

| Felt | Type | Beskrivelse |
|---|---|---|
| `id` | string | Unik identifikator |
| `name` | string | Fornavn |
| `lastname` | string | Efternavn |
| `email` | string | E-mailadresse |
| `companyId` | string | Virksomhedsidentifikator |
| `createdAt` | string | ISO 8601 oprettelsestidsstempel |
| `updatedAt` | string | ISO 8601 senest-opdateret tidsstempel |

## Kampagne

Returneret af `campaigns.create()` og `campaigns.get()`.

| Felt | Type | Beskrivelse |
|---|---|---|
| `id` | string | Unik identifikator |
| `name` | string | Kampagnenavn |
| `companyId` | string | Virksomhedsidentifikator |
| `createdAt` | string | ISO 8601 oprettelsestidsstempel |
| `updatedAt` | string | ISO 8601 senest-opdateret tidsstempel |

## Session

Returneret af `campaigns.create_session()` og `campaigns.get_sessions()`.

| Felt | Type | Beskrivelse |
|---|---|---|
| `id` | string | Unik identifikator |
| `campaignId` | string | ID for overordnet kampagne |
| `crmContactId` | string[] | IDs for kontakterne i denne session |
| `createdAt` | string | ISO 8601 oprettelsestidsstempel |

## Produkt

Returneret af `products.get()`.

| Felt | Type | Beskrivelse |
|---|---|---|
| `id` | string | Unik identifikator / produktnøgle |
| `name` | string | Visningsnavn |
| `companyId` | string | Ejende virksomhed |

## Integrationsspørgsmål

Returneret af `integrations_questions.get()`.

| Felt | Type | Beskrivelse |
|---|---|---|
| `key` | string | Svarnøgle — brug dette i `answers[].key` ved oprettelse af feedback |
| `type` | string | Spørgsmålstype (f.eks. `"TEXT"`, `"RATING"`) |
| `label` | string | Læsbar spørgsmålsetiket |
| `integrationId` | string | Den integration dette spørgsmål tilhører |

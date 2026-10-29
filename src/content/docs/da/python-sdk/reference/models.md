---
title: Modeller
description: Datashapes returneret af Deepdots API — feedback-, kontakt-, kampagne-, sessions-, produkt- og spørgsmålsobjekter.
---

SDK'en returnerer simple Python-dicts. Shapes nedenfor beskriver de nøgler du kan forvente på hvert objekt.

## Feedback

Returneret af `feedbacks.create()`, `feedbacks.get()` og `feedbacks.get_id()`. (`feedbacks.update()` og `feedbacks.delete()` returnerer et tomt dict.)

| Felt | Type | Beskrivelse |
|---|---|---|
| `id` | string | Unik identifikator |
| `name` | string | Læsbar etiket |
| `type` | string | Kildetype (`"APP"`, `"SURVEY"`, `"DOCUMENT"`) |
| `identity` | string | Kildeidentitet (`"MAGICFORM"`, …) |
| `integrationId` | string | UUID for den tilknyttede integration |
| `companyId` | string | Virksomhedsidentifikator |
| `productId` | string | Produktidentifikator |
| `text` | string | Fritekst for feedbacket |
| `answers` | Answer[] | Liste af indsendte svar |
| `questions` | Question[] | Snapshot af spørgsmål ved submission-tidspunktet |
| `status` | string | Behandlingsstatus: `"REGISTERED"` ved modtagelse, derefter `"PROCESSING"` og så `"DONE"`, `"PARTIAL"`, `"ERROR"` eller `"EMPTY"`; `"DEPRECATED"` efter `delete()` (slettet feedback returneres kun, når du filtrerer på `status`) |
| `metrics` | Metric[] | Metric-værdier sendt med feedbacket (i `create()` eller `update()`). Metrics som analysen udleder, for eksempel fra svar, er ikke med her |
| `metadata` | Metadata[] | Brugerdefinerede nøgle/værdi-metadata-poster |
| `crmContactId` | string \| None | ID på den tilknyttede CRM-kontakt |
| `external_id` | string | ID på posten i kildesystemet |
| `externalGeneratedAt` | string | Hvornår feedbacket blev oprettet i kildesystemet — den dato dashboardet bruger. Returneres præcis som det blev sendt (anbefalet: UTC ISO 8601 som `"2026-10-06T11:00:00.000Z"`); standard er det tidspunkt hvor API'en modtog det |
| `externalUpdatedAt` | string | Hvornår posten sidst blev ændret i kildesystemet. Returneres præcis som det blev sendt; standard er det tidspunkt hvor API'en modtog det |
| `externalUrl` | string | Link til den oprindelige post |
| `createdAt` | string | ISO 8601-tidsstempel for hvornår API'en modtog feedbacket |
| `updatedAt` | string | ISO 8601 senest-opdateret tidsstempel |

Du angiver `external_id`, `externalGeneratedAt`, `externalUpdatedAt` og `externalUrl`, når du opretter feedbacket. De sidste tre kan ændres senere med `update()`; det kan `external_id` ikke. Se [Kildesystemfelter](/da/python-sdk/guides/feedback/#kildesystemfelter).

### Answer

| Felt | Type | Beskrivelse |
|---|---|---|
| `key` | string | `ref` for det spørgsmål dette svar tilhører |
| `value` | string[] | En eller flere svarværdier |

### Metric

| Felt | Type | Beskrivelse |
|---|---|---|
| `key` | string | Metric-navn |
| `value` | string[] | En eller flere værdier som strings (f.eks. `["9"]`) |

### Metadata

| Felt | Type | Beskrivelse |
|---|---|---|
| `key` | string | Metadata-nøgle |
| `value` | string[] | En eller flere metadata-værdier |

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
| `id` | string | Unik identifikator |
| `ref` | string | Svarnøgle — brug dette i `answers[].key` ved oprettelse af feedback |
| `title` | string | Spørgsmålsteksten som respondenterne ser |
| `type` | string | Spørgsmålstype (f.eks. `"TEXT"`, `"LONGTEXT"`, `"RATING_NUMBER"`) |
| `integrationId` | string | Den integration dette spørgsmål tilhører |

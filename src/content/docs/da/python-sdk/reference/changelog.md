---
title: Changelog
description: Udgivne versioner af Deepdots Python SDK med datoer og ændringer.
---

Alle udgivne versioner, nyeste først. Datoerne er udgivelsesdatoerne på PyPI.

Se [Installation](/da/python-sdk/getting-started/installation/) for at installere en bestemt version.

## 1.0.23 — 2026-10-20

- **Nyt `client.crm`** til CRM-objekter som billetter, kampe og medlemskaber: `upsert_objects()` og `get_objects()`, plus to connectors der tager en kundes poster som de er, `sync_fck_users()` (FCK-brugere til kontakter) og `ingest_roboticket()` (Roboticket-linjer for billetter og medlemskaber). Lister af vilkårlig længde sendes i portioner af 500. Se [CRM-objekter](/da/python-sdk/guides/crm-objects/).
- Hver `client.crm`-request sendes igen, når den fejler midlertidigt (502, 503, 504, en forbindelsesfejl eller en timeout), og klienten logger ind igen én gang, når tokenet er udløbet.

## 1.0.22 — 2026-09-25

- `contacts.upsert()` og `contacts.upsert_batch()` opretter en kontakt eller opdaterer den med samme e-mail, én ad gangen eller i portioner af vilkårlig størrelse. Se [Kontakter](/da/python-sdk/guides/contacts/#opret-eller-opdater-ud-fra-e-mail).
- `contacts.update_fields()` tilføjer eller ændrer brugerdefinerede felter uden at fjerne de øvrige.
- `feedbacks.update_metadata_batch()` tager `mode="append"` for at føje værdier til en metadata-nøgle i stedet for at erstatte dem.

## 1.0.21 — 2026-09-16

- `feedbacks.update_metadata_batch()` tilføjer eller overskriver metadata på mange feedbacks i én request, og hvert af dem analyseres igen. Se [Opdater metrics og metadata](/da/python-sdk/guides/feedback/#opdater-metrics-og-metadata).

## 1.0.20 — 2026-08-24

- Hver `value` i `answers`, `metrics`, `metadata` og `profile` er en liste, både i det du sender, og i det `get()` og `get_id()` returnerer.
- `upload_attachment()` afviser en fil, når feedbacket allerede har 3 vedhæftninger (`max_attachments`) eller allerede har en fil med samme indhold (`check_duplicate_content`). Se [Upload en fil-vedhæftning](/da/python-sdk/guides/feedback/#upload-en-fil-vedhæftning).

## 1.0.19 — 2026-08-20

- Distributionsnavne skrives nu med små bogstaver: `deepdots` og `magicfeedback`. Rent kosmetisk — PyPI skelner ikke mellem store og små bogstaver i pakkenavne, så `pip install MagicFeedback` virker fortsat.

## 1.0.18 — 2026-08-20

- **Nyt pakkenavn `deepdots`.** `pip install deepdots` virker nu.
- **Ny importpakke `deepdots_sdk` og klasse `Deepdots`** ved siden af de oprindelige `magicfeedback_sdk` og `MagicFeedback`. Begge peger på de samme objekter; eksisterende kode kræver ingen ændringer.

## 1.0.17 — 2026-07-10

- **Godkendelse med token cachet i Datastore.** Token'et læses som standard fra en cache i Google Cloud Datastore (`auth_source="datastore"`), hvilket undgår et Identity Platform-login ved hver brug, og falder tilbage til Identity Platform, når det cachede token mangler, er forældet eller utilgængeligt. Brug `auth_source="identity"` for den oprindelige adfærd.
- `refresh_token()` genindlæser token'et og opdaterer godkendelses-headeren i alle sub-API-klienter.
- `build_done_message()` opbygger afslutningsbeskeden til Pub/Sub-emnet `request-done`.
- **Rettet:** de udgivne wheels angiver nu deres afhængigheder. Til og med 1.0.16 angav de ingen, så pip installerede SDK'en uden `requests` og Google Cloud-bibliotekerne.

## 1.0.16 — 2026-07-07

- Rettelse i pakkeopbygningen.

## 1.0.15 — 2026-07-07

- Endpoint til opdatering af rapporter.

## 1.0.14 — 2026-06-22

- `upload_attachment()` i Feedback-API'en — vedhæft en fil til et eksisterende feedback-element.

## 1.0.13 — 2026-05-13

- Signals-API.

## 1.0.12 — 2026-04-28

- Rettede opdatering af et feedback-element.

## 1.0.11 — 2026-04-23

- Vedligeholdelsesudgivelse.

## 1.0.10 — 2026-03-17

- Requests-API.

## 1.0.9 — 2026-01-23

- Companies-API.

## Tidligere udgivelser

Disse ligger før dette changelog. Datoerne er præcise; beskrivelserne er rekonstrueret ud fra commit-historikken og er derfor vejledende, ikke udtømmende.

| Version | Dato | Noter |
|---|---|---|
| 1.0.8 | 2025-12-09 | Opdatering af rapporter |
| 1.0.7 | 2025-12-02 | — |
| 1.0.6 | 2025-12-02 | — |
| 1.0.5 | 2025-12-02 | Reports- og Products-API'er |
| 1.0.4 | 2025-09-29 | Campaigns-API |
| 1.0.3.2 | 2025-09-29 | — |
| 1.0.3 | 2025-07-22 | — |
| 1.0.2 | 2025-04-30 | Integrationsspørgsmål |
| 1.0.1 | 2025-04-14 | Filtre og liste-endpoints |
| 1.0.0 | 2025-04-14 | Omstrukturering af pakken, log-kontrol |
| 0.0.7 | 2025-04-12 | — |
| 0.0.6 | 2025-04-07 | — |
| 0.0.5 | 2025-04-07 | Kampagnesessioner, metrikker |
| 0.0.4 | 2024-12-18 | — |
| 0.0.3 | 2024-12-11 | Kontakter og kampagner |
| 0.0.2 | 2024-09-08 | — |
| 0.0.1 | 2024-09-08 | Første udgivelse |

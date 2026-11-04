---
title: Changelog
description: Udgivne versioner af Deepdots Python SDK med datoer og ændringer.
---

Alle udgivne versioner, nyeste først. Datoerne er udgivelsesdatoerne på PyPI.

Se [Installation](/da/python-sdk/getting-started/installation/) for at installere en bestemt version.

## 1.0.25 — 2026-11-04

1.0.23 og 1.0.24 blev aldrig udgivet, så dette er den første udgivelse siden 1.0.22.

Siden november 2026 matcher API'et også kontakter på `externalId`, med alle SDK-versioner: `contacts.create()` med et `externalId`, som virksomheden allerede har, opdaterer den kontakt i stedet for at tilføje en ny, og `upsert()` opdaterer kontakten med dit `externalId`, når ingen aktiv kontakt har e-mailen. Se [Kontakter](/da/python-sdk/guides/contacts/#opret-en-kontakt).

- **`feedbacks.create()` kræver ikke længere `companyId` og `productId`.** Udelader du et af dem eller sender det tomt, kopierer SDK'en værdien fra integrationen. Se [Administration af Feedback](/da/python-sdk/guides/feedback/#påkrævede-felter).
- **Login går gennem Deepdots API'et** (`POST /auth/token`) i stedet for at kalde Google Identity Platform direkte. Argumentet `ip_key` bruges ikke længere: det ignoreres med en `DeprecationWarning`. Et mislykket login kaster `requests.HTTPError` med API'ets statuskoder: 401 ved forkert e-mail eller adgangskode, 403, hvis login-kontoen er deaktiveret, 429 efter for mange mislykkede forsøg og 502, hvis identitetsudbyderen ikke kan nås. Tidligere versioner kastede Identity Platforms svar, en 400 med årsagen i svarets body.
- Med `auth_source="identity"` fornyer `refresh_token()` tokenet med refresh-tokenet fra sidste login (`POST /auth/token/refresh`) og logger kun ind igen, hvis det refresh-token afvises. Med standardværdien for `auth_source` henter den et token på samme måde som konstruktøren.
- Ny `client.crm` til CRM-objekter: `upsert_objects()` og `get_objects()`. Hver `client.crm`-request sendes igen, når den fejler midlertidigt (502, 503, 504, en forbindelsesfejl eller en timeout), og klienten henter et nyt token én gang, som `refresh_token()` gør, når tokenet er udløbet. Se [CRM-objekter](/da/python-sdk/guides/crm-objects/).

## 1.0.22 — 2026-09-25

- **Kontakter:** nye `update_fields()`, der fletter brugerdefinerede felter ind i en kontakt og beholder de andre; `upsert()`, der opretter eller opdaterer en kontakt ud fra e-mail; og `upsert_batch()`, der gør det samme for en liste af vilkårlig længde, delt op i requests på 500. Se [Kontakter](/da/python-sdk/guides/contacts/#opret-eller-opdater-ud-fra-e-mail).
- **Ændret:** `update_metadata_batch()` fletter nu metadata efter nøgle i stedet for at erstatte dem: nøgler, du ikke sender, bevares. Send `mode="append"` for at tilføje værdier til dem, en nøgle allerede har.

## 1.0.21 — 2026-09-16

- Ny `feedbacks.update_metadata_batch()`: opdater metadata for mange feedbacks i én request, og få hver af dem analyseret igen. Se [Opdater metrics og metadata](/da/python-sdk/guides/feedback/#opdater-metrics-og-metadata).

## 1.0.20 — 2026-08-24

- `upload_attachment()` afviser en fil, når feedbacken allerede har `max_attachments` filer (standard 3), eller det samme indhold allerede er vedhæftet. Send `check_duplicate_content=False` for at springe indholdstjekket over. Se [Upload en fil-vedhæftning](/da/python-sdk/guides/feedback/#upload-en-fil-vedhæftning).
- `value` er nu altid en liste også i `metadata`, `metrics` og `profile`, både når du sender en feedback, og når du læser en.

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

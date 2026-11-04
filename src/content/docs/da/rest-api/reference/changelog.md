---
title: Changelog
description: Ændringer i godkendelses-, feedback- og kontakt-endpoints i Deepdots REST API.
sidebar:
  order: 4
---

## 2026-11

- **Kontakter matches også på `externalId`.** Når ingen aktiv kontakt har den e-mail, du sender, opdaterer `POST /crm/contacts/upsert` og `POST /crm/contacts/upsert/batch` kontakten med det `externalId`, du sender, uanset dens status, i stedet for at oprette en ny. Kontakten får den e-mail, du sender, og bliver aktiv igen, hvis den var slettet; en afmeldt kontakt forbliver afmeldt. `POST /crm/contacts` med et `externalId`, som din virksomhed allerede har, opdaterer og returnerer den kontakt på samme måde i stedet for at oprette en. Se [Administrer kontakter](/da/rest-api/guides/contacts/#sådan-virker-opdateringer).
- **Dokumentationen rettet, ingen ændring i API'et:** `POST /crm/contacts/upsert` og dens batch har altid krævet `name` og, når det sendes, et `country` med små bogstaver (`dk`) og svaret `422` ellers; den tidligere dokumentation viste `name` som valgfri og brugte `DK`. Et batch-element, der ikke passer til kontaktfelterne, får hele batchen til at fejle med `422`. `crmContactId` skal være en aktiv kontakt, ellers afvises feedbacken med `404`.

## 2026-10

- **Login via API'et.** `POST /auth/token` logger ind med en API-brugers e-mail og adgangskode, og `POST /auth/token/refresh` fornyer tokenet. Se [Godkendelse](/da/rest-api/getting-started/authentication/). Du skal ikke længere bruge en godkendelsesnøgle for at logge ind.
- Første udgivne version af REST API-dokumentationen: feedback (`POST /feedbacks`, `POST /feedbacks/bulk`, `GET /feedbacks/{id}`) og kontakter (`POST /crm/contacts/upsert`, `POST /crm/contacts/upsert/batch`, `PATCH /crm/contacts/{id}/fields`, `GET /crm/contacts`).

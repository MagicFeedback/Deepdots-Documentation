---
title: Changelog
description: Ændringer i godkendelses-, feedback- og kontakt-endpoints i Deepdots REST API.
sidebar:
  order: 4
---

## 2026-10

- **API-nøgler.** Deepdots kan udstede en API-nøgle til din integration: send den som `Authorization: Bearer dd_live_...`. Den udløber ikke. Se [Godkendelse](/da/rest-api/getting-started/authentication/).
- **Login via API'et.** `POST /auth/token` logger ind med en API-brugers e-mail og adgangskode, og `POST /auth/token/refresh` fornyer tokenet. Du skal ikke længere bruge en godkendelsesnøgle for at logge ind.
- Første udgivne version af REST API-dokumentationen: feedback (`POST /feedbacks`, `POST /feedbacks/bulk`, `GET /feedbacks/{id}`) og kontakter (`POST /crm/contacts/upsert`, `POST /crm/contacts/upsert/batch`, `PATCH /crm/contacts/{id}/fields`, `GET /crm/contacts`).

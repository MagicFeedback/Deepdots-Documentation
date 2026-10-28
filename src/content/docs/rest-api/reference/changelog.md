---
title: Changelog
description: Changes to the Deepdots REST API authentication, feedback and contact endpoints.
sidebar:
  order: 4
---

## 2026-10

- **Sign in through the API.** `POST /auth/token` signs in with an API user's email and password, and `POST /auth/token/refresh` renews the token. See [Authentication](/rest-api/getting-started/authentication/). You no longer need an authentication key to sign in.
- First published version of the REST API docs: feedback (`POST /feedbacks`, `POST /feedbacks/bulk`, `GET /feedbacks/{id}`) and contacts (`POST /crm/contacts/upsert`, `POST /crm/contacts/upsert/batch`, `PATCH /crm/contacts/{id}/fields`, `GET /crm/contacts`).

---
title: Changelog
description: Changes to the Deepdots REST API authentication, feedback and contact endpoints.
sidebar:
  order: 4
---

## 2026-11

- **Contacts are also matched by `externalId`.** When no active contact has the email you send, `POST /crm/contacts/upsert` and `POST /crm/contacts/upsert/batch` update the contact with the `externalId` you send, whatever its status, instead of creating another one. That contact takes the email you send and becomes active again if it was deleted; an unsubscribed one stays unsubscribed. `POST /crm/contacts` with an `externalId` your company already has updates and returns that contact the same way, instead of creating one. See [Managing contacts](/rest-api/guides/contacts/#how-updates-work).
- **Docs corrected, no API change:** `POST /crm/contacts/upsert` and its batch have always required `name`, and a lowercase `country` (`dk`) when one is sent, and answered `422` otherwise; the earlier docs showed `name` as optional and used `DK`. A batch item that doesn't match the contact fields makes the whole batch fail with `422`. `crmContactId` must be an active contact, otherwise the feedback is rejected with `404`.

## 2026-10

- **Sign in through the API.** `POST /auth/token` signs in with an API user's email and password, and `POST /auth/token/refresh` renews the token. See [Authentication](/rest-api/getting-started/authentication/). You no longer need an authentication key to sign in.
- First published version of the REST API docs: feedback (`POST /feedbacks`, `POST /feedbacks/bulk`, `GET /feedbacks/{id}`) and contacts (`POST /crm/contacts/upsert`, `POST /crm/contacts/upsert/batch`, `PATCH /crm/contacts/{id}/fields`, `GET /crm/contacts`).

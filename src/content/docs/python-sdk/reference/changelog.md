---
title: Changelog
description: Released versions of the Deepdots Python SDK, with dates and changes.
---

Every published release, newest first. Dates are the PyPI publication dates.

To install a specific version, see [Installation](/python-sdk/getting-started/installation/).

## 1.0.23 — 2026-10-20

- **New `client.crm`** for CRM objects such as tickets, matches and memberships: `upsert_objects()` and `get_objects()`, plus two connectors that take a client's records as they are, `sync_fck_users()` (FCK users to contacts) and `ingest_roboticket()` (Roboticket ticket and membership lines). Lists of any length are sent in batches of 500. See [CRM objects](/python-sdk/guides/crm-objects/).
- Every `client.crm` request is resent when it fails temporarily (502, 503, 504, a connection error or a timeout), and logs in again once when the token has expired.

## 1.0.22 — 2026-09-25

- `contacts.upsert()` and `contacts.upsert_batch()` create a contact or update the one with the same email, one at a time or in batches of any size. See [Contacts](/python-sdk/guides/contacts/#create-or-update-by-email).
- `contacts.update_fields()` adds or changes custom fields without removing the others.
- `feedbacks.update_metadata_batch()` takes `mode="append"` to add values to a metadata key instead of replacing them.

## 1.0.21 — 2026-09-16

- `feedbacks.update_metadata_batch()` adds or overwrites metadata on many feedbacks in one request, and each of them is analysed again. See [Update metrics and metadata](/python-sdk/guides/feedback/#update-metrics-and-metadata).

## 1.0.20 — 2026-08-24

- Every `value` in `answers`, `metrics`, `metadata` and `profile` is a list, in what you send and also in what `get()` and `get_id()` return.
- `upload_attachment()` refuses a file when the feedback already has 3 attachments (`max_attachments`) or already holds a file with the same content (`check_duplicate_content`). See [Upload a file attachment](/python-sdk/guides/feedback/#upload-a-file-attachment).

## 1.0.19 — 2026-08-20

- Distribution names are now written in lowercase: `deepdots` and `magicfeedback`. Cosmetic only — PyPI treats package names case-insensitively, so `pip install MagicFeedback` keeps working.

## 1.0.18 — 2026-08-20

- **New `deepdots` package name.** `pip install deepdots` now works.
- **New `deepdots_sdk` import package and `Deepdots` class**, alongside the original `magicfeedback_sdk` and `MagicFeedback`. Both refer to the same objects; existing code needs no changes.

## 1.0.17 — 2026-07-10

- **Datastore-cached authentication.** The bearer token is now read from a Google Cloud Datastore cache by default (`auth_source="datastore"`), avoiding an Identity Platform login on every use, and falling back to Identity Platform when the cached token is missing, stale or unreachable. Pass `auth_source="identity"` for the original behaviour.
- `refresh_token()` re-resolves the token and updates the auth header across all sub-API clients in place.
- `build_done_message()` builds the completion envelope for the `request-done` Pub/Sub topic.
- **Fixed:** published wheels now declare their dependencies. Up to 1.0.16 they declared none, so pip installed the SDK without `requests` or the Google Cloud libraries.

## 1.0.16 — 2026-07-07

- Packaging fix.

## 1.0.15 — 2026-07-07

- Report update endpoint.

## 1.0.14 — 2026-06-22

- `upload_attachment()` on the Feedback API — attach a file to an existing feedback item.

## 1.0.13 — 2026-05-13

- Signals API.

## 1.0.12 — 2026-04-28

- Fixed updating a feedback item.

## 1.0.11 — 2026-04-23

- Maintenance release.

## 1.0.10 — 2026-03-17

- Requests API.

## 1.0.9 — 2026-01-23

- Companies API.

## Earlier releases

These predate this changelog. The dates are accurate; the summaries are reconstructed from the commit history, so they are indicative rather than exhaustive.

| Version | Date | Notes |
|---|---|---|
| 1.0.8 | 2025-12-09 | Report updates |
| 1.0.7 | 2025-12-02 | — |
| 1.0.6 | 2025-12-02 | — |
| 1.0.5 | 2025-12-02 | Reports and Products APIs |
| 1.0.4 | 2025-09-29 | Campaigns API |
| 1.0.3.2 | 2025-09-29 | — |
| 1.0.3 | 2025-07-22 | — |
| 1.0.2 | 2025-04-30 | Integration questions |
| 1.0.1 | 2025-04-14 | Filters and list endpoints |
| 1.0.0 | 2025-04-14 | Package restructure, logging control |
| 0.0.7 | 2025-04-12 | — |
| 0.0.6 | 2025-04-07 | — |
| 0.0.5 | 2025-04-07 | Campaign sessions, metrics |
| 0.0.4 | 2024-12-18 | — |
| 0.0.3 | 2024-12-11 | Contacts and campaigns |
| 0.0.2 | 2024-09-08 | — |
| 0.0.1 | 2024-09-08 | Initial release |

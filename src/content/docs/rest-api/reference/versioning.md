---
title: Versioning and changes
description: How the Deepdots REST API stays stable, how changes are announced, and what to plan for in your integration.
sidebar:
  order: 3
---

The endpoints in these docs are core to Deepdots and we treat them as stable.

## What we commit to

- **No breaking changes without a new version.** Removing or renaming a field, changing its type, making a field required or changing a response code would only happen in a new version of the endpoint. The current version keeps working.
- **Advance notice.** Before a new version replaces an old one, we tell you well in advance and keep both running while you move over.
- **Changes are announced.** Every change is listed in the [changelog](/rest-api/reference/changelog/).

## Changes that can happen at any time

These don't break a well-built integration, so they ship without a new version:

- New optional fields in a request.
- New fields in a response.
- New endpoints.
- New values in `status` and other text fields.

## What to plan for in your integration

Keeping your integration up to date is on your side. To make that easy:

- **Ignore fields you don't know.** Don't fail when a response has a field you didn't expect.
- **Don't depend on field order** in JSON objects or on the exact text of error messages. Use the status code.
- **Read the changelog** when we announce a change, and test against the development environment (`https://api-dev.deepdots.com`) before it reaches production.
- **Keep a contact on file** with us, so announcements reach the people who maintain the integration.

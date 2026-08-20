---
title: How popups load
description: Popups are always managed in Deepdots and fetched from the API at runtime.
---

Popups are **always managed in Deepdots and fetched from the API at runtime**. There is no client-side mode: your code never defines popups by hand.

## How it works

- Popup definitions, copy, triggers, targeting, and cooldowns live in **Deepdots**.
- The SDK fetches them at runtime using your `apiKey` (`GET /sdk/{apiKey}/popups`).
- Your code just mounts the SDK and reacts to its events.

## Minimum configuration

```ts
import { DeepdotsPopups } from '@magicfeedback/popup-sdk';

const popups = new DeepdotsPopups();

popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
});

popups.autoLaunch();
```

## Optional fields

| Field    | Type                          | Default        | What it does                                      |
| -------- | ----------------------------- | -------------- | ------------------------------------------------- |
| `userId` | `string`                      | none           | Sent with every popup event for user identification. |

## Why no client-side definitions?

Defining popups in your code would split ownership of the experience between your codebase and Deepdots. Keeping a single source of truth in Deepdots lets product, marketing, and CS teams change copy, retargeting, and triggers without a code deploy on your side.

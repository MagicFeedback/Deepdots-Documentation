---
title: Popup Definition
description: The shape of a popup as delivered by the Deepdots API. Informational — you don't build this yourself.
---

This page documents the shape of a popup as **delivered by the Deepdots API**. You do not need to build these objects in your application code — Deepdots stores them and the SDK loads them at runtime.

It is published here so that integrators can understand what arrives at the SDK and what fields drive behavior.

## Shape

```ts
interface PopupDefinition {
  id: string;
  title: string;
  message: string;
  triggers: Array<{
    type: 'time_on_page' | 'scroll' | 'exit' | 'click' | 'event';
    value: number | string;
  }>;
  cooldown?: Array<{
    answered: 'SHOWED' | 'PARTIAL' | 'COMPLETED';
    cooldownDays: number;
  }>;
  actions?: {
    accept?:   { label: string; surveyId: string };
    start?:    { label: string };
    back?:     { label: string; cooldownDays?: number };
    complete?: { label: string; surveyId: string; autoCompleteParams: Record<string, unknown>; cooldownDays?: number };
    decline?:  { label: string; cooldownDays?: number };
  };
  surveyId: string;
  productId: string;
  style?: {
    theme: 'light' | 'dark';
    position: 'bottom' | 'bottom-right' | 'bottom-left' | 'top' | 'top-right' | 'top-left' | 'center';
    font?: {
      family: string;   // e.g. 'Inter' — a family name, not a CSS stack
      url?: string;     // optional woff2/woff/ttf/otf file to load it from
    };
  };
  segments?: {
    path?: string[];
    lang?: string[];
  };
}
```

## Fields that affect behavior

- **`title`** — from 1.5.0, rendered in the popup header, to the left of the close button. It belongs to the popup, so two popups on the same survey can carry different titles, and an empty string is a valid choice: the header then shows only the close button. The SDK never falls back to the survey's own title.
- **`triggers`** — when the popup is shown. See [Triggers](/popup-web/guides/triggers/) for value semantics per trigger type.
- **`cooldown`** — how long to wait before showing again, depending on the user's progress (`SHOWED`, `PARTIAL`, `COMPLETED`).
- **`segments.path`** — list of routes where the popup is allowed to appear.
- **`segments.lang`** — languages the popup is allowed to appear in, matched as a prefix against the language resolved at `init()` (`en` matches `en-US`). That language is the `language` you passed to `init()`, else `navigator.language`, else the `Intl` locale — so it works on React Native too (1.1.8+). When no language can be resolved at all, the segment is ignored and the popup is shown.
- **`style.theme` / `style.position`** — visual variant.
- **`style.font`** — custom font for the popup and the survey inside it. See [Custom font](#custom-font).

## Custom font

`style.font` overrides the SDK's default typography for one popup. It applies to the popup container, its heading, its form controls (buttons, inputs, selects), and the survey rendered inside it — in React Native too, where the font is applied inside the survey's WebView.

```json
{
  "style": {
    "theme": "light",
    "position": "center",
    "font": {
      "family": "Inter",
      "url": "https://cdn.example.com/fonts/Inter-Regular.woff2"
    }
  }
}
```

| Field | Required | Description |
| --- | --- | --- |
| `family` | yes | A single family **name** (`Inter`, `Roboto`), not a CSS stack. The SDK appends its own system fallbacks. |
| `url` | no | URL of a font file to load it from. Omit it when the font is already available on the device or loaded by your page. |

How it behaves:

- **`family` alone** — the SDK applies the family and lets the platform resolve it. Use this for system fonts or fonts your app already loads; if the device can't resolve it, the system fallback is used.
- **`family` + `url`** — the SDK injects a single `@font-face` (deduplicated across renders) with `font-display: swap`, and derives the `format()` from the file extension (`.woff2`, `.woff`, `.ttf`, `.otf`).
- **Sanitized** — `family` is stripped to letters, digits, spaces, `.`, `_` and `-`; a `url` is only accepted when it is `http(s):` or `data:` and contains no quotes, angle brackets, backslashes, whitespace, or control characters. Values that don't pass are ignored rather than injected.
- **Omitted** — the popup keeps the SDK's default typography. Nothing is injected.

:::note
Unsupported font formats (for example `.eot`) load without an explicit `format()` hint, so the browser may reject them. Prefer `woff2`.
:::

## Where to configure this

Popup definitions are created and edited in **Deepdots**, not in your code. The fields above are listed so that your team can understand exactly which knobs are available when configuring a popup.

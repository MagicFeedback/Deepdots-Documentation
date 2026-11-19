---
title: Light and dark mode
description: Dark survey Styles and survey links that follow the visitor's device.
---

Surveys take their colours from the **Style** (Admin › survey › Settings › **Survey styling**).

## Dark Styles

When the Style colours are dark (the box background, or the page background without a box colour), the survey switches to light text by itself: questions, answers, inputs, buttons and the end screen. A light brand button on a dark card gets dark text.

## Optional dark colours

Under **Survey styling** the colour fields have two tabs, **Light** and **Dark (optional)**. Fill the Dark tab when the survey is shown in both modes:

- An empty dark field uses the light colour.
- A light colour in a dark field is ignored (a default dark is used), and the Admin warns about it.

Who picks the mode:

| Where | Mode |
|---|---|
| Survey link | The visitor's device (`prefers-color-scheme`). Add `?mode=dark` or `?mode=light` to the link to force one. |
| Web popup | The `appearance` option of the [popup SDK](/popup-web/guides/dark-mode/). |
| App popup | The `appearance` option of the [native SDK](/popup-native/guides/dark-mode/) or the [Flutter plugin](/popup-flutter/guides/dark-mode/). |

Without dark colours nothing is forced: the Style decides, as before.

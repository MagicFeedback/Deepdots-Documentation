---
title: Light and dark mode
description: Dark survey colours just work, and your app can choose light, dark or the system mode.
---

The popup and the survey inside it take their colours from the survey **Style** in Deepdots. Dark mode works in two ways.

## 1. A dark Style just works

If the Style colours are dark (for example a dark *Survey box background color*), the popup switches to light text by itself: title, close button, progress, questions, answers and buttons. No code change, only `@magicfeedback/popup-sdk` **1.22.0** or later.

## 2. Follow your app's light or dark mode

If your site has light and dark mode, set the dark colours in Deepdots (**Survey styling › Dark (optional)**) and tell the SDK which mode to use:

```ts
const popups = new DeepdotsPopups();
popups.init({
  apiKey: '<your-api-key>',
  appearance: 'system', // 'light' | 'dark' | 'system'
});

// Your site has its own toggle:
popups.setAppearance('dark');
```

| `appearance` | What you get |
|---|---|
| not set | Today's behaviour: the Style colours decide. |
| `'light'` | Light popup. The Style's dark colours are ignored. |
| `'dark'` | Dark popup with the Style's dark colours. Without them it uses the Style colour if it is already dark, or a default dark palette. |
| `'system'` | Follows the device (`prefers-color-scheme`). |

- `setAppearance()` applies to the next popup that opens. `getAppearance()` returns the current value.
- With `'system'` the popup frame follows a change while it is open; the survey keeps the mode it opened with.
- On a dark card a light brand button gets dark text, so it stays readable.
- React Native: same options, through `init()` or `setupReactNative()`.

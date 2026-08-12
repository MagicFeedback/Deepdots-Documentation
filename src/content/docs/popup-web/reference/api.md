---
title: API
description: Public methods you will use from your application code.
---

These are the public methods of the `DeepdotsPopups` class. They cover everything a host application needs to mount the SDK, react to popups, and fire business events.

## `init(config)`

Initializes the SDK and fetches the popup definitions from Deepdots.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'customer-123', // optional
});
```

| Field    | Required | Description                                              |
| -------- | -------- | -------------------------------------------------------- |
| `apiKey` | yes      | Your Deepdots public API key.                            |
| `userId` | no       | Identifier sent with every popup event.                  |
| `language` | no     | BCP-47 language tag (e.g. `es-ES`). Drives both the analytics context and popup [language targeting](/popup-web/reference/popup-definition/#fields-that-affect-behavior) (`segments.lang`). Auto-detected from the browser (or `Intl` on React Native) when omitted. See [Analytics → Language detection](/popup-web/guides/analytics/#language-detection). |
| `contactAttributes` | no | Internal user attributes to send to the Contact (requires `userId`). See [`setContactAttributes`](#setcontactattributesattributes). |
| `debug`  | no       | Enables the SDK's debug output. Off by default.           |
| `logger` | no       | Custom destination for that debug output. See [Custom logger](#custom-logger). |
| `renderChrome` | no | **React Native only** (from 1.4.0). Default `true`. Set `false` when you mount your own decorated container so the survey WebView renders without the SDK's own card and backdrop. See [React Native → renderChrome](/popup-web/reference/react-native/#rendering-the-survey-without-the-sdks-card-renderchrome). |
| `showProgressBar` | no | From 1.5.0. Shows a `Question X of Y` label and a progress bar in the popup header. Omit it to respect whatever the platform configured for the survey. See [Progress bar](#progress-bar). |
| `surveyCss` | no | From 1.5.0. Your own CSS, injected as the last stylesheet so it wins the cascade. The way to restyle the question area per integration. See [Custom CSS](#custom-css). |

### Progress bar

The popup header can show how far along the survey is: a `Question 2 of 3` label — the number in bold, the rest muted — above a thin progress bar.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  showProgressBar: true,
});
```

The flag has three states:

| Value | Behavior |
| --- | --- |
| `true` | Always shown. |
| `false` | Never shown. |
| omitted | Follows the `showProgressBar` setting configured for the survey in the platform. |

The bar only appears when there is more than one page, once past the start screen, and before the completion screen. It also honors the survey's own `progressUnit` (`fraction` → `Question 2 of 3`, `percentage` → `66%`), `showProgressUnit`, and `loadingBarColor`.

:::note
Dynamic follow-up questions are not part of the page graph: they advance the bar by half a step but do not change the total. The label rounds down, so a follow-up under question 2 still reads `Question 2` while the bar moves forward.
:::

The label text is currently English only. If you need it localized, turn the unit off with `showProgressUnit` in the platform and render your own header.

### Custom CSS

The question area — wording, options, rating scales — is rendered by the Surveys SDK with a stylesheet shared by every Deepdots customer. `surveyCss` lets you restyle it for your integration alone: the string is injected as the **last** stylesheet in the popup, so it wins the cascade without anyone having to change the shared defaults.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  surveyCss: `
    .magicfeedback-label { font-size: 15px; font-weight: 600; color: #1a1a1a; }
    .magicfeedback-sublabel { font-size: 13px; color: #6b7280; }
  `,
});
```

It applies to both the web DOM popup and the React Native survey WebView.

The class names come from `@magicfeedback/native`, and they are not always the obvious ones. The ones you are most likely to want:

| Element | Selector |
| --- | --- |
| Question wording | `label.magicfeedback-label` |
| Secondary line under the question | `label.magicfeedback-sublabel` |
| Radio / checkbox option row | `.magicfeedback-radio-container`, `.magicfeedback-checkbox-container` |
| Numeric rating scale | `.magicfeedback-rating-number-container`, `.magicfeedback-rating-number-option` |
| Free-text input | `.magicfeedback-input` |

:::caution
The box around an option row is a `box-shadow`, not a `border`. Removing only the border leaves the card visible — reset `box-shadow`, `background`, and `border-radius` together.

```css
.magicfeedback-radio-container {
  box-shadow: none !important;
  background: transparent !important;
  border-radius: 0 !important;
}
```
:::

:::note
Inspect the live DOM before writing rules: open the popup in a browser (or the WebView inspector on React Native) and read the actual class names. Guessing them is the most common reason a rule appears to do nothing.
:::

To change the popup's own frame instead — its card, header, and footer — use the popup style from the platform (`theme`, `position`, `font`) or, on React Native, [`renderChrome: false`](/popup-web/reference/react-native/#rendering-the-survey-without-the-sdks-card-renderchrome).

### Custom logger

By default the SDK writes its debug output to `console`. Pass a `logger` to route it somewhere else — a log file, a remote logging service, Firebase, your own buffer — which is useful on React Native, where the Metro console is not available in production builds.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  debug: true,
  logger: {
    log: (...args) => myLogger.info(...args),
    warn: (...args) => myLogger.warn(...args),
    error: (...args) => myLogger.error(...args),
  },
});
```

Only `log` is required — `warn`, `error`, and `info` fall back to `log` when omitted. `console` itself satisfies the shape, so `logger: console` is valid and is the default.

```ts
interface DeepdotsLogger {
  log: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
}
```

:::note
`logger` only changes **where** the output goes, not how much of it there is: the SDK's debug messages still require `debug: true`. Errors the SDK reports regardless of `debug` (a throwing event listener, a renderer warning) also go through the logger once it is set.
:::

## `autoLaunch()`

Starts the triggers derived from the definitions loaded during `init()`. Call once after `init()`.

```ts
popups.autoLaunch();
```

## `triggerEvent(eventName)`

Fires a custom business event. Any popup in Deepdots configured with an event trigger that matches `eventName` will be shown (subject to cooldowns and targeting).

```ts
popups.triggerEvent('checkout_completed');
```

See [Triggers → event](/popup-web/guides/triggers/#event) for details.

## `on(event, listener)` / `off(event, listener)`

Subscribe to the SDK events: `popup_shown`, `popup_clicked`, `survey_completed`.

```ts
const onShown = (event) => analytics.track('popup_shown', event);

popups.on('popup_shown', onShown);
popups.off('popup_shown', onShown);
```

See [Events](/popup-web/guides/events/) for the full payload shape.

## `setContactAttributes(attributes)`

Sends internal user attributes that only your application knows — language, age, plan, segment, etc. — to the user's **Contact** in Deepdots, so they can be used for popup targeting and segmentation.

Requires a `userId` in `init()`: the attributes are tied to that identity (the same id from your own system). Attribute values must be `string`, `number`, or `boolean`.

```ts
const sent = await popups.setContactAttributes({
  language: 'es',
  age: 34,
  plan: 'premium',
});
```

The SDK only sends when the attributes **changed** since the last send — it keeps a diff in persistent storage — so you can call this on every user identification without generating extra requests. The returned promise resolves to:

- `true` — the attributes were sent to the backend.
- `false` — nothing changed since the last send (or tracking is disabled, or there is no `userId`).

Under the hood it performs `POST /sdk/popups/contact` with the body `{ publicKey, userId, userAttributes }`. The Contact is created automatically on the first popup fetch, so no ordering is required.

You can also provide the initial attributes directly in `init()` via `contactAttributes` (equivalent to calling `setContactAttributes` right after init):

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'customer-123',
  contactAttributes: { language: 'es', plan: 'premium' },
});
```

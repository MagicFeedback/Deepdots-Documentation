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

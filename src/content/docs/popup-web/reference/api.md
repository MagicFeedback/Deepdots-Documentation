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
| `language` | no     | BCP-47 language tag (e.g. `es-ES`) for the analytics context. Auto-detected from the browser (or `Intl` on React Native) when omitted. See [Analytics → Language detection](/popup-web/guides/analytics/#language-detection). |
| `contactAttributes` | no | Internal user attributes to send to the Contact (requires `userId`). See [`setContactAttributes`](#setcontactattributesattributes). |

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

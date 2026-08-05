---
title: Analytics
description: Automatic behavioral analytics and custom event tracking with the Deepdots Popup SDK.
---

The Deepdots Popup SDK includes a built-in analytics layer that collects behavioral data from your users and forwards it to a dedicated integration in your Deepdots workspace. This lets you measure engagement, navigation patterns, and business-critical events without adding a separate analytics tool.

## Setup

Add an `analytics` object to `init()` with the `publicKey` and `integration` ID of the integration created in your Deepdots workspace. Without it the SDK runs in **dry-run mode** — all events are logged to the console but nothing is sent.

```ts
import { DeepdotsPopups } from '@magicfeedback/popup-sdk';

const popups = new DeepdotsPopups();
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  analytics: {
    publicKey: 'YOUR_ANALYTICS_PUBLIC_KEY',
    integration: 'YOUR_INTEGRATION_ID',
  },
});
```

:::tip
Omitting `analytics` is safe during development — dry-run mode logs every event payload to the console exactly as it would be sent, so you can verify the data before going live.
:::

---

## Automatic data

The following data is collected with **zero extra code** as long as the SDK is initialized:

| Data | How | Where it appears |
| --- | --- | --- |
| Screen views (`deepdots_page_view`) | History API (pushState / popstate / hashchange) | Events |
| Active engagement time (`deepdots_user_engagement`) | `visibilitychange` listener | Events |
| Persistent user identity (`user_id`) | Generated on first visit, stored in `localStorage` | Metadata |
| Device type | Parsed from User-Agent (mobile / tablet / desktop) | Context |
| User agent | `navigator.userAgent` | Context |
| Language (`deepdots_language`) | Auto-detected (see [Language detection](#language-detection)) | Context |
| App version | `appVersion` passed to `init()` | Context |

Each flush (tab hidden, page closed, or manual `flushAnalytics()`) sends the accumulated events as a batch. The backend groups batches by session so you see a single timeline per user visit, not one record per flush.

:::note[React Native]
In React Native, History API is not available. Use [`setScreen(name)`](#react-native) to report navigation manually. Lifecycle events use `onForeground()` / `onBackground()` instead of `visibilitychange`.
:::

### Language detection

The language reported on the analytics context — sent as `deepdots_language` in the Feedback metadata — is resolved **automatically**, in this order:

1. The `language` passed to `init()` — an explicit [BCP-47](https://www.rfc-editor.org/info/bcp47) tag such as `'es-ES'`. Set this when your app has its own i18n and you want to force the reported language.
2. `navigator.language` — the browser language (web).
3. The `Intl` locale (`Intl.DateTimeFormat().resolvedOptions().locale`) — the fallback used when `navigator.language` is unavailable. This is what makes detection work on **React Native with Hermes**, where `navigator.language` does not exist.
4. If none of these resolve, the field is omitted.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  analytics: { publicKey: 'YOUR_ANALYTICS_PUBLIC_KEY', integration: 'YOUR_INTEGRATION_ID' },
  language: 'es-ES', // optional — force the analytics language; auto-detected when omitted
});
```

:::note
This is the language of the **analytics integration** metadata, not the survey's identity metadata. Unlike navigation and lifecycle, language detection needs no host wiring in React Native — the `Intl` fallback handles it. `country` / `city` are resolved separately by geo-IP.
:::

The resolved language is also what popup **language targeting** (`segments.lang`) is matched against, so setting `language` explicitly pins both at once. In React Native this requires **1.1.8 or newer** — see [React Native → Language segments](/popup-web/reference/react-native/#language-segments).

---

## Sessions

A session is one continuous visit. The backend owns the session id and stitches batches together by `user_id`, so a visit reads as a single timeline instead of one record per flush.

Since **1.2.0** both ends of a session are signalled explicitly:

- **`deepdots_session_start`** — on every session open. That means `init()`, returning to the foreground, granting consent with `setTrackingEnabled(true)`, and after a user change. If you init with `trackingEnabled: false`, the first session opens when consent is granted.
- **`deepdots_session_end`** — on close, with a `reason`. The closing batch is sent with `completed: true`, which is what tells the backend the record is finished.

The closing batch flushes everything still open, in order: the current screen's `deepdots_page_view`, any pending `deepdots_mini_service_exit`, the accumulated `deepdots_user_engagement`, and finally `deepdots_session_end`. Nothing is left behind for a flush that will never come.

| `reason` | When |
| --- | --- |
| `page_hide` | The page closes (`pagehide`) — web |
| `background` | The app goes to background (`onBackground()`) — React Native |
| `user_change` | `setUserId()` switched the user |
| `tracking_disabled` | `setTrackingEnabled(false)` |
| `manual` | `endSession()` |

### `endSession()`

Closes the session explicitly. Use it at logout or at the end of a self-contained flow, when the visit is over but the page or app is not:

```ts
popups.endSession();
```

The next tracked event opens a new session.

### `setUserId(userId?)`

Reports a user change — login, logout, or account switch. It closes the previous user's session with `reason: 'user_change'`, swaps the identity, and opens a new session, so the two users never share a timeline:

```ts
// Login: attribute what follows to your own user id
popups.setUserId('customer-123');

// Logout: back to the SDK's anonymous id
popups.setUserId();
```

:::caution
User attributes and metrics set with [`setUserAttributes`](#user-attributes) and [`setMetric`](#metrics) are **discarded** on a user change — they belonged to the previous user. Set them again after switching.
:::

:::note
`setUserId()` is for a change *during* the session. To identify the user you already know at startup, pass `userId` to `init()`.
:::

---

## Custom events

Use `track(name, params?)` to record any business event. Event names are free-form strings — use lowercase snake_case to stay consistent with the automatic events.

```ts
popups.track('add_to_cart', { product_id: 'p-123', value: 49.9, currency: 'EUR' });
popups.track('checkout_started');
popups.track('plan_upgraded', { plan: 'pro', billing: 'annual' });
```

### Search

`trackSearch` records a search query together with the number of results. The SDK automatically adds `has_results: boolean` from the count.

```ts
popups.trackSearch('running shoes', 0);   // no results — has_results: false
popups.trackSearch('t-shirt', 142);       // has_results: true
```

### Findability friction

Record moments where users struggle to find what they need:

```ts
popups.trackFindabilityFriction('checkout_address');
popups.trackFindabilityFriction('plan_comparison');
```

### Funnel steps

Track steps inside a named funnel. Group related steps under the same `funnel` and `taskId` so the backend can compute conversion rates:

```ts
popups.trackFunnelStep('onboarding', 'account_created', 'task-42');
popups.trackFunnelStep('onboarding', 'profile_completed', 'task-42');
popups.trackFunnelStep('onboarding', 'first_popup_seen', 'task-42');
```

### Meaningful interactions

Record a meaningful interaction — a moment that signals the user got real value out of your app. `interactionType` is the grouping dimension, so keep a small, stable set of names (`get_help`, `homepage`, `contact_support`):

```ts
popups.trackMeaningfulInteraction('get_help');
popups.trackMeaningfulInteraction('homepage', { screen: '/home' });
```

Each call emits a `deepdots_meaningful_interaction` event that powers the **Effectiveness** dashboard.

:::caution
Use this helper rather than `track('meaningful_interaction')`. A custom event goes out namespaced as `deepdots_event_meaningful_interaction`, which the Effectiveness reports do not read — so the data would land in the integration but never show up on that page. A call with an empty `interactionType` is discarded with a console warning.
:::

---

## Mini-service tracking

A mini-service is any bounded workflow inside your app (checkout flow, onboarding wizard, support chat). The SDK tracks entry, exit, and duration automatically once you signal the boundaries:

```ts
// User enters the checkout flow
popups.enterMiniService('checkout', 'home_banner');

// … user completes or abandons the flow …

// User leaves — pass the same name; duration is computed automatically
popups.exitMiniService('checkout');
```

Multiple mini-services can be active at once (e.g. a support chat opened during checkout). Always close each one by **name** so the right workflow gets its `deepdots_mini_service_exit` and duration:

```ts
popups.enterMiniService('checkout', 'home_banner');
popups.enterMiniService('support_chat', 'fab');   // both active now
popups.exitMiniService('checkout');               // closes checkout; support_chat stays open
```

Any survey shown while a mini-service is active automatically receives a `mini_service` metadata tag (the most recently entered one), which lets you filter CSAT results by workflow context in Deepdots.

---

## User attributes

Call `setUserAttributes` to attach business-level attributes to the user's analytics context. These are included in every subsequent flush.

```ts
popups.setUserAttributes({
  plan: 'pro',
  registration_status: 'registered',
  sector: 'retail',
});
```

Attributes are cumulative — each call merges with previously set ones.

### Contact record

`setContactAttributes` sends the attributes to `POST /sdk/popups/contact`, creating or updating the user's contact record in Deepdots. This endpoint is only called when a `userId` was provided in `init()` and tracking is enabled.

```ts
const sent = await popups.setContactAttributes({ language: 'en', age: 34, plan: 'premium' });
// sent: true if a POST was made, false if attributes haven't changed (deduplication)
```

You can also pass `contactAttributes` directly in `init()` to fire the contact update on startup:

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'user-123',
  contactAttributes: { plan: 'premium', language: 'en' },
});
```

---

## Metrics

Call `setMetric(key, value)` to record a **measurable value** — a quantity you want to report alongside the user's analytics context, such as cart value or number of items in the cart.

```ts
popups.setMetric('cart_value', 49.99);
popups.setMetric('items_in_cart', 3);
```

The signature is:

```ts
setMetric(key: string, value: string | number | boolean): void
```

Metrics land in a **dedicated `metrics` field** of the analytics payload (`POST /sdk/feedback`), kept separate from `metadata` and from [user attributes](#user-attributes).

### Behavior

- **Persistent** — once set, the value is re-sent on every flush until it changes.
- **Overwrites by key** — calling `setMetric` again with the same key replaces the previous value.
- **Coerced to string** — the value is stored as a string on the wire (`49.99` → `"49.99"`).
- **Empty keys are ignored** — a call with an empty `key` is a no-op.
- **Respects the kill-switch** — it is a no-op while tracking is disabled (see [Privacy and consent](#privacy-and-consent)).

### Metrics vs. user attributes

Both attach context to the user, but they answer different questions:

| | [`setUserAttributes`](#user-attributes) | `setMetric` |
| --- | --- | --- |
| Represents | Dimensions to **break down** by | Measurable **values** to report |
| Example | `plan: 'pro'`, `sector: 'retail'` | `cart_value: 49.99`, `items_in_cart: 3` |
| Payload field | `metadata` | `metrics` |

Use attributes for the *who* — the categories you filter and group by — and metrics for the *how much* — the quantities you measure.

---

## Messaging

Track the lifecycle of your app's notifications (push and in-app) so Deepdots can measure delivery, click-through, and conversion per message. Use a single method, `trackMessage(stage, options)`, at each stage of the message funnel:

```ts
// The notification was delivered (push received, or in-app message shown)
popups.trackMessage('delivered', { id: 'msg-42', title: 'Summer Sale', channel: 'push', campaign: 'summer_sale' });

// The user tapped / clicked it
popups.trackMessage('clicked', { id: 'msg-42', title: 'Summer Sale', channel: 'push' });

// The user completed the intended action (e.g. purchased)
popups.trackMessage('converted', { id: 'msg-42', title: 'Summer Sale', channel: 'push', value: 49.9, currency: 'EUR' });
```

| Field | Type | Description |
| --- | --- | --- |
| `stage` (1st arg) | `'delivered'` / `'clicked'` / `'converted'` | Stage of the message funnel |
| `id` | string | Correlates the stages of the same message |
| `title` | string | Grouping dimension for the Messaging metrics |
| `channel` | `'push'` / `'in_app'` | Delivery channel |
| `campaign` | string? | Campaign name (optional) |
| `value` / `currency` | number / string | Conversion value (typical on `converted`) |
| `params` | object? | Any extra key/value pairs |

Each call emits one `deepdots_message` event; the backend groups by `title` (and breaks down by registration status / channel) to compute delivered counts, CTR, unique click-through users, conversion rate, and action users.

:::note
Messaging is host-instrumented — the SDK can't observe your notification system automatically, so you call `trackMessage` from your own push/in-app handlers.
:::

### Rules for a correct funnel

CTR and conversion rate are ratios over `delivered`. If the stages don't line up, those metrics come out wrong — and a missing `delivered` produces impossible values, because the denominator is zero.

1. **Send all three stages.** `delivered` goes out when the message reaches the device, *before* the user opens it — for in-app messages, when it is rendered. Without it there is no denominator.
2. **Use the same `id` across the three stages.** It is what correlates the funnel, and it must be unique per send, not per campaign.
3. **One `id`, one channel.** If a campaign goes out both as a push and as an in-app message, use two different `id` values sharing the same `campaign`.
4. **One call per stage.** If your click handler can run through two paths — opening the notification plus a deep link — make sure only one of them emits `clicked`.

### Validation

Starting in **1.2.0** the SDK discards calls that break these rules instead of forwarding them, and warns on the console (the warning text ships in Spanish):

```
[DeepdotsPopups] trackMessage descartado (channel_conflict): message_id "msg-42" ya se reportó en channel "push"; se descarta "in_app"
```

| Rule | What is discarded | `reason` |
| --- | --- | --- |
| `channel` must be `push` or `in_app` | Any other value | `invalid_channel` |
| Each `(id, stage)` pair is sent once | The 2nd call to the same stage of the same message | `duplicate_stage` |
| An `id` keeps its channel | Events on a channel other than the first one seen | `channel_conflict` |

The checks last for the session and are per device, and they track up to 500 message ids (oldest evicted first). A rejected call doesn't consume state: after a `channel_conflict` on `in_app`, the same stage on the correct channel is still sent.

If these warnings show up while you integrate, they are pointing at a real double-count — fix the call site rather than ignoring them.

:::caution[`delivered` on push has a structural limit]
On the device, delivery is only observable if your app process receives the notification: a *data* push on Android, a `UNNotificationServiceExtension` with `mutable-content` on iOS. Notifications that arrive while the app is killed, or with restricted permissions, never fire it — so a `delivered` count measured in the app sits below the real one, and CTR reads high.

For a reliable denominator, take `delivered` from your sending provider (FCM/APNs or your campaign platform), and treat the SDK's `delivered` as a secondary signal and as the source of truth for `in_app`.
:::

---

## Crash & error reporting

The SDK captures application errors and surfaces them as `deepdots_app_crash` events, powering the Stability metrics (crash-free users, crashes by release and device). A `deepdots_session_start` event is emitted on every [session open](#sessions) so the backend can compute crash-free rates.

### Automatic capture

Unhandled errors are captured automatically — on the web via `window.onerror` / `unhandledrejection`, and in React Native via `global.ErrorUtils` (wired by `setupReactNative`). Captured crashes are persisted locally and replayed on the next launch, because the process may die before the next flush — so the crash that ended a session still reaches Deepdots.

### Reporting errors manually

Use `reportError` for handled errors, with an optional severity and free-form context:

```ts
try {
  await checkout();
} catch (e) {
  popups.reportError(e, { severity: 'error', context: { screen: 'Checkout', order_id: 'o-42' } });
}
```

| Option | Values | Default |
| --- | --- | --- |
| `severity` | `'fatal'` / `'error'` / `'warning'` | `'error'` |
| `handled` | `boolean` | `true` |
| `context` | free-form key/value map (prefixed `ctx_` in the payload) | — |

Crash context (app version, OS, device) is captured at the moment of the crash, so a crash on an older release still reports the version it happened on.

:::caution
Coverage is for **managed JS errors**: unhandled errors on the web (`window.onerror` / `unhandledrejection`) and on React Native (`global.ErrorUtils`), plus anything you send via `reportError`. **Native** crashes under React Native (iOS / Android) are **not** captured — if you already run a native crash reporter (Crashlytics, Sentry), forward its reports to `reportError`.
:::

Crash reporting respects the same consent kill-switch as the rest of analytics (`trackingEnabled` / `setTrackingEnabled`).

---

## Privacy and consent

Set `trackingEnabled: false` in `init()` to start with all analytics and contact tracking disabled — useful when you need explicit user consent before collecting data.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  trackingEnabled: false,
});

// Later, once the user gives consent:
popups.setTrackingEnabled(true);
```

`setTrackingEnabled(false)` closes the current [session](#sessions) with `reason: 'tracking_disabled'` and suspends all outbound calls (analytics, contact) — the data collected before the opt-out is still delivered, rather than dropped. `setTrackingEnabled(true)` resumes them, assigns a persistent `user_id` if one was not already stored, and opens a new session.

---

## React Native

In React Native, two automatic behaviors require explicit host integration:

### Navigation tracking

Because History API is unavailable, report screen changes manually after each navigation event:

```ts
// In React Navigation's onStateChange callback:
popups.setScreen(route.name);
```

### Lifecycle (engagement time)

Connect the SDK to the app's foreground/background lifecycle so engagement time is measured correctly and events are flushed when the app goes to the background:

```ts
import { AppState } from 'react-native';

AppState.addEventListener('change', (state) => {
  if (state === 'active') popups.onForeground();
  else popups.onBackground(); // ends the session and flushes
});
```

:::caution
Since **1.2.0** `onBackground()` **ends the session** (`reason: 'background'`) and `onForeground()` opens a new one. Only call it for a real background transition — on iOS, do not wire it to `willResignActive`: the `inactive` state is transient (an incoming call, the app switcher) and would split one visit into two sessions.
:::

:::tip
The `<DeepdotsProvider>` from `@magicfeedback/popup-sdk/react-native` (and `setupReactNative()` under it) wires the `AppState` lifecycle for you — but **not** `setScreen`: navigation always has to be reported from your navigator. See the [React Native reference](/popup-web/reference/react-native/) for the complete setup.
:::

---

## Previewing events before sending

During development, inspect the current event buffer without flushing:

```ts
const preview = popups.previewAnalytics();
console.log(preview.events);   // all events queued since last flush
```

To force a flush manually (useful for testing):

```ts
popups.flushAnalytics();
```

## Delivery guarantees

Flushes happen automatically — every 30 s in the foreground, when the buffer reaches 20 events, when the tab is hidden, and when the page or app closes. You rarely need to call `flushAnalytics()` yourself. From **1.1.8** onwards the channel is hardened so that the last batch of a visit — the one carrying the closing `deepdots_page_view` and `deepdots_user_engagement` — is not lost:

- **Survives navigation and close** — the request uses `keepalive`, and the final flush at page close switches to `navigator.sendBeacon`. Browsers no longer cancel it mid-flight.
- **Retries transient failures** — a network error or a `5xx` / `408` / `429` puts the batch back at the front of the buffer, in chronological order, to be retried on the next flush. Up to 200 events are held; beyond that the oldest are dropped.
- **Reports permanent failures** — a `4xx` (for example a `406` for an unknown Contact) is logged with its status and response body and the batch is discarded, instead of failing silently.
- **Keeps one record per visit** — until the backend has returned a session id, batches are serialized rather than sent in parallel, so a visit doesn't get split across two records.

:::note
Retrying makes delivery **at-least-once**: if a response is lost after the backend already processed a batch, those events are sent again. An event is uniquely identified by user + event name + timestamp — so if you build reporting on the raw integration data, deduplicate on that triple.
:::

`flushAnalytics()` accepts a `final` flag, which is what the SDK uses internally at page close. Pass it only if you are implementing your own shutdown path — it prefers `sendBeacon` and does not wait for the response:

```ts
popups.flushAnalytics({ final: true });
```

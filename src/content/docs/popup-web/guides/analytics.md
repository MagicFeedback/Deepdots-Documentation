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
| Browser language | `navigator.language` | Context |
| App version | `appVersion` passed to `init()` | Context |

Each flush (tab hidden, page closed, or manual `flushAnalytics()`) sends the accumulated events as a batch. The backend groups batches by session so you see a single timeline per user visit, not one record per flush.

:::note[React Native]
In React Native, History API is not available. Use [`setScreen(name)`](#react-native) to report navigation manually. Lifecycle events use `onForeground()` / `onBackground()` instead of `visibilitychange`.
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
Messaging is host-instrumented — the SDK can't observe your notification system automatically, so you call `trackMessage` from your own push/in-app handlers. For **push**, the true "delivered" signal is usually most reliable from your push provider/backend; the app reliably sees the click/conversion.
:::

---

## Crash & error reporting

The SDK captures application errors and surfaces them as `deepdots_app_crash` events, powering the Stability metrics (crash-free users, crashes by release and device). A `deepdots_session_start` event is emitted on every `init()` so the backend can compute crash-free rates.

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

`setTrackingEnabled(false)` suspends all outbound calls (analytics, contact). `setTrackingEnabled(true)` resumes them and assigns a persistent `user_id` if one was not already stored.

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
  else popups.onBackground(); // also flushes pending analytics
});
```

:::tip
If you use `setupReactNative()`, both `setScreen` (via React Navigation) and the `AppState` wiring are handled for you automatically. See the [React Native reference](/popup-web/reference/react-native/) for the complete setup.
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

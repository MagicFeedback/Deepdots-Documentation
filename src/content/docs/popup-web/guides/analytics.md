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
| Screen views (`page_view`) | History API (pushState / popstate / hashchange) | Events |
| Active engagement time (`user_engagement`) | `visibilitychange` listener | Events |
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

// User leaves — duration is computed automatically
popups.exitMiniService();
```

Any survey shown while a mini-service is active automatically receives a `mini_service` metadata tag, which lets you filter CSAT results by workflow context in Deepdots.

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

---
title: React Native
description: How to integrate the Deepdots Popup SDK in a React Native application using the dedicated /react-native entry point.
---

The SDK ships a **dedicated React Native entry point** — `@magicfeedback/popup-sdk/react-native` — that does the whole integration for you: persistent storage, device info, platform, app lifecycle, crash capture, and rendering surveys in a `Modal` + `WebView`.

For most apps the integration is one component: wrap your app in `<DeepdotsProvider>`.

## Installation

```bash
npm install @magicfeedback/popup-sdk react-native-webview
```

:::caution[Minimum version]
The `/react-native` entry point exists from **1.1.1** onwards — on earlier versions the import fails, because the package exposes no such subpath. For React Native, install **1.1.8 or newer**: up to 1.1.7, a popup configured with a language segment crashed the whole trigger evaluation in RN (see [Language segments](#language-segments)).

```bash
npm install @magicfeedback/popup-sdk@^1.1.8
```
:::

Two optional packages unlock the rest of the feature set. Install both unless you have a reason not to:

```bash
npm install react-native-mmkv react-native-device-info
```

```bash
cd ios && pod install
```

| Package | Required | What it gives you |
| --- | --- | --- |
| `react-native-webview` | ✅ | Renders the survey UI |
| `react-native-mmkv` | Recommended | Persists the `user_id` across app restarts (returning users) |
| `react-native-device-info` | Recommended | Device type, OS version, model, app version (Technology metrics) |

All of them are declared as **optional peer dependencies**: the SDK detects what is installed at runtime and degrades gracefully. Without MMKV the `user_id` lives in memory only and a fresh one is generated on every launch; without `react-native-device-info` the device context is omitted.

:::tip
On recent React Native versions (React 19) `npm install` may report peer conflicts for the optional packages. Install them with `--legacy-peer-deps`.
:::

## Quick start

```tsx
// App.tsx
import { DeepdotsProvider } from '@magicfeedback/popup-sdk/react-native';

export default function App() {
  return (
    <DeepdotsProvider
      config={{
        apiKey: 'YOUR_PUBLIC_API_KEY',
        nodeEnv: __DEV__ ? 'development' : 'production',
        userId: 'customer-123',
        appVersion: '1.4.0',
        // Omit `analytics` to stay in dry-run mode (events logged, nothing sent).
        analytics: {
          publicKey: 'YOUR_ANALYTICS_PUBLIC_KEY',
          integration: 'YOUR_INTEGRATION_ID',
        },
      }}
    >
      <YourNavigation />
    </DeepdotsProvider>
  );
}
```

`config` accepts the same object as [`init(config)`](/popup-web/reference/api/#initconfig) — the Provider fills in the React Native specific fields (`storage`, `device`, `platform`) for you.

### What the Provider wires automatically

| Concern | How |
| --- | --- |
| Persistent identity | MMKV instance (`id: 'deepdots-sdk'`) when `react-native-mmkv` is installed |
| Device info | `react-native-device-info` when installed |
| Platform | `Platform.OS` → `'ios'` / `'android'` in the analytics context |
| Engagement time | `AppState` → `onForeground()` / `onBackground()` (flushes on background) |
| Crash capture | `global.ErrorUtils` → unhandled JS errors as `deepdots_app_crash` |
| Survey rendering | `ReactNativePopupRenderer` + a `Modal` with a `WebView`, mounted on demand |

Two things are **not** automatic and need a few lines from you: [navigation tracking](#navigation-tracking) and [starting the triggers](#showing-popups).

## Accessing the SDK

`useDeepdots()` returns the shared `DeepdotsPopups` instance from anywhere under the Provider. The full analytics API is available — see the [Analytics guide](/popup-web/guides/analytics/).

```tsx
import { useDeepdots } from '@magicfeedback/popup-sdk/react-native';

function ProductScreen() {
  const dd = useDeepdots();

  return (
    <Button
      title="Add to cart"
      onPress={() => {
        dd.track('add_to_cart', { product_id: 'p-123', value: 49.9 });
        dd.triggerEvent('added_to_cart');
      }}
    />
  );
}
```

## Showing popups

The Provider initializes the SDK and fetches the popup definitions, but it does **not** start the triggers — call `autoLaunch()` once from a component inside the Provider:

```tsx
function DeepdotsBootstrap() {
  const dd = useDeepdots();

  useEffect(() => {
    dd.autoLaunch();
  }, [dd]);

  return null;
}
```

Alternatively, skip `autoLaunch()` and show popups imperatively with `dd.triggerEvent('some_event')` — matching `event` triggers fire immediately.

:::note[Which triggers work in React Native]
`time_on_page` and `event` work as documented. `scroll`, `click`, and `exit` depend on the DOM (`window.scrollY`, `document.getElementById`, History API) and never fire in React Native — use `event` triggers plus `triggerEvent()` instead. Popup `path` segments are also skipped (there is no `location`), so a path-scoped popup is treated as matching everywhere. `lang` segments **do** work — see below.
:::

### Language segments

A popup restricted to certain languages (`segments.lang`) is evaluated against the language the SDK resolved at `init()`: your explicit `language`, else `navigator.language`, else the `Intl` locale. That last fallback is what makes it work under Hermes, where `navigator.language` does not exist. Matching is by prefix, so a segment of `en` matches `en-US`.

If you want to control targeting explicitly instead of relying on detection — recommended when your app has its own i18n — pass the language in the config:

```tsx
<DeepdotsProvider config={{ apiKey: 'YOUR_PUBLIC_API_KEY', language: 'es-ES' }}>
```

:::caution
On **1.1.7 and earlier** this path read `navigator.language` directly. In React Native `navigator` exists but has no `language`, so any popup with a language segment threw while the trigger was being evaluated — which aborted the evaluation of **every** popup for that event, not just that one. Fixed in 1.1.8; if you see triggers silently doing nothing in RN, check your installed version first.
:::

When a popup is shown, the Provider mounts a full-screen `Modal` containing a `WebView` with the survey. The survey HTML is self-contained but loads `@magicfeedback/native` from a CDN, so **rendering a survey requires network access**. Popup status (`SHOWED` / `PARTIAL` / `COMPLETED`) is reported to `POST /sdk/popups` automatically, and the persistent `user_id`, `session_id`, and active `mini_service` are injected into the survey's identity metadata.

## Navigation tracking

React Native has no History API, so screen views are not detected automatically. Report them with `setScreen(name)` — the SDK emits a `deepdots_page_view` event with the duration of the **previous** screen when you report the next one.

With React Navigation:

```tsx
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { useDeepdots } from '@magicfeedback/popup-sdk/react-native';

const navRef = createNavigationContainerRef();

function Navigation() {
  const dd = useDeepdots();

  const report = () => {
    const route = navRef.getCurrentRoute();
    if (route) dd.setScreen(route.name);
  };

  return (
    <NavigationContainer ref={navRef} onReady={report} onStateChange={report}>
      <YourStack />
    </NavigationContainer>
  );
}
```

Screen names are normalized the same way as web paths: query strings are dropped and numeric/UUID segments collapse to `:id`, so `/product/123` and `/product/456` both report as `/product/:id`.

## Advanced: manual setup without the Provider

If you need your own surface (a bottom sheet, a dedicated screen) or your own React tree, use `setupReactNative()` and the `ReactNativePopupRenderer` directly. Both come from the **main** entry point.

```tsx
import { useEffect, useRef, useState } from 'react';
import { AppState, Modal, Platform, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { MMKV } from 'react-native-mmkv';
import DeviceInfo from 'react-native-device-info';
import {
  DeepdotsPopups,
  ReactNativePopupRenderer,
  setupReactNative,
  type ReactNativeSurveyPayload,
} from '@magicfeedback/popup-sdk';

const sdk = new DeepdotsPopups();

export function DeepdotsHost({ children }: { children: React.ReactNode }) {
  const [survey, setSurvey] = useState<ReactNativeSurveyPayload | null>(null);
  const rendererRef = useRef<ReactNativePopupRenderer | null>(null);

  useEffect(() => {
    const renderer = new ReactNativePopupRenderer({
      onShow: (payload) => setSurvey(payload),
      onHide: () => setSurvey(null),
    });
    rendererRef.current = renderer;

    // Sets the renderer, injects storage/device/platform, calls init()
    // and wires AppState → onForeground/onBackground. Returns a cleanup fn.
    return setupReactNative(
      sdk,
      { apiKey: 'YOUR_PUBLIC_API_KEY', nodeEnv: __DEV__ ? 'development' : 'production' },
      {
        mmkv: new MMKV({ id: 'deepdots-sdk' }),
        deviceInfo: DeviceInfo,
        appState: AppState,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        renderer,
      },
    );
  }, []);

  return (
    <>
      {children}
      {survey ? (
        <Modal visible transparent animationType="slide">
          <View style={{ flex: 1 }}>
            <WebView
              style={{ flex: 1 }}
              originWhitelist={['*']}
              javaScriptEnabled
              source={{ html: survey.html, baseUrl: 'https://sdk.deepdots.com/' }}
              onMessage={(e) => rendererRef.current?.handleMessage(e.nativeEvent.data)}
            />
          </View>
        </Modal>
      ) : null}
    </>
  );
}
```

The renderer is a **bridge**, not a stub: `onShow` hands you `{ surveyId, productId, html }` ready for `<WebView source={{ html }}>`, and `handleMessage` translates the WebView messages into SDK events — first interaction → `popup_clicked` (`PARTIAL`), completion → `survey_completed` (`COMPLETED`).

:::caution[`survey_completed` no longer closes the popup (1.5.0)]
Up to 1.4.0 the renderer unmounted the WebView as soon as the survey was completed. That hid the survey's own thank-you screen, which had just been rendered. From 1.5.0 `survey_completed` only reports the `COMPLETED` status; `onHide` fires later, when the user taps the completion button and the WebView sends `popup_close`.

If your app assumed that `survey_completed` was the end of the flow, move that logic to `onHide`. `survey_completed` still fires exactly once per completed survey, so it remains the right place to report the completion — just not to tear down the UI.
:::

:::caution[Set `baseUrl` on the WebView]
Always pass `source={{ html, baseUrl: 'https://sdk.deepdots.com/' }}`. Without a `baseUrl` the WebView runs on an opaque origin, and the survey's internal fetch to load `@magicfeedback/native` is blocked in WKWebView (iOS) — the survey never appears. Also give the `WebView` a real size (`style={{ flex: 1 }}`); depending on your layout it can otherwise collapse to zero height.
:::

### Rendering the survey without the SDK's card (`renderChrome`)

From **1.4.0**, when you mount your own decorated container (a `Modal`, bottom sheet, or screen with its own card, background, rounded corners, or backdrop), pass `renderChrome: false` in the config:

```tsx
setupReactNative(
  sdk,
  { apiKey: 'YOUR_PUBLIC_API_KEY', renderChrome: false },
  { /* deps */ },
);
```

Since **1.3.0** the survey HTML draws its own card and backdrop (header with a close button, footer with the navigation buttons, rounded card, dimmed background). If your own container is also decorated, the two stack into a **"double modal"** — a card inside a card. `renderChrome: false` makes the WebView HTML transparent and edge-to-edge so it fills your container, while keeping the survey fully functional (message bridge, form, back/start/complete/send buttons, and the close button). You own the outer frame; the SDK owns the survey.

The flag only affects React Native (the survey WebView HTML). It has no effect on the web DOM popup, and it is ignored by the default `<DeepdotsProvider>`, whose `Modal` is already transparent and full-screen (so the built-in path shows a single card). Use it on the manual path shown above.

### Restyling the survey itself

`renderChrome` decides who draws the frame. To restyle what is **inside** it — question wording, options, rating scales, and the SDK's own header, progress bar and footer — pass your own stylesheet in [`surveyCss`](/popup-web/reference/api/#custom-css). It is injected as the last stylesheet in the WebView, so it wins the cascade without touching the defaults shared by every Deepdots customer.

That page also lists the class names to target, including which ones differ between the web popup and the React Native WebView.

### `setupReactNative(sdk, config, deps)`

| Dep | Type | Default when omitted |
| --- | --- | --- |
| `mmkv` | MMKV instance | `config.storage`, else in-memory |
| `deviceInfo` | `react-native-device-info` module | `config.device`, else omitted |
| `appState` | `AppState` | No lifecycle wiring |
| `platform` | `'ios'` / `'android'` / `'web'` | `config.platform`, else `'web'` |
| `renderer` | `PopupRenderer` | The SDK's default renderer |
| `errorUtils` | `global.ErrorUtils` | `globalThis.ErrorUtils` if present |

Every dep is optional. Lower-level helpers are exported too if you want to build the pieces yourself: `mmkvStorage(mmkv)` (a synchronous `KeyValueStorage` adapter), `collectRnDevice(deviceInfo)`, and `buildSurveyHtml(options)`.

## Common pitfalls

:::caution
Mount `<DeepdotsProvider>` **once**, above your navigator. Mounting it inside a screen unmounts the modal on navigation and loses in-flight surveys.
:::

:::caution
Import the Provider from `@magicfeedback/popup-sdk/react-native`. The default entry point is browser-oriented — it works in RN (the survey renderer is loaded lazily), but you would have to wire storage, device info, lifecycle, and the WebView yourself.
:::

:::caution
Without `react-native-mmkv` the `user_id` is not persisted: every launch looks like a new user, and cooldowns ("do not show again for N days") reset with the app.
:::

:::caution
Native iOS/Android crashes are not captured — only unhandled **JS** errors via `global.ErrorUtils`. If you run Crashlytics or Sentry, forward their reports to `reportError()`.
:::

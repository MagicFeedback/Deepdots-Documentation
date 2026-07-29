---
title: React Native
description: Sådan integrerer du Deepdots Popup SDK i en React Native-applikation via det dedikerede /react-native entry point.
---

SDK'et leveres med et **dedikeret React Native entry point** — `@magicfeedback/popup-sdk/react-native` — som klarer hele integrationen for dig: persistent storage, device info, platform, app-livscyklus, fejlopsamling og rendering af surveys i en `Modal` + `WebView`.

I de fleste apps er integrationen én komponent: pak din app ind i `<DeepdotsProvider>`.

## Installation

```bash
npm install @magicfeedback/popup-sdk react-native-webview
```

:::caution[Minimumsversion]
`/react-native`-entry pointet findes fra **1.1.1** og frem — på tidligere versioner fejler importen, fordi pakken ikke eksponerer den subpath. Til React Native skal du installere **1.1.8 eller nyere**: op til 1.1.7 fik en popup med sprogsegmentering hele trigger-evalueringen til at crashe i RN (se [Sprogsegmenter](#sprogsegmenter)).

```bash
npm install @magicfeedback/popup-sdk@^1.1.8
```
:::

To valgfrie pakker låser resten af funktionaliteten op. Installér begge, medmindre du har en grund til ikke at gøre det:

```bash
npm install react-native-mmkv react-native-device-info
```

```bash
cd ios && pod install
```

| Pakke | Påkrævet | Hvad den giver dig |
| --- | --- | --- |
| `react-native-webview` | ✅ | Renderer survey-UI'et |
| `react-native-mmkv` | Anbefalet | Bevarer `user_id` på tværs af app-genstarter (tilbagevendende brugere) |
| `react-native-device-info` | Anbefalet | Enhedstype, OS-version, model, app-version (Technology-metrikker) |

Alle er erklæret som **valgfrie peer dependencies**: SDK'et registrerer ved runtime, hvad der er installeret, og degraderer elegant. Uden MMKV lever `user_id` kun i hukommelsen, og der genereres et nyt ved hver opstart; uden `react-native-device-info` udelades enhedskonteksten.

:::tip
På nyere React Native-versioner (React 19) kan `npm install` rapportere peer-konflikter for de valgfrie pakker. Installér dem med `--legacy-peer-deps`.
:::

## Kom hurtigt i gang

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
        // Udelad `analytics` for at forblive i dry-run-tilstand (events logges, intet sendes).
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

`config` tager samme objekt som [`init(config)`](/da/popup-web/reference/api/#initconfig) — Provideren udfylder de React Native-specifikke felter (`storage`, `device`, `platform`) for dig.

### Hvad Provideren tilslutter automatisk

| Område | Hvordan |
| --- | --- |
| Persistent identitet | MMKV-instans (`id: 'deepdots-sdk'`) når `react-native-mmkv` er installeret |
| Device info | `react-native-device-info` når den er installeret |
| Platform | `Platform.OS` → `'ios'` / `'android'` i analytics-konteksten |
| Engagement-tid | `AppState` → `onForeground()` / `onBackground()` (flusher ved baggrund) |
| Fejlopsamling | `global.ErrorUtils` → uhåndterede JS-fejl som `deepdots_app_crash` |
| Survey-rendering | `ReactNativePopupRenderer` + en `Modal` med en `WebView`, monteret efter behov |

To ting er **ikke** automatiske og kræver et par linjer fra dig: [navigations-tracking](#navigations-tracking) og [at starte triggerne](#visning-af-popups).

## Adgang til SDK'et

`useDeepdots()` returnerer den delte `DeepdotsPopups`-instans hvor som helst under Provideren. Hele analytics-API'et er tilgængeligt — se [Analytics-guiden](/da/popup-web/guides/analytics/).

```tsx
import { useDeepdots } from '@magicfeedback/popup-sdk/react-native';

function ProductScreen() {
  const dd = useDeepdots();

  return (
    <Button
      title="Læg i kurv"
      onPress={() => {
        dd.track('add_to_cart', { product_id: 'p-123', value: 49.9 });
        dd.triggerEvent('added_to_cart');
      }}
    />
  );
}
```

## Visning af popups

Provideren initialiserer SDK'et og henter popup-definitionerne, men den starter **ikke** triggerne — kald `autoLaunch()` én gang fra en komponent inde i Provideren:

```tsx
function DeepdotsBootstrap() {
  const dd = useDeepdots();

  useEffect(() => {
    dd.autoLaunch();
  }, [dd]);

  return null;
}
```

Alternativt kan du springe `autoLaunch()` over og vise popups imperativt med `dd.triggerEvent('some_event')` — matchende `event`-triggere udløses med det samme.

:::note[Hvilke triggere virker i React Native]
`time_on_page` og `event` virker som dokumenteret. `scroll`, `click` og `exit` afhænger af DOM'en (`window.scrollY`, `document.getElementById`, History API) og udløses aldrig i React Native — brug `event`-triggere sammen med `triggerEvent()` i stedet. Popup-segmenterne `path` springes også over (der findes ingen `location`), så en popup begrænset til en sti betragtes som matchende overalt. `lang`-segmenter **virker** — se nedenfor.
:::

### Sprogsegmenter

En popup begrænset til bestemte sprog (`segments.lang`) evalueres mod det sprog, SDK'et bestemte ved `init()`: dit eksplicitte `language`, ellers `navigator.language`, ellers `Intl`-lokalet. Netop den sidste fallback er det, der får det til at virke under Hermes, hvor `navigator.language` ikke findes. Der matches på præfiks, så et segment på `en` matcher `en-US`.

Vil du styre målretningen eksplicit i stedet for at stole på registreringen — anbefalet, når din app har sin egen i18n — så send sproget med i konfigurationen:

```tsx
<DeepdotsProvider config={{ apiKey: 'YOUR_PUBLIC_API_KEY', language: 'es-ES' }}>
```

:::caution
På **1.1.7 og tidligere** læste denne sti `navigator.language` direkte. I React Native findes `navigator`, men den har ingen `language`, så enhver popup med sprogsegmentering kastede en fejl under evalueringen af triggeren — hvilket afbrød evalueringen af **alle** popups for den event, ikke kun den ene. Rettet i 1.1.8; ser du triggere, der intet gør i RN, så tjek først din installerede version.
:::

Når en popup vises, monterer Provideren en fuldskærms-`Modal` med en `WebView` med surveyen. Survey-HTML'en er selvstændig, men indlæser `@magicfeedback/native` fra et CDN, så **rendering af en survey kræver netværksadgang**. Popup-status (`SHOWED` / `PARTIAL` / `COMPLETED`) rapporteres automatisk til `POST /sdk/popups`, og det persistente `user_id`, `session_id` og den aktive `mini_service` injiceres i surveyens identitets-metadata.

## Navigations-tracking

React Native har ingen History API, så skærmvisninger registreres ikke automatisk. Rapportér dem med `setScreen(name)` — SDK'et udsender et `deepdots_page_view`-event med varigheden af den **forrige** skærm, når du rapporterer den næste.

Med React Navigation:

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

Skærmnavne normaliseres på samme måde som web-stier: query strings fjernes, og numeriske/UUID-segmenter kollapser til `:id`, så `/product/123` og `/product/456` begge rapporteres som `/product/:id`.

## Avanceret: manuel opsætning uden Provideren

Har du brug for din egen overflade (et bottom sheet, en dedikeret skærm) eller dit eget React-træ, så brug `setupReactNative()` og `ReactNativePopupRenderer` direkte. Begge kommer fra **hoved**-entry pointet.

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

    // Sætter rendereren, injicerer storage/device/platform, kalder init()
    // og tilslutter AppState → onForeground/onBackground. Returnerer en oprydningsfunktion.
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
              originWhitelist={['*']}
              javaScriptEnabled
              source={{ html: survey.html }}
              onMessage={(e) => rendererRef.current?.handleMessage(e.nativeEvent.data)}
            />
          </View>
        </Modal>
      ) : null}
    </>
  );
}
```

Rendereren er en **bro**, ikke en stub: `onShow` giver dig `{ surveyId, productId, html }` klar til `<WebView source={{ html }}>`, og `handleMessage` oversætter WebView-beskeder til SDK-events — første interaktion → `popup_clicked` (`PARTIAL`), fuldførelse → `survey_completed` (`COMPLETED`) og lukker popuppen.

### `setupReactNative(sdk, config, deps)`

| Dep | Type | Standard når den udelades |
| --- | --- | --- |
| `mmkv` | MMKV-instans | `config.storage`, ellers in-memory |
| `deviceInfo` | `react-native-device-info`-modul | `config.device`, ellers udeladt |
| `appState` | `AppState` | Ingen livscyklus-tilslutning |
| `platform` | `'ios'` / `'android'` / `'web'` | `config.platform`, ellers `'web'` |
| `renderer` | `PopupRenderer` | SDK'ets standard-renderer |
| `errorUtils` | `global.ErrorUtils` | `globalThis.ErrorUtils` hvis den findes |

Alle deps er valgfrie. Lavniveau-hjælpere eksporteres også, hvis du selv vil bygge delene: `mmkvStorage(mmkv)` (en synkron `KeyValueStorage`-adapter), `collectRnDevice(deviceInfo)` og `buildSurveyHtml(options)`.

## Typiske faldgruber

:::caution
Montér `<DeepdotsProvider>` **én gang**, over din navigator. Monterer du den inde i en skærm, afmonteres modalen ved navigation, og igangværende surveys mistes.
:::

:::caution
Importér Provideren fra `@magicfeedback/popup-sdk/react-native`. Standard-entry pointet er browser-orienteret — det virker i RN (survey-rendereren indlæses lazy), men du ville selv skulle tilslutte storage, device info, livscyklus og WebView.
:::

:::caution
Uden `react-native-mmkv` bevares `user_id` ikke: hver opstart ser ud som en ny bruger, og cooldowns ("vis ikke igen i N dage") nulstilles med appen.
:::

:::caution
Native iOS/Android-crashes opsamles ikke — kun uhåndterede **JS**-fejl via `global.ErrorUtils`. Kører du Crashlytics eller Sentry, så videresend deres rapporter til `reportError()`.
:::

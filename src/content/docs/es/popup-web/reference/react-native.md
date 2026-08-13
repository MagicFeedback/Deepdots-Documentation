---
title: React Native
description: Cómo integrar el SDK de popups de Deepdots en una aplicación React Native usando el entry point dedicado /react-native.
---

El SDK incluye un **entry point dedicado para React Native** — `@magicfeedback/popup-sdk/react-native` — que hace toda la integración por ti: almacenamiento persistente, device info, plataforma, ciclo de vida de la app, captura de errores y renderizado de surveys en un `Modal` + `WebView`.

En la mayoría de apps la integración es un solo componente: envuelve tu app en `<DeepdotsProvider>`.

## Instalación

```bash
npm install @magicfeedback/popup-sdk react-native-webview
```

:::caution[Versión mínima]
El entry point `/react-native` existe a partir de **1.1.1** — en versiones anteriores el import falla, porque el paquete no expone ese subpath. Para React Native instala **1.1.8 o superior**: hasta la 1.1.7, un popup configurado con segmentación por idioma reventaba la evaluación completa del trigger en RN (ver [Segmentación por idioma](#segmentación-por-idioma)).

```bash
npm install @magicfeedback/popup-sdk@^1.1.8
```
:::

Dos paquetes opcionales desbloquean el resto de funcionalidades. Instala ambos salvo que tengas un motivo para no hacerlo:

```bash
npm install react-native-mmkv react-native-device-info
```

```bash
cd ios && pod install
```

| Paquete | Obligatorio | Qué aporta |
| --- | --- | --- |
| `react-native-webview` | ✅ | Renderiza la UI del survey |
| `react-native-mmkv` | Recomendado | Persiste el `user_id` entre reinicios de la app (usuarios recurrentes) |
| `react-native-device-info` | Recomendado | Tipo de dispositivo, versión de OS, modelo, versión de app (métricas de Technology) |

Todos están declarados como **peer dependencies opcionales**: el SDK detecta en runtime lo que hay instalado y degrada con elegancia. Sin MMKV el `user_id` solo vive en memoria y se genera uno nuevo en cada arranque; sin `react-native-device-info` se omite el contexto de dispositivo.

:::tip
En versiones recientes de React Native (React 19) `npm install` puede reportar conflictos de peers con los paquetes opcionales. Instálalos con `--legacy-peer-deps`.
:::

## Inicio rápido

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
        // Omite `analytics` para quedarte en modo dry-run (eventos por consola, sin envío).
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

`config` acepta el mismo objeto que [`init(config)`](/es/popup-web/reference/api/#initconfig) — el Provider rellena por ti los campos específicos de React Native (`storage`, `device`, `platform`).

### Qué cablea el Provider automáticamente

| Aspecto | Cómo |
| --- | --- |
| Identidad persistente | Instancia de MMKV (`id: 'deepdots-sdk'`) si `react-native-mmkv` está instalado |
| Device info | `react-native-device-info` si está instalado |
| Plataforma | `Platform.OS` → `'ios'` / `'android'` en el contexto de analytics |
| Tiempo de engagement | `AppState` → `onForeground()` / `onBackground()` (hace flush al pasar a background) |
| Captura de errores | `global.ErrorUtils` → errores JS no manejados como `deepdots_app_crash` |
| Render del survey | `ReactNativePopupRenderer` + un `Modal` con un `WebView`, montado on demand |

Dos cosas **no** son automáticas y necesitan unas líneas tuyas: el [tracking de navegación](#tracking-de-navegación) y [arrancar los triggers](#mostrar-popups).

## Acceder al SDK

`useDeepdots()` devuelve la instancia compartida de `DeepdotsPopups` desde cualquier punto bajo el Provider. Toda la API de analítica está disponible — ver la [guía de Analytics](/es/popup-web/guides/analytics/).

```tsx
import { useDeepdots } from '@magicfeedback/popup-sdk/react-native';

function ProductScreen() {
  const dd = useDeepdots();

  return (
    <Button
      title="Añadir al carrito"
      onPress={() => {
        dd.track('add_to_cart', { product_id: 'p-123', value: 49.9 });
        dd.triggerEvent('added_to_cart');
      }}
    />
  );
}
```

## Mostrar popups

El Provider inicializa el SDK y descarga las definiciones de popup, pero **no** arranca los triggers — llama a `autoLaunch()` una vez desde un componente dentro del Provider:

```tsx
function DeepdotsBootstrap() {
  const dd = useDeepdots();

  useEffect(() => {
    dd.autoLaunch();
  }, [dd]);

  return null;
}
```

Como alternativa, sáltate `autoLaunch()` y muestra los popups de forma imperativa con `dd.triggerEvent('some_event')` — los triggers de tipo `event` que coincidan se disparan inmediatamente.

:::note[Qué triggers funcionan en React Native]
`time_on_page` y `event` funcionan como está documentado. `scroll`, `click` y `exit` dependen del DOM (`window.scrollY`, `document.getElementById`, History API) y nunca se disparan en React Native — usa triggers de tipo `event` junto con `triggerEvent()`. Los segmentos `path` del popup también se ignoran (no existe `location`), así que un popup limitado a una ruta se considera coincidente en todas partes. Los segmentos `lang` **sí** funcionan — ver abajo.
:::

### Segmentación por idioma

Un popup restringido a ciertos idiomas (`segments.lang`) se evalúa contra el idioma que el SDK resolvió en `init()`: tu `language` explícito, si no `navigator.language`, si no el locale de `Intl`. Ese último fallback es lo que hace que funcione bajo Hermes, donde `navigator.language` no existe. La comparación es por prefijo, así que un segmento `en` coincide con `en-US`.

Si prefieres controlar la segmentación explícitamente en lugar de depender de la detección — recomendable cuando tu app tiene su propio i18n — pasa el idioma en la config:

```tsx
<DeepdotsProvider config={{ apiKey: 'YOUR_PUBLIC_API_KEY', language: 'es-ES' }}>
```

:::caution
En **1.1.7 y anteriores** este camino leía `navigator.language` directamente. En React Native `navigator` existe pero no tiene `language`, así que cualquier popup con segmentación por idioma lanzaba una excepción durante la evaluación del trigger — lo que abortaba la evaluación de **todos** los popups de ese evento, no solo el suyo. Corregido en 1.1.8; si ves triggers que no hacen nada en RN, comprueba primero la versión instalada.
:::

Cuando se muestra un popup, el Provider monta un `Modal` a pantalla completa con un `WebView` con el survey. El HTML del survey es autocontenido pero carga `@magicfeedback/native` desde un CDN, así que **renderizar un survey requiere conexión**. El estado del popup (`SHOWED` / `PARTIAL` / `COMPLETED`) se reporta a `POST /sdk/popups` automáticamente, y el `user_id` persistente, el `session_id` y el `mini_service` activo se inyectan en la metadata de identidad del survey.

## Tracking de navegación

React Native no tiene History API, así que las vistas de pantalla no se detectan solas. Repórtalas con `setScreen(name)` — el SDK emite un evento `deepdots_page_view` con la duración de la pantalla **anterior** cuando reportas la siguiente.

Con React Navigation:

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

Los nombres de pantalla se normalizan igual que las rutas web: se descarta el query string y los segmentos numéricos/UUID se colapsan a `:id`, así que `/product/123` y `/product/456` se reportan ambos como `/product/:id`.

## Avanzado: configuración manual sin el Provider

Si necesitas tu propia superficie (un bottom sheet, una pantalla dedicada) o tu propio árbol de React, usa `setupReactNative()` y el `ReactNativePopupRenderer` directamente. Ambos vienen del entry point **principal**.

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

    // Fija el renderer, inyecta storage/device/platform, llama a init()
    // y cablea AppState → onForeground/onBackground. Devuelve una función de limpieza.
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

El renderer es un **puente**, no un stub: `onShow` te entrega `{ surveyId, productId, html }` listo para `<WebView source={{ html }}>`, y `handleMessage` traduce los mensajes del WebView a eventos del SDK — primera interacción → `popup_clicked` (`PARTIAL`), completado → `survey_completed` (`COMPLETED`).

:::caution[`survey_completed` ya no cierra el popup (1.5.0)]
Hasta la 1.4.0 el renderer desmontaba el WebView en cuanto se completaba el survey. Eso ocultaba la pantalla de agradecimiento del propio survey, que acababa de pintarse. Desde la 1.5.0 `survey_completed` solo reporta el estado `COMPLETED`; `onHide` se dispara más tarde, cuando el usuario pulsa el botón de completar y el WebView envía `popup_close`.

Si tu app asumía que `survey_completed` era el final del flujo, mueve esa lógica a `onHide`. `survey_completed` sigue disparándose exactamente una vez por survey completado, así que continúa siendo el sitio correcto para reportar la finalización, pero no para desmontar la UI.
:::

:::caution[Fija `baseUrl` en el WebView]
Pasa siempre `source={{ html, baseUrl: 'https://sdk.deepdots.com/' }}`. Sin `baseUrl` el WebView corre en un origen opaco y el fetch interno del survey para cargar `@magicfeedback/native` queda bloqueado en WKWebView (iOS) — el survey nunca aparece. Da también un tamaño real al `WebView` (`style={{ flex: 1 }}`); según tu layout puede colapsar a altura cero.
:::

### Renderizar el survey sin la tarjeta del SDK (`renderChrome`)

Desde **1.4.0**, cuando montas tu propio contenedor decorado (un `Modal`, un bottom sheet o una pantalla con su propia tarjeta, fondo, bordes redondeados o backdrop), pasa `renderChrome: false` en la config:

```tsx
setupReactNative(
  sdk,
  { apiKey: 'YOUR_PUBLIC_API_KEY', renderChrome: false },
  { /* deps */ },
);
```

Desde **1.3.0** el HTML del survey pinta su propia tarjeta y backdrop (header con botón de cerrar, footer con los botones de navegación, tarjeta redondeada, fondo oscurecido). Si tu contenedor también está decorado, los dos se apilan en un **"doble modal"** — una tarjeta dentro de otra. `renderChrome: false` deja el HTML del WebView transparente y a pantalla completa para que llene tu contenedor, manteniendo el survey totalmente funcional (puente de mensajes, formulario, botones back/start/complete/send y el botón de cerrar). Tú controlas el marco exterior; el SDK controla el survey.

El flag solo afecta a React Native (el HTML del survey en el WebView). No afecta al popup DOM web, y el `<DeepdotsProvider>` por defecto lo ignora, porque su `Modal` ya es transparente y a pantalla completa (así que el camino integrado muestra una sola tarjeta). Úsalo en el camino manual de arriba.

### `setupReactNative(sdk, config, deps)`

| Dep | Tipo | Valor por defecto si se omite |
| --- | --- | --- |
| `mmkv` | Instancia de MMKV | `config.storage`, si no en memoria |
| `deviceInfo` | Módulo `react-native-device-info` | `config.device`, si no se omite |
| `appState` | `AppState` | Sin cableado de ciclo de vida |
| `platform` | `'ios'` / `'android'` / `'web'` | `config.platform`, si no `'web'` |
| `renderer` | `PopupRenderer` | El renderer por defecto del SDK |
| `errorUtils` | `global.ErrorUtils` | `globalThis.ErrorUtils` si existe |

Todas las deps son opcionales. También se exportan los helpers de más bajo nivel si prefieres montar las piezas a mano: `mmkvStorage(mmkv)` (adaptador síncrono de `KeyValueStorage`), `collectRnDevice(deviceInfo)` y `buildSurveyHtml(options)`.

## Errores frecuentes

:::caution
Monta `<DeepdotsProvider>` **una sola vez**, por encima de tu navegador. Montarlo dentro de una pantalla desmonta el modal al navegar y pierde los surveys en curso.
:::

:::caution
Importa el Provider desde `@magicfeedback/popup-sdk/react-native`. El entry point por defecto está orientado a navegador — funciona en RN (el renderer del survey se carga de forma diferida), pero tendrías que cablear a mano storage, device info, ciclo de vida y el WebView.
:::

:::caution
Sin `react-native-mmkv` el `user_id` no se persiste: cada arranque parece un usuario nuevo y los cooldowns ("no volver a mostrar durante N días") se reinician con la app.
:::

:::caution
Los crashes nativos de iOS/Android no se capturan — solo los errores **JS** no manejados vía `global.ErrorUtils`. Si usas Crashlytics o Sentry, reenvía sus reportes a `reportError()`.
:::

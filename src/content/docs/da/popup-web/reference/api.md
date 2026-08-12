---
title: API
description: Offentlige metoder du vil bruge fra din applikation.
---

Dette er de offentlige metoder på `DeepdotsPopups`-klassen. De dækker alt, hvad en host-applikation har brug for til at montere SDK'et, reagere på popups og udløse forretnings-events.

## `init(config)`

Initialiserer SDK'et og henter popup-definitionerne fra Deepdots.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'customer-123', // valgfrit
});
```

| Felt     | Påkrævet | Beskrivelse                                                  |
| -------- | -------- | ------------------------------------------------------------ |
| `apiKey` | ja       | Din offentlige Deepdots-API-nøgle.                           |
| `userId` | nej      | Identifikator sendt med hver popup-event.                    |
| `language` | nej    | BCP-47-sprogtag (f.eks. `es-ES`). Styrer både analytics-konteksten og popup-[sprogmålretningen](/da/popup-web/reference/popup-definition/#felter-der-påvirker-adfærd) (`segments.lang`). Registreres automatisk fra browseren (eller `Intl` på React Native), hvis den udelades. Se [Analytics → Sprogregistrering](/da/popup-web/guides/analytics/#sprogregistrering). |
| `contactAttributes` | nej | Interne brugerattributter der skal sendes til Contact (kræver `userId`). Se [`setContactAttributes`](#setcontactattributesattributes). |
| `debug`  | nej      | Slår SDK'ets debug-output til. Slået fra som standard.        |
| `logger` | nej      | Tilpasset destination for dette debug-output. Se [Tilpasset logger](#tilpasset-logger). |
| `renderChrome` | nej | **Kun React Native** (fra 1.4.0). Standard `true`. Sæt `false`, når du monterer din egen dekorerede container, så survey-WebView'en renderes uden SDK'ets eget kort og backdrop. Se [React Native → renderChrome](/da/popup-web/reference/react-native/#render-surveyen-uden-sdkets-kort-renderchrome). |
| `showProgressBar` | nej | Fra 1.5.0. Viser en `Question X of Y`-etiket og en fremdriftslinje i popup-headeren. Udelad den for at følge det, platformen har konfigureret for surveyen. Se [Fremdriftslinje](#fremdriftslinje). |
| `surveyCss` | nej | Fra 1.5.0. Din egen CSS, indsat som det sidste stylesheet, så den vinder i kaskaden. Måden at omstyle spørgsmålsområdet på pr. integration. Se [Tilpasset CSS](#tilpasset-css). |

### Fremdriftslinje

Popup-headeren kan vise, hvor langt surveyen er nået: en `Question 2 of 3`-etiket — tallet i fed, resten dæmpet — over en tynd fremdriftslinje.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  showProgressBar: true,
});
```

Flaget har tre tilstande:

| Værdi | Adfærd |
| --- | --- |
| `true` | Vises altid. |
| `false` | Vises aldrig. |
| udeladt | Følger den `showProgressBar`-indstilling, der er konfigureret for surveyen i platformen. |

Linjen vises kun, når der er mere end én side, efter startskærmen og før afslutningsskærmen. Den respekterer også surveyens egen `progressUnit` (`fraction` → `Question 2 of 3`, `percentage` → `66%`), `showProgressUnit` og `loadingBarColor`.

:::note
Dynamiske opfølgende spørgsmål er ikke en del af sidegrafen: de rykker linjen et halvt trin frem, men ændrer ikke totalen. Etiketten runder ned, så en opfølgning under spørgsmål 2 står stadig som `Question 2`, mens linjen rykker frem.
:::

Etikettens tekst findes indtil videre kun på engelsk. Hvis du har brug for den lokaliseret, slå enheden fra med `showProgressUnit` i platformen og render din egen header.

### Tilpasset CSS

Spørgsmålsområdet — formuleringer, svarmuligheder, vurderingsskalaer — renderes af Surveys-SDK'et med et stylesheet, som alle Deepdots-kunder deler. `surveyCss` lader dig omstyle det for din integration alene: strengen indsættes som det **sidste** stylesheet i popuppen, så den vinder i kaskaden, uden at nogen skal ændre de fælles standardværdier.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  surveyCss: `
    .magicfeedback-label { font-size: 15px; font-weight: 600; color: #1a1a1a; }
    .magicfeedback-sublabel { font-size: 13px; color: #6b7280; }
  `,
});
```

Den gælder både web-DOM-popuppen og survey-WebView'en i React Native.

Klassenavnene kommer fra `@magicfeedback/native`, og de er ikke altid de oplagte. Dem du oftest får brug for:

| Element | Selektor |
| --- | --- |
| Spørgsmålets formulering | `label.magicfeedback-label` |
| Sekundær linje under spørgsmålet | `label.magicfeedback-sublabel` |
| Radio-/checkbox-række | `.magicfeedback-radio-container`, `.magicfeedback-checkbox-container` |
| Numerisk vurderingsskala | `.magicfeedback-rating-number-container`, `.magicfeedback-rating-number-option` |
| Fritekstfelt | `.magicfeedback-input` |

:::caution
Rammen om en svarmulighed er en `box-shadow`, ikke en `border`. Fjerner du kun kanten, bliver kortet stående — nulstil `box-shadow`, `background` og `border-radius` samlet.

```css
.magicfeedback-radio-container {
  box-shadow: none !important;
  background: transparent !important;
  border-radius: 0 !important;
}
```
:::

:::note
Inspicér den levende DOM, før du skriver regler: åbn popuppen i en browser (eller WebView-inspektøren på React Native) og læs de faktiske klassenavne. At gætte dem er den hyppigste årsag til, at en regel tilsyneladende ikke gør noget.
:::

Vil du i stedet ændre popuppens egen ramme — kort, header og footer — så brug popup-stilen fra platformen (`theme`, `position`, `font`) eller, på React Native, [`renderChrome: false`](/da/popup-web/reference/react-native/#render-surveyen-uden-sdkets-kort-renderchrome).

### Tilpasset logger

Som standard skriver SDK'et sit debug-output til `console`. Send en `logger` for at dirigere det et andet sted hen — en logfil, en fjern-logtjeneste, Firebase, din egen buffer — hvilket er nyttigt på React Native, hvor Metro-konsollen ikke er tilgængelig i produktionsbuilds.

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

Kun `log` er påkrævet — `warn`, `error` og `info` falder tilbage til `log`, når de udelades. `console` opfylder selv formen, så `logger: console` er gyldig og er standardværdien.

```ts
interface DeepdotsLogger {
  log: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
}
```

:::note
`logger` ændrer kun **hvor** outputtet havner, ikke hvor meget der er: SDK'ets debug-beskeder kræver stadig `debug: true`. Fejl, som SDK'et rapporterer uanset `debug` (en event-listener der kaster, en advarsel fra rendereren), går også gennem loggeren, når den først er sat.
:::

## `autoLaunch()`

Starter de triggers, der er afledt af definitionerne indlæst under `init()`. Kald én gang efter `init()`.

```ts
popups.autoLaunch();
```

## `triggerEvent(eventName)`

Udløser en brugerdefineret forretnings-event. Enhver popup i Deepdots konfigureret med en event-trigger, der matcher `eventName`, vises (med forbehold for cooldowns og targeting).

```ts
popups.triggerEvent('checkout_completed');
```

Se [Triggers → event](/da/popup-web/guides/triggers/#event) for detaljer.

## `on(event, listener)` / `off(event, listener)`

Abonnér på SDK-events: `popup_shown`, `popup_clicked`, `survey_completed`.

```ts
const onShown = (event) => analytics.track('popup_shown', event);

popups.on('popup_shown', onShown);
popups.off('popup_shown', onShown);
```

Se [Events](/da/popup-web/guides/events/) for den fulde payload-form.

## `setContactAttributes(attributes)`

Sender interne brugerattributter, som kun din applikation kender — sprog, alder, plan, segment osv. — til brugerens **Contact** i Deepdots, så de kan bruges til targeting og segmentering af popups.

Kræver et `userId` i `init()`: attributterne knyttes til den identitet (det samme id fra dit eget system). Attributværdier skal være `string`, `number` eller `boolean`.

```ts
const sent = await popups.setContactAttributes({
  language: 'es',
  age: 34,
  plan: 'premium',
});
```

SDK'et sender kun, når attributterne er **ændret** siden sidste afsendelse — det gemmer en diff i vedvarende lagring — så du kan kalde dette ved hver brugeridentifikation uden at generere ekstra requests. Den returnerede promise resolver til:

- `true` — attributterne blev sendt til backenden.
- `false` — intet ændret siden sidste afsendelse (eller tracking er deaktiveret, eller der er intet `userId`).

Under motorhjelmen udfører det `POST /sdk/popups/contact` med body'en `{ publicKey, userId, userAttributes }`. Contacten oprettes automatisk ved den første popup-hentning, så ingen rækkefølge er påkrævet.

Du kan også angive de indledende attributter direkte i `init()` via `contactAttributes` (svarer til at kalde `setContactAttributes` lige efter init):

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'customer-123',
  contactAttributes: { language: 'es', plan: 'premium' },
});
```

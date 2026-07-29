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

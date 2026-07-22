---
title: Analytics
description: Automatisk adfærdsanalyse og sporing af brugerdefinerede events med Deepdots Popup SDK.
---

Deepdots Popup SDK indeholder et indbygget analyselag, der indsamler adfærdsdata fra dine brugere og videresender dem til en dedikeret integration i dit Deepdots-workspace. Det lader dig måle engagement, navigationsmønstre og forretningskritiske events uden at tilføje et separat analyseværktøj.

## Opsætning

Tilføj et `analytics`-objekt til `init()` med `publicKey` og `integration`-ID'et for den integration, der er oprettet i dit Deepdots-workspace. Uden det kører SDK'et i **dry-run-tilstand** — alle events logges til konsollen, men intet sendes.

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
Det er sikkert at udelade `analytics` under udvikling — dry-run-tilstand logger hver event-payload til konsollen præcis som den ville blive sendt, så du kan verificere dataene, før du går live.
:::

---

## Automatiske data

Følgende data indsamles med **nul ekstra kode**, så længe SDK'et er initialiseret:

| Data | Hvordan | Hvor det vises |
| --- | --- | --- |
| Skærmvisninger (`deepdots_page_view`) | History API (pushState / popstate / hashchange) | Events |
| Aktiv engagementstid (`deepdots_user_engagement`) | `visibilitychange`-listener | Events |
| Vedvarende brugeridentitet (`user_id`) | Genereres ved første besøg, gemmes i `localStorage` | Metadata |
| Enhedstype | Udledt fra User-Agent (mobile / tablet / desktop) | Kontekst |
| User agent | `navigator.userAgent` | Kontekst |
| Sprog (`deepdots_language`) | Registreres automatisk (se [Sprogregistrering](#sprogregistrering)) | Kontekst |
| App-version | `appVersion` sendt til `init()` | Kontekst |

Hvert flush (skjult faneblad, lukket side eller manuelt `flushAnalytics()`) sender de akkumulerede events som et batch. Backenden grupperer batches efter session, så du ser én tidslinje pr. brugerbesøg, ikke én post pr. flush.

:::note[React Native]
I React Native er History API ikke tilgængeligt. Brug [`setScreen(name)`](#react-native) til at rapportere navigation manuelt. Livscyklus-events bruger `onForeground()` / `onBackground()` i stedet for `visibilitychange`.
:::

### Sprogregistrering

Det sprog, der rapporteres i analytics-konteksten — sendt som `deepdots_language` i Feedback-metadataen — bestemmes **automatisk**, i denne rækkefølge:

1. Det `language`, der sendes til `init()` — et eksplicit [BCP-47](https://www.rfc-editor.org/info/bcp47)-tag som `'es-ES'`. Sæt dette, når din app har sin egen i18n, og du vil tvinge det rapporterede sprog.
2. `navigator.language` — browserens sprog (web).
3. `Intl`-lokaliteten (`Intl.DateTimeFormat().resolvedOptions().locale`) — fallbacken der bruges, når `navigator.language` ikke er tilgængelig. Det er det, der får registreringen til at virke på **React Native med Hermes**, hvor `navigator.language` ikke findes.
4. Hvis ingen af disse giver et resultat, udelades feltet.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  analytics: { publicKey: 'YOUR_ANALYTICS_PUBLIC_KEY', integration: 'YOUR_INTEGRATION_ID' },
  language: 'es-ES', // valgfrit — tvinger analytics-sproget; registreres automatisk, hvis udeladt
});
```

:::note
Dette er sproget for metadataen fra **analytics-integrationen**, ikke surveyets identitets-metadata. I modsætning til navigation og livscyklus kræver sprogregistrering ingen host-integration i React Native — `Intl`-fallbacken klarer det. `country` / `city` bestemmes separat via geo-IP.
:::

---

## Brugerdefinerede events

Brug `track(name, params?)` til at registrere enhver forretnings-event. Event-navne er frie strenge — brug snake_case med små bogstaver for at være konsistent med de automatiske events.

```ts
popups.track('add_to_cart', { product_id: 'p-123', value: 49.9, currency: 'EUR' });
popups.track('checkout_started');
popups.track('plan_upgraded', { plan: 'pro', billing: 'annual' });
```

### Søgning

`trackSearch` registrerer en søgeforespørgsel sammen med antallet af resultater. SDK'et tilføjer automatisk `has_results: boolean` ud fra antallet.

```ts
popups.trackSearch('løbesko', 0);      // ingen resultater — has_results: false
popups.trackSearch('t-shirt', 142);    // has_results: true
```

### Findbarhedsfriktion

Registrer de øjeblikke, hvor brugere har svært ved at finde det, de har brug for:

```ts
popups.trackFindabilityFriction('checkout_address');
popups.trackFindabilityFriction('plan_comparison');
```

### Funnel-trin

Spor trin inde i en navngiven funnel. Grupper relaterede trin under samme `funnel` og `taskId`, så backenden kan beregne konverteringsrater:

```ts
popups.trackFunnelStep('onboarding', 'account_created', 'task-42');
popups.trackFunnelStep('onboarding', 'profile_completed', 'task-42');
popups.trackFunnelStep('onboarding', 'first_popup_seen', 'task-42');
```

---

## Sporing af mini-services

En mini-service er ethvert afgrænset workflow i din app (checkout-flow, onboarding-guide, support-chat). SDK'et sporer indgang, udgang og varighed automatisk, når du signalerer grænserne:

```ts
// Brugeren går ind i checkout-flowet
popups.enterMiniService('checkout', 'home_banner');

// … brugeren fuldfører eller forlader flowet …

// Brugeren forlader det — send samme navn; varigheden beregnes automatisk
popups.exitMiniService('checkout');
```

Flere mini-services kan være aktive på én gang (f.eks. en support-chat åbnet under checkout). Luk altid hver enkelt ved **navn**, så det rette workflow får sin `deepdots_mini_service_exit` og varighed:

```ts
popups.enterMiniService('checkout', 'home_banner');
popups.enterMiniService('support_chat', 'fab');   // begge aktive nu
popups.exitMiniService('checkout');               // lukker checkout; support_chat forbliver åben
```

Ethvert survey, der vises, mens en mini-service er aktiv, får automatisk et `mini_service`-metadata-tag (den senest indtastede), hvilket lader dig filtrere CSAT-resultater efter workflow-kontekst i Deepdots.

---

## Brugerattributter

Kald `setUserAttributes` for at knytte forretningsattributter til brugerens analytics-kontekst. Disse inkluderes i hvert efterfølgende flush.

```ts
popups.setUserAttributes({
  plan: 'pro',
  registration_status: 'registered',
  sector: 'retail',
});
```

Attributter er kumulative — hvert kald flettes med tidligere angivne.

### Kontaktpost

`setContactAttributes` sender attributterne til `POST /sdk/popups/contact` og opretter eller opdaterer brugerens kontaktpost i Deepdots. Dette endpoint kaldes kun, når et `userId` blev angivet i `init()`, og tracking er aktiveret.

```ts
const sent = await popups.setContactAttributes({ language: 'en', age: 34, plan: 'premium' });
// sent: true hvis et POST blev udført, false hvis attributterne ikke er ændret (deduplikering)
```

Du kan også sende `contactAttributes` direkte i `init()` for at udløse kontaktopdateringen ved opstart:

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  userId: 'user-123',
  contactAttributes: { plan: 'premium', language: 'en' },
});
```

---

## Metrikker

Kald `setMetric(key, value)` for at registrere en **målbar værdi** — en mængde, du vil rapportere sammen med brugerens analytics-kontekst, såsom kurvværdi eller antal varer i kurven.

```ts
popups.setMetric('cart_value', 49.99);
popups.setMetric('items_in_cart', 3);
```

Signaturen er:

```ts
setMetric(key: string, value: string | number | boolean): void
```

Metrikker lander i et **dedikeret `metrics`-felt** i analytics-payloaden (`POST /sdk/feedback`), adskilt fra `metadata` og fra [brugerattributter](#brugerattributter).

### Adfærd

- **Vedvarende** — når den er sat, gensendes værdien ved hvert flush, indtil den ændres.
- **Overskriver pr. key** — at kalde `setMetric` igen med samme key erstatter den tidligere værdi.
- **Konverteres til string** — værdien gemmes som string på wiren (`49.99` → `"49.99"`).
- **Tomme keys ignoreres** — et kald med tom `key` er en no-op.
- **Respekterer kill-switchen** — det er en no-op, mens tracking er deaktiveret (se [Privatliv og samtykke](#privatliv-og-samtykke)).

### Metrikker vs. brugerattributter

Begge knytter kontekst til brugeren, men de besvarer forskellige spørgsmål:

| | [`setUserAttributes`](#brugerattributter) | `setMetric` |
| --- | --- | --- |
| Repræsenterer | Dimensioner at **opdele** efter | Målbare **værdier** at rapportere |
| Eksempel | `plan: 'pro'`, `sector: 'retail'` | `cart_value: 49.99`, `items_in_cart: 3` |
| Payload-felt | `metadata` | `metrics` |

Brug attributter til *hvem* — kategorierne du filtrerer og grupperer efter — og metrikker til *hvor meget* — mængderne du måler.

---

## Messaging

Spor livscyklussen for din apps notifikationer (push og in-app), så Deepdots kan måle levering, click-through og konvertering pr. besked. Brug en enkelt metode, `trackMessage(stage, options)`, ved hvert trin i besked-funnelen:

```ts
// Notifikationen blev leveret (push modtaget, eller in-app-besked vist)
popups.trackMessage('delivered', { id: 'msg-42', title: 'Summer Sale', channel: 'push', campaign: 'summer_sale' });

// Brugeren trykkede / klikkede på den
popups.trackMessage('clicked', { id: 'msg-42', title: 'Summer Sale', channel: 'push' });

// Brugeren fuldførte den tilsigtede handling (f.eks. købte)
popups.trackMessage('converted', { id: 'msg-42', title: 'Summer Sale', channel: 'push', value: 49.9, currency: 'EUR' });
```

| Felt | Type | Beskrivelse |
| --- | --- | --- |
| `stage` (1. arg) | `'delivered'` / `'clicked'` / `'converted'` | Trin i besked-funnelen |
| `id` | string | Korrelerer trinnene for den samme besked |
| `title` | string | Grupperingsdimension for Messaging-metrikker |
| `channel` | `'push'` / `'in_app'` | Leveringskanal |
| `campaign` | string? | Kampagnenavn (valgfrit) |
| `value` / `currency` | number / string | Konverteringsværdi (typisk ved `converted`) |
| `params` | object? | Ekstra nøgle/værdi-par |

Hvert kald udsender én `deepdots_message`-event; backenden grupperer efter `title` (og opdeler efter registreringsstatus / kanal) for at beregne leveringsantal, CTR, unikke click-through-brugere, konverteringsrate og handlingsbrugere.

:::note
Messaging er host-instrumenteret — SDK'et kan ikke observere dit notifikationssystem automatisk, så du kalder `trackMessage` fra dine egne push/in-app-handlers. For **push** er det sande "delivered"-signal normalt mest pålideligt fra din push-udbyder/backend; appen ser pålideligt klikket/konverteringen.
:::

---

## Crash- og fejlrapportering

SDK'et opfanger applikationsfejl og viser dem som `deepdots_app_crash`-events, hvilket driver Stability-metrikkerne (crash-frie brugere, crashes pr. release og enhed). En `deepdots_session_start`-event udsendes ved hvert `init()`, så backenden kan beregne crash-frie rater.

### Automatisk opfangning

Uhåndterede fejl opfanges automatisk — på web via `window.onerror` / `unhandledrejection`, og i React Native via `global.ErrorUtils` (koblet af `setupReactNative`). Opfangede crashes gemmes lokalt og afspilles ved næste opstart, fordi processen kan dø før næste flush — så det crash, der afsluttede en session, når stadig frem til Deepdots.

### Manuel fejlrapportering

Brug `reportError` til håndterede fejl, med en valgfri alvorlighedsgrad og fri kontekst:

```ts
try {
  await checkout();
} catch (e) {
  popups.reportError(e, { severity: 'error', context: { screen: 'Checkout', order_id: 'o-42' } });
}
```

| Mulighed | Værdier | Standard |
| --- | --- | --- |
| `severity` | `'fatal'` / `'error'` / `'warning'` | `'error'` |
| `handled` | `boolean` | `true` |
| `context` | fri nøgle/værdi-map (præfikset `ctx_` i payloaden) | — |

Crash-konteksten (app-version, OS, enhed) opfanges i det øjeblik, crashet sker, så et crash på en ældre release rapporterer stadig den version, det skete på.

:::caution
Dækningen gælder **håndterede JS-fejl**: uhåndterede fejl på web (`window.onerror` / `unhandledrejection`) og på React Native (`global.ErrorUtils`), plus alt hvad du sender via `reportError`. **Native** crashes under React Native (iOS / Android) opfanges **ikke** — hvis du allerede kører en native crash-reporter (Crashlytics, Sentry), så videresend dens rapporter til `reportError`.
:::

Crash-rapportering respekterer den samme samtykke-kill-switch som resten af analytics (`trackingEnabled` / `setTrackingEnabled`).

---

## Privatliv og samtykke

Sæt `trackingEnabled: false` i `init()` for at starte med al analytics- og kontakt-tracking deaktiveret — nyttigt, når du har brug for eksplicit brugersamtykke, før du indsamler data.

```ts
popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
  trackingEnabled: false,
});

// Senere, når brugeren giver samtykke:
popups.setTrackingEnabled(true);
```

`setTrackingEnabled(false)` suspenderer alle udgående kald (analytics, kontakt). `setTrackingEnabled(true)` genoptager dem og tildeler et vedvarende `user_id`, hvis et ikke allerede var gemt.

---

## React Native

I React Native kræver to automatiske adfærd eksplicit host-integration:

### Navigationssporing

Fordi History API er utilgængeligt, skal du rapportere skærmændringer manuelt efter hver navigations-event:

```ts
// I React Navigations onStateChange-callback:
popups.setScreen(route.name);
```

### Livscyklus (engagementstid)

Forbind SDK'et til appens forgrunds-/baggrunds-livscyklus, så engagementstiden måles korrekt, og events flushes, når appen går i baggrunden:

```ts
import { AppState } from 'react-native';

AppState.addEventListener('change', (state) => {
  if (state === 'active') popups.onForeground();
  else popups.onBackground(); // flusher også ventende analytics
});
```

:::tip
Hvis du bruger `setupReactNative()`, håndteres både `setScreen` (via React Navigation) og `AppState`-koblingen automatisk for dig. Se [React Native-referencen](/da/popup-web/reference/react-native/) for den komplette opsætning.
:::

---

## Forhåndsvisning af events før afsendelse

Under udvikling kan du inspicere den aktuelle event-buffer uden at flushe:

```ts
const preview = popups.previewAnalytics();
console.log(preview.events);   // alle events i kø siden sidste flush
```

For at fremtvinge et flush manuelt (nyttigt til test):

```ts
popups.flushAnalytics();
```

---
title: Popup Definition
description: Strukturen for en popup, som den leveres af Deepdots-API'en. Informativ — du bygger den ikke selv.
---

Denne side dokumenterer strukturen for en popup, **som den leveres af Deepdots-API'en**. Du behøver ikke at bygge disse objekter i din applikationskode — Deepdots opbevarer dem, og SDK'et indlæser dem i runtime.

Den er offentliggjort her, så integratorer kan forstå, hvad der ankommer til SDK'et, og hvilke felter der styrer adfærden.

## Struktur

```ts
interface PopupDefinition {
  id: string;
  title: string;
  message: string;
  triggers: Array<{
    type: 'time_on_page' | 'scroll' | 'exit' | 'click' | 'event';
    value: number | string;
  }>;
  cooldown?: Array<{
    answered: 'SHOWED' | 'PARTIAL' | 'COMPLETED';
    cooldownDays: number;
  }>;
  actions?: {
    accept?:   { label: string; surveyId: string };
    start?:    { label: string };
    back?:     { label: string; cooldownDays?: number };
    complete?: { label: string; surveyId: string; autoCompleteParams: Record<string, unknown>; cooldownDays?: number };
    decline?:  { label: string; cooldownDays?: number };
  };
  surveyId: string;
  productId: string;
  style?: {
    theme: 'light' | 'dark';
    position: 'bottom' | 'bottom-right' | 'bottom-left' | 'top' | 'top-right' | 'top-left' | 'center';
    font?: {
      family: string;   // f.eks. 'Inter' — et familienavn, ikke en CSS-stack
      url?: string;     // valgfri woff2/woff/ttf/otf-fil at indlæse den fra
    };
  };
  segments?: {
    path?: string[];
    lang?: string[];
  };
}
```

## Felter der påvirker adfærd

- **`triggers`** — hvornår popup'en vises. Se [Triggers](/da/popup-web/guides/triggers/) for `value`-semantik pr. trigger-type.
- **`cooldown`** — hvor længe der skal ventes, før popup'en vises igen, afhængigt af brugerens fremskridt (`SHOWED`, `PARTIAL`, `COMPLETED`).
- **`segments.path`** — liste over ruter, hvor popup'en må vises.
- **`segments.lang`** — sprog, popup'en må vises på; matches som præfiks mod det sprog, der blev bestemt ved `init()` (`en` matcher `en-US`). Det sprog er det `language`, du sendte til `init()`, ellers `navigator.language`, ellers `Intl`-lokalet — så det virker også på React Native (1.1.8+). Kan intet sprog bestemmes, ignoreres segmentet, og popup'en vises.
- **`style.theme` / `style.position`** — visuel variant.
- **`style.font`** — tilpasset skrifttype til popup'en og surveyen inde i den. Se [Tilpasset skrifttype](#tilpasset-skrifttype).

## Tilpasset skrifttype

`style.font` tilsidesætter SDK'ets standardtypografi for én popup. Den anvendes på popup-containeren, dens overskrift, dens formularkontroller (knapper, inputfelter, selects) og den survey, der renderes indeni — også i React Native, hvor skrifttypen anvendes inde i surveyens WebView.

```json
{
  "style": {
    "theme": "light",
    "position": "center",
    "font": {
      "family": "Inter",
      "url": "https://cdn.example.com/fonts/Inter-Regular.woff2"
    }
  }
}
```

| Felt | Påkrævet | Beskrivelse |
| --- | --- | --- |
| `family` | ja | Ét enkelt familie**navn** (`Inter`, `Roboto`), ikke en CSS-stack. SDK'et tilføjer selv system-fallbacks. |
| `url` | nej | URL til en skriftfil, der skal indlæses. Udelad den, når skrifttypen allerede findes på enheden eller indlæses af din side. |

Sådan opfører den sig:

- **Kun `family`** — SDK'et anvender familien og lader platformen slå den op. Brug dette til systemskrifttyper eller skrifttyper, din app allerede indlæser; kan enheden ikke slå den op, bruges system-fallbacken.
- **`family` + `url`** — SDK'et indsætter én enkelt `@font-face` (dedupliceret på tværs af renders) med `font-display: swap` og udleder `format()` fra filendelsen (`.woff2`, `.woff`, `.ttf`, `.otf`).
- **Saneret** — `family` reduceres til bogstaver, tal, mellemrum, `.`, `_` og `-`; en `url` accepteres kun, når den er `http(s):` eller `data:` og ikke indeholder citationstegn, vinkelparenteser, backslashes, whitespace eller kontroltegn. Værdier, der ikke godkendes, ignoreres i stedet for at blive indsat.
- **Udeladt** — popup'en beholder SDK'ets standardtypografi. Intet indsættes.

:::note
Ikke-understøttede skriftformater (for eksempel `.eot`) indlæses uden et eksplicit `format()`-hint, så browseren kan afvise dem. Foretræk `woff2`.
:::

## Hvor konfigureres dette

Popup-definitioner oprettes og redigeres i **Deepdots**, ikke i din kode. Felterne ovenfor er listet, så dit team kan forstå præcis, hvilke knapper der er tilgængelige, når en popup konfigureres.

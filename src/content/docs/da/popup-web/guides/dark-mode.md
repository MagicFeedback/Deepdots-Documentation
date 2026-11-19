---
title: Lys og mørk tilstand
description: Mørke survey-farver virker af sig selv, og dit site kan vælge lys, mørk eller systemets tilstand.
---

Popup'en og surveyen i den henter deres farver fra surveyens **Style** i Deepdots. Mørk tilstand virker på to måder.

## 1. En mørk Style virker af sig selv

Hvis Style-farverne er mørke (fx en mørk *Survey box background color*), skifter popup'en selv til lys tekst: titel, luk-knap, fremskridt, spørgsmål, svar og knapper. Ingen kodeændring, kun `@magicfeedback/popup-sdk` **1.22.0** eller nyere.

## 2. Følg dit sites lyse eller mørke tilstand

Hvis dit site har lys og mørk tilstand, så angiv de mørke farver i Deepdots (**Survey styling › Dark (optional)**) og fortæl SDK'et, hvilken tilstand der skal bruges:

```ts
const popups = new DeepdotsPopups();
popups.init({
  apiKey: '<your-api-key>',
  appearance: 'system', // 'light' | 'dark' | 'system'
});

// Dit site har sin egen knap:
popups.setAppearance('dark');
```

| `appearance` | Resultat |
|---|---|
| ikke angivet | Som i dag: Style-farverne bestemmer. |
| `'light'` | Lys popup. Style'ens mørke farver ignoreres. |
| `'dark'` | Mørk popup med Style'ens mørke farver. Uden dem bruges Style-farven, hvis den allerede er mørk, ellers en standard mørk palet. |
| `'system'` | Følger enheden (`prefers-color-scheme`). |

- `setAppearance()` gælder for den næste popup, der åbnes. `getAppearance()` returnerer den aktuelle værdi.
- Med `'system'` følger popup-rammen et skift, mens den er åben; surveyen beholder den tilstand, den åbnede med.
- På et mørkt kort får en lys brand-knap mørk tekst, så den kan læses.
- React Native: samme muligheder, via `init()` eller `setupReactNative()`.

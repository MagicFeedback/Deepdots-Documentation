---
title: Lys og mørk tilstand
description: Mørke Styles og survey-links, der følger den besøgendes enhed.
---

Surveys henter deres farver fra **Style** (Admin › survey › Settings › **Survey styling**).

## Mørke Styles

Når Style-farverne er mørke (boksens baggrund, eller sidens baggrund uden boksfarve), skifter surveyen selv til lys tekst: spørgsmål, svar, felter, knapper og slutskærm. En lys brand-knap på et mørkt kort får mørk tekst.

## Valgfrie mørke farver

Under **Survey styling** har farvefelterne to faner, **Light** og **Dark (optional)**. Udfyld Dark-fanen, når surveyen vises i begge tilstande:

- Et tomt mørkt felt bruger den lyse farve.
- En lys farve i et mørkt felt ignoreres (en standard mørk bruges), og Admin advarer om det.

Hvem vælger tilstanden:

| Hvor | Tilstand |
|---|---|
| Survey-link | Den besøgendes enhed (`prefers-color-scheme`). Tilføj `?mode=dark` eller `?mode=light` til linket for at tvinge en. |
| Web-popup | Muligheden `appearance` i [popup-SDK'et](/da/popup-web/guides/dark-mode/). |
| App-popup | Muligheden `appearance` i [native SDK'et](/da/popup-native/guides/dark-mode/) eller [Flutter-pluginet](/da/popup-flutter/guides/dark-mode/). |

Uden mørke farver tvinges intet: Style bestemmer, som før.

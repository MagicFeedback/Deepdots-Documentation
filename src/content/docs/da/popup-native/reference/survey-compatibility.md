---
title: Kompatibilitet med undersøgelsesversioner
description: Hvilket survey-SDK hvert popup-SDK tegner undersøgelser med, og hvilke undersøgelsesversioner tildelt i Admin det følger.
sidebar:
  hidden: true
pagefind: false
head:
  - tag: meta
    attrs:
      name: robots
      content: noindex
---

Hver undersøgelse har en **undersøgelsesversion** i Admin (*Survey frontend version*: **latest** eller en fastlåst version). Hver undersøgelsesversion er en release af survey-appen bygget med én version af `@magicfeedback/native`, det **survey-SDK**, der tegner spørgsmålene.

Fra **popup-SDK web 1.19.0 og native 0.7.11** tegner en popup sin undersøgelse med survey-SDK'et fra den undersøgelsesversion, der er tildelt i Admin, ligesom undersøgelsessiden gør, så længe popup-SDK'et understøtter det survey-SDK. Ældre popup-SDK'er bruger altid det survey-SDK, de leveres med.

:::note
Native 0.7.10 blev tagget, men aldrig udgivet. Opdater native-apps fra 0.7.9 direkte til 0.7.11.
:::

## Popup-SDK'er

| Popup-SDK | Medfølgende survey-SDK | Understøttede survey-SDK'er | Undersøgelsesversioner, det følger |
|---|---|---|---|
| Web 1.19.0 og nyere (`@magicfeedback/popup-sdk`) | 2.2.39 | 2.2.38, 2.2.39 | 3.4.1, 3.6.0 |
| Native 0.7.11 og nyere (Android, iOS) | 2.2.39 | 2.2.38, 2.2.39 | 3.4.1, 3.6.0 |
| Web 1.18.0 og ældre | 2.2.37 (1.18.0) | Fast | Ingen: altid det medfølgende survey-SDK |
| Native 0.7.9 og ældre | 2.2.31 (0.7.9) | Fast | Ingen: altid det medfølgende survey-SDK |

## Undersøgelsesversioner

| Undersøgelsesversion | Survey-SDK | Følges af popups (web 1.19.0+, native 0.7.11+) | Produktion |
|---|---|---|---|
| 3.6.0 | 2.2.39 | Ja | Kandidat (kan fastlåses) |
| 3.4.1 | 2.2.39 | Ja | Kandidat (kan fastlåses) |
| 3.2.1 | 2.2.36 | Nej: medfølgende survey-SDK | Kandidat |
| 3.2.0 | 2.2.36 | Nej: medfølgende survey-SDK | Stabil (latest) |
| 3.1.0 | 2.2.35 | Nej: medfølgende survey-SDK | Stabil |
| 3.0.0 og ældre | Ikke registreret | Nej: medfølgende survey-SDK | Stabil eller udfaset |

Produktion ifølge versionsregistret den 9. november 2026. Den aktuelle liste med status for hver undersøgelsesversion i produktion findes på `GET https://api.deepdots.com/sdk/survey-versions` (offentlig, skrivebeskyttet).

## Hvornår popuppen bruger sit medfølgende survey-SDK

Popuppen falder tilbage til det survey-SDK, den leveres med, når:

- undersøgelsesversionen tildelt i Admin bruger et survey-SDK, som popup-SDK'et ikke understøtter (se tabellen);
- API'et ikke sender undersøgelsesversionen med popuppen (ældre API);
- det tildelte survey-SDK ikke kan hentes (intet netværk eller en Content-Security-Policy, der blokerer `cdn.jsdelivr.net` og `unpkg.com`).

Undersøgelsen virker stadig: den ser ud og opfører sig som det medfølgende survey-SDK. JavaScript og styles fra et survey-SDK skifter altid sammen.

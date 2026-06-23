---
title: Sådan indlæses popups
description: Popups styres altid i Deepdots og hentes fra API'et i runtime.
---

Popups **styres altid i Deepdots og hentes fra API'et i runtime**. Der er ingen klient-side mode: din kode definerer aldrig popups manuelt.

## Sådan virker det

- Popup-definitioner, tekst, triggers, targeting og cooldowns lever i **Deepdots**.
- SDK'et henter dem i runtime ved hjælp af din `apiKey` (`GET /sdk/{apiKey}/popups`).
- Din kode monterer kun SDK'et og reagerer på dets events.

## Minimal konfiguration

```ts
import { DeepdotsPopups } from '@magicfeedback/popup-sdk';

const popups = new DeepdotsPopups();

popups.init({
  apiKey: 'YOUR_PUBLIC_API_KEY',
});

popups.autoLaunch();
```

## Valgfri felter

| Felt     | Type     | Standard | Hvad det gør                                                |
| -------- | -------- | -------- | ----------------------------------------------------------- |
| `userId` | `string` | ingen    | Sendes med hver popup-event til bruger-identifikation.      |

## Hvorfor ingen klient-side definitioner?

At definere popups i din kode ville dele ejerskabet af oplevelsen mellem din kodebase og Deepdots. At bevare én sandhedskilde i Deepdots lader produkt-, marketing- og CS-teams ændre tekst, targeting og triggers uden et kode-deploy fra din side.

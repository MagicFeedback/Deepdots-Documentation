---
title: Events
description: Events udsendt af SDK'et og payloaden som hosten modtager.
---

## Events

- `popup_shown`
- `popup_clicked`
- `survey_completed`

## Basistype

```ts
interface DeepdotsEvent {
  type: 'popup_shown' | 'popup_clicked' | 'survey_completed';
  surveyId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}
```

## Abonnement

```ts
const onShown = (event) => console.log(event);

popups.on('popup_shown', onShown);
popups.off('popup_shown', onShown);
```

## Hyppige felter i `data`

- `popupId`
- `action`
- `userId`

## Note om `popup_clicked`

`popup_clicked` betyder, at brugeren har gjort noget i popuppen. På web er `data.action` en af `start_survey`, `manual_send`, `back`, `complete`, `close_icon` eller `partial` (brugeren besvarede en side og gik videre; denne markerer også popuppen som `PARTIAL` i backend).

Indlæsning af surveyen, starten på en afsendelse og validerings- eller afsendelsesfejl er ikke interaktion og udsender det ikke. Tidligere versioner sendte også `loaded`, `before_submit`, `validation_error_required` og `submit_error`, og to `back`-events pr. tryk på Tilbage.

I React Native udsender broen det én gang pr. popup, med `action: 'partial'`, ved den første rigtige interaktion (afsendelse af et svar eller tilbage). Indlæsning af surveyen tæller ikke.

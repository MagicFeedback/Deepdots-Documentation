---
title: Events
description: Events emitted by the SDK and the payload received by the host.
---

## Events

- `popup_shown`
- `popup_clicked`
- `survey_completed`

## Base type

```ts
interface DeepdotsEvent {
  type: 'popup_shown' | 'popup_clicked' | 'survey_completed';
  surveyId: string;
  timestamp: number;
  data?: Record<string, unknown>;
}
```

## Subscription

```ts
const onShown = (event) => console.log(event);

popups.on('popup_shown', onShown);
popups.off('popup_shown', onShown);
```

## Common fields in `data`

- `popupId`
- `action`
- `userId`

## Note on `popup_clicked`

`popup_clicked` means the user did something in the popup. On the web, `data.action` is one of `start_survey`, `manual_send`, `back`, `complete`, `close_icon`, or `partial` (the user answered a page and moved on; this one also marks the popup as `PARTIAL` in the backend).

Loading the survey, the start of a submit, and validation or submit errors are not interactions and do not emit it. Earlier versions also sent `loaded`, `before_submit`, `validation_error_required` and `submit_error`, and two `back` events per tap on Back.

In React Native the bridge emits it once per popup, with `action: 'partial'`, on the first real interaction (sending an answer or going back). Loading the survey does not count.

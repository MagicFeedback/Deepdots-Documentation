---
title: API-reference
description: Komplet reference for alle offentlige klasser og metoder i Deepdots Python SDK.
---

## Deepdots

Hoved-indgangspunktet. Importer og instantier én gang; genbrug klienten på tværs af din applikation.

```python
from deepdots_sdk import Deepdots

client = Deepdots(
    user="dig@eksempel.com",
    password="din-adgangskode",
    base_url="https://api.magicfeedback.io",  # valgfri
)
```

### Konstruktørparametre

| Parameter | Type | Standard | Beskrivelse |
|---|---|---|---|
| `user` | string | — | Konto-e-mail |
| `password` | string | — | Kontoadgangskode |
| `base_url` | string | `"https://api.magicfeedback.io"` | API-rod-URL |

### Egenskaber

| Egenskab | Type | Beskrivelse |
|---|---|---|
| `feedbacks` | `FeedbackAPI` | Feedback-submission-operationer |
| `contacts` | `ContactsAPI` | CRM-kontaktoperationer |
| `campaigns` | `CampaignsAPI` | Kampagne- og sessionsoperationer |
| `products` | `ProductsAPI` | Produktlisting |
| `metrics` | `MetricsAPI` | Metrics-hentning |
| `integrations_questions` | `IntegrationsQuestionsAPI` | Spørgsmål for en integration |
| `reports` | `ReportsAPI` | Rapporterings-endpoints |

### Metoder

#### `set_logging(level)`

Konfigurer SDK'ens interne logger.

```python
import logging
client.set_logging(logging.DEBUG)
```

---

## FeedbackAPI

Adgang via `client.feedbacks`.

### `create(feedback)`

Kontrollerer at de påkrævede nøgler er til stede (og kaster `ValueError`, hvis en af dem mangler), pakker `value`-værdier der ikke er lister, ind i lister (se [Automatisk indpakning af svarværdier](/da/python-sdk/guides/feedback/#automatisk-indpakning-af-svarværdier)) og sender `feedback` som JSON-body i `POST /feedbacks` uden at ændre dine nøgler. Returnerer det oprettede feedback-objekt. Hvis `external_id` matcher et feedback der allerede findes for samme virksomhed, produkt og integration, og som ikke er slettet, returneres i stedet det eksisterende feedback uændret. Se [Administration af Feedback](/da/python-sdk/guides/feedback/).

### `get(filter=None)`

Returnerer en liste af feedback-objekter.

### `get_id(feedback_id, filter=None)`

Returnerer et enkelt feedback-objekt.

### `update(feedback_id, feedback)`

Sender `PATCH /feedbacks/{feedback_id}` kun med de felter du angiver. Returnerer et tomt dict (`{}`), fordi API'en svarer `204 No Content`. Medtag `"status": "REGISTERED"` for at få feedbacket analyseret igen (se [Kør analysen igen](/da/python-sdk/guides/feedback/#kør-analysen-igen)).

### `delete(feedback_id)`

Udfaser feedbacket (dets status bliver `DEPRECATED`, og det skjules i rapporter og i opslag der ikke filtrerer på `status`). Returnerer et tomt dict (`{}`).

### `upload_attachment(feedback_id, file_path, filename=None, extra_data=None)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `feedback_id` | string | ID på det feedback filen skal vedhæftes |
| `file_path` | string | Sti til filen på disk |
| `filename` | string \| None | Visningsnavn — standard er filnavnet |
| `extra_data` | dict \| None | JSON-serialiserbart dict gemt med vedhæftningen |

Uploader filen som en multipart-request. Returnerer det oprettede vedhæftningsobjekt.

---

## ContactsAPI

Adgang via `client.contacts`.

### `create(contact)`

Returnerer det oprettede kontaktobjekt. Se [Kontakter](/da/python-sdk/guides/contacts/).

### `get(filter=None)`

Returnerer en liste af kontaktobjekter.

### `update(contact_id, contact)`

Returnerer det opdaterede kontaktobjekt.

### `delete(contact_id)`

Returnerer det slettede kontaktobjekt.

---

## CampaignsAPI

Adgang via `client.campaigns`.

### `create(campaign)`

Returnerer det oprettede kampagneobjekt. Se [Kampagner](/da/python-sdk/guides/campaigns/).

### `get(filter=None)`

Returnerer en liste af kampagneobjekter.

### `create_session(campaign_id, session)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `campaign_id` | string | ID for kampagnen der tilføjes en session til |
| `session` | dict | Sessions-payload — skal indeholde `crmContactId` (string[]) |

Returnerer det oprettede sessionsobjekt.

### `get_sessions(campaign_id, filter=None)`

Returnerer en liste af sessionsobjekter.

### `get_sessions_feedbacks(campaign_id, filter=None)`

Returnerer en liste af feedback-objekter knyttet til denne kampagnes sessioner.

---

## ProductsAPI

Adgang via `client.products`.

### `get(filter=None)`

Returnerer en liste af produkter registreret under din konto.

---

## MetricsAPI

Adgang via `client.metrics`.

### `get(filter=None)`

Returnerer en liste af metrics-objekter.

---

## IntegrationsQuestionsAPI

Adgang via `client.integrations_questions`.

### `get(integration_id, filter=None)`

Returnerer listen af spørgsmål konfigureret for den angivne integration. Brug den til at slå gyldige svarnøgler op, før du opretter feedback: hvert spørgsmåls `ref` er den `key` du skal bruge i `answers`.

```python
questions = client.integrations_questions.get("DIT_INTEGRATION_ID")
for q in questions:
    print(q["ref"], q["type"], q["title"])
```

---

## ReportsAPI

Adgang via `client.reports`.

### `get(filter=None)`

Returnerer generelle rapportdata.

### `get_newsletter(filter=None)`

Returnerer newsletter-specifikke rapportdata.

### `update(report_id, report)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `report_id` | string | ID på rapporten der opdateres |
| `report` | dict | Felter der skal ændres |

Returnerer det opdaterede rapportobjekt.

### `regenerate(report_id, body=None)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `report_id` | string | ID på rapporten der skal regenereres |
| `body` | dict \| None | Valgfri publiceringskonfiguration |

Genudgiver rapporten ved at kalde `POST /reporting/report/{report_id}/publish`. Returnerer svaret fra publicerings-endpointet.

---

## Fejlhåndtering

Alle HTTP-fejl kaster `requests.exceptions.HTTPError`. Omslut kald i try/except når du har brug for at håndtere specifikke statuskoder:

```python
import requests

try:
    feedback = client.feedbacks.create({…})
except requests.exceptions.HTTPError as e:
    print(e.response.status_code, e.response.text)
```

Klient-side validering (manglende påkrævede felter) kaster `ValueError` inden requesten sendes.

Statuskoder du kan støde på:

| Status | Betydning |
|---|---|
| `400` | Requesten er forkert opbygget eller ikke tilladt — for eksempel en filterværdi der indeholder `&` eller `#` (se [Forespørgsler](/da/python-sdk/guides/querying/)), eller en kontakt i `crmContactId` der tilhører en anden virksomhed |
| `401` | Tokenet mangler, er ugyldigt eller er udløbet, eller din bruger er deaktiveret. Tokens udløber efter cirka en time: i langvarige jobs som en import skal du oprette en ny klient (eller, fra SDK 1.0.17, kalde `client.refresh_token()`) og prøve igen |
| `403` | Du har filtreret på en virksomhed som din bruger ikke har adgang til, for eksempel et forkert `companyId` i `where` |
| `404` | Noget som requesten henviser til, findes ikke eller er ikke synligt for dig — for eksempel en kontakt i `crmContactId`, en kampagne eller en rapport |
| `405` | Din brugers rolle tillader ikke denne operation (f.eks. opdatering af feedback) |
| `406` | Posten findes ikke, er blevet slettet eller tilhører en virksomhed du ikke har adgang til — for eksempel `feedbacks.get_id()`, `update()` eller `delete()` på sådan et feedback (de returnerer 406, ikke 404) |
| `422` | Request-body'en er ugyldig — et ukendt eller fejlstavet felt, en forkert type eller en værdi der ikke er blandt de tilladte |

Et `422`-svar oplister alle problemer i `details`; med SDK'en læser du listen fra undtagelsen som `e.response.json()["error"]["details"]`. Hvis du f.eks. sender `externalId` i stedet for `external_id`, returneres:

```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid. See error object `details` property for more info.",
    "code": "VALIDATION_FAILED",
    "details": [
      {
        "path": "",
        "code": "additionalProperties",
        "message": "must NOT have additional properties",
        "info": {"additionalProperty": "externalId"}
      }
    ]
  }
}
```

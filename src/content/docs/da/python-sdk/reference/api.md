---
title: API-reference
description: Komplet reference for alle offentlige klasser og metoder i MagicFeedback Python SDK.
---

## MagicFeedback

Hoved-indgangspunktet. Importer og instantier én gang; genbrug klienten på tværs af din applikation.

```python
from magicfeedback_sdk import MagicFeedback

client = MagicFeedback(
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

Returnerer det oprettede feedback-objekt. Se [Administration af Feedback](/da/python-sdk/guides/feedback/).

### `get(filter=None)`

Returnerer en liste af feedback-objekter.

### `get_id(feedback_id, filter=None)`

Returnerer et enkelt feedback-objekt.

### `update(feedback_id, feedback)`

Returnerer det opdaterede feedback-objekt.

### `delete(feedback_id)`

Returnerer det slettede feedback-objekt.

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

Returnerer listen af spørgsmål konfigureret for den angivne integration.

```python
questions = client.integrations_questions.get("0eb9d270-6dd7-11ef-9987-21e04f383573")
for q in questions:
    print(q["key"], q["type"])
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

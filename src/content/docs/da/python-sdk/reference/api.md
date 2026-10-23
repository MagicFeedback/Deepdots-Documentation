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
| `auth_source` | string | `"datastore"` | Hvor tokenet kommer fra. Send `"identity"` for at logge ind med `user` og `password`, hvilket er det du skal bruge uden for Deepdots' egen Google Cloud. Standarden leder først efter et token cachet i Deepdots' Google Cloud Datastore og logger ind med `user` og `password`, når der ikke er noget |

Konstruktøren logger ind med det samme. Et token holder cirka en time.

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
| `crm` | `CrmAPI` | CRM-objekter og connectors (SDK 1.0.23) |
| `companies` | `CompaniesAPI` | Virksomhedslisting |
| `requests` | `RequestsAPI` | Research-requests |
| `signals` | `SignalsAPI` | Signals |

### Metoder

#### `set_logging(level)`

Konfigurer SDK'ens interne logger.

```python
import logging
client.set_logging(logging.DEBUG)
```

#### `refresh_token()`

Henter et nyt token (med samme `auth_source`) og opdaterer alle sub-API'er på stedet. Kald den i en langvarig proces, når requests begynder at fejle med 401. `client.crm` gør det selv.

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

### `update_metadata_batch(items, mode=None)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `items` | list | `[{"feedbackId": str, "metadata": [{"key": str, "value": [str]}]}]` |
| `mode` | string \| None | `"append"` føjer værdier til dem en nøgle har; som standard erstattes de (SDK 1.0.22) |

Tilføjer eller overskriver de metadata-nøgler du sender, på mange feedbacks i én request, bevarer alle andre nøgler og sætter hvert feedback i kø til en ny analyse. Returnerer `{"feedbacks", "triggered", "failed"}`. Kaster `HTTPError` (404) og skriver intet, hvis et feedback ikke findes eller ikke er tilgængeligt. Se [Tilføj metadata til mange feedbacks på én gang](/da/python-sdk/guides/feedback/#tilføj-metadata-til-mange-feedbacks-på-én-gang). SDK 1.0.21.

### `delete(feedback_id)`

Udfaser feedbacket (dets status bliver `DEPRECATED`, og det skjules i rapporter og i opslag der ikke filtrerer på `status`). Returnerer et tomt dict (`{}`).

### `upload_attachment(feedback_id, file_path, filename=None, extra_data=None, max_attachments=3, check_duplicate_content=True)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `feedback_id` | string | ID på det feedback filen skal vedhæftes |
| `file_path` | string | Sti til filen på disk |
| `filename` | string \| None | Visningsnavn — standard er filnavnet |
| `extra_data` | dict \| None | JSON-serialiserbart dict gemt med vedhæftningen |
| `max_attachments` | int | Største antal vedhæftninger et feedback må have (SDK 1.0.20) |
| `check_duplicate_content` | bool | Afvis en fil med indhold der allerede er vedhæftet (SDK 1.0.20) |

Uploader filen som en multipart-request. Returnerer det oprettede vedhæftningsobjekt. Kaster `ValueError` uden at uploade, når feedbacket allerede har `max_attachments` filer, når det samme indhold allerede er vedhæftet, eller når dets vedhæftninger ikke kan læses.

---

## ContactsAPI

Adgang via `client.contacts`.

### `create(contact)`

Returnerer det oprettede kontaktobjekt. Se [Kontakter](/da/python-sdk/guides/contacts/).

### `get(filter=None)`

Returnerer en liste af kontaktobjekter.

### `update(contact_id, contact)`

Returnerer det opdaterede kontaktobjekt.

### `upsert(contact)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `contact` | dict | Kontakt-payload; `name`, `email` og `companyId` er påkrævede |

Opdaterer virksomhedens aktive kontakt med samme e-mail, eller opretter en. Ved en opdatering overskrives de felter du sender, og `customFields` flettes. Returnerer kontakten. Se [Opret eller opdater ud fra e-mail](/da/python-sdk/guides/contacts/#opret-eller-opdater-ud-fra-e-mail). SDK 1.0.22.

### `upsert_batch(items, chunk_size=500)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `items` | list | Kontakter, hver som i `upsert()` |
| `chunk_size` | int | Kontakter per request, 1 til 500 |

Upserter en liste af vilkårlig længde, 500 kontakter per request. Returnerer `{"contacts", "created", "updated", "failed"}`; hver `failed`-posts `index` peger ind i `items`. SDK 1.0.22.

### `update_fields(contact_id, custom_fields=None, **native_fields)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `contact_id` | string | Kontaktens ID |
| `custom_fields` | dict \| None | Brugerdefinerede felter der skal tilføjes eller ændres; `None` som værdi fjerner feltet |
| `**native_fields` | | Et hvilket som helst af `name`, `lastname`, `phone`, `address`, `city`, `state`, `postalCode` |

Tilføjer eller ændrer de brugerdefinerede felter du sender, og bevarer de øvrige. Returnerer `{"id", "customFields"}`. Se [Opdater brugerdefinerede felter](/da/python-sdk/guides/contacts/#opdater-brugerdefinerede-felter). SDK 1.0.22.

### `delete(contact_id)`

Returnerer det slettede kontaktobjekt.

---

## CrmAPI

Adgang via `client.crm`. SDK 1.0.23. Se [CRM-objekter](/da/python-sdk/guides/crm-objects/).

Alle metoder sender 500 poster per request, sender en request der fejler midlertidigt (502, 503, 504, en forbindelsesfejl eller en timeout efter 300 sekunder) igen op til 3 gange og logger ind igen én gang, når tokenet er udløbet. Fejler en request stadig, kastes en `requests.RequestException`. Skrivemetoder returnerer totaler over alle requests, og hver `failed`-posts `index` peger ind i den liste du sendte.

### `upsert_objects(object_type, items, company_id=None, chunk_size=500)`

| Parameter | Type | Beskrivelse |
|---|---|---|
| `object_type` | string | Små bogstaver, tal og `_`, f.eks. `"match"` |
| `items` | list | Objekter; hvert skal have et `externalId` (se [Gem objekter](/da/python-sdk/guides/crm-objects/#gem-objekter)) |
| `company_id` | string \| None | Påkrævet for admin-konti (API'en svarer 400 uden den). Andre brugere skriver som standard til deres egen virksomhed; de kan også angive en anden virksomhed de er tilknyttet, og alle andre virksomheder afvises med 403. Det samme gælder for de øvrige `CrmAPI`-metoder |
| `chunk_size` | int | Poster per request, 1 til 500 |

Returnerer `{"count", "created", "updated", "failed"}`; en `failed`-post er `{"index", "externalId", "error"}`.

### `get_objects(object_type, company_id=None, external_id=None, status=None, parent_type=None, parent_key=None, contact_key=None, limit=None, after=None)`

Returnerer en liste af objekter af én type, sorteret efter `externalId`. Filtrene matcher præcist. `limit` er som standard 100 (højst 1000); send det sidste `externalId` du modtog, som `after` for at få næste side.

### `sync_fck_users(users, company_id=None, chunk_size=500)`

Opretter eller opdaterer kontakter ud fra FCK-brugerobjekter, sendt som de er. Returnerer `{"count", "created", "updated", "failed"}`; en `failed`-post er `{"index", "id", "error"}`.

### `ingest_roboticket(lines, company_id=None, chunk_size=500)`

Gemmer Roboticket-linjer for billetter og medlemskaber, sendt som de er. Returnerer `{"count", "applied", "ignored", "failed"}`; en `failed`-post er `{"index", "id", "error"}`.

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

`client.crm`-metoderne sender selv midlertidige fejl igen (se [CrmAPI](#crmapi)). Fejler de stadig, kan de også kaste `requests.ConnectionError` eller `requests.Timeout`, så fang `requests.RequestException` omkring dem.

Statuskoder du kan støde på:

| Status | Betydning |
|---|---|
| `400` | Requesten er forkert opbygget eller ikke tilladt — for eksempel en filterværdi der indeholder `&` eller `#` (se [Forespørgsler](/da/python-sdk/guides/querying/)), eller en kontakt i `crmContactId` fra en anden virksomhed end feedbackets, når din bruger har adgang til begge virksomheder (en kontakt i en virksomhed du ikke har adgang til, giver `404`) |
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

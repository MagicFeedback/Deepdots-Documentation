---
title: Endpoints
description: Forespørgsel og svar for hvert feedback- og kontakt-endpoint i Deepdots REST API.
sidebar:
  order: 1
---

Alle endpoints modtager og returnerer JSON. Alle undtagen de to `/auth/token`-endpoints kræver `Authorization: Bearer <token>` (se [Godkendelse](/da/rest-api/getting-started/authentication/)).

| Metode | Sti | Hvad den gør |
|---|---|---|
| `POST` | `/auth/token` | Logger ind med en API-brugers e-mail og adgangskode |
| `POST` | `/auth/token/refresh` | Fornyer et login-token |
| `POST` | `/feedbacks` | Sender én feedback |
| `POST` | `/feedbacks/bulk` | Sender mange feedbacks for én virksomhed og ét produkt |
| `GET` | `/feedbacks/{id}` | Læser én feedback |
| `POST` | `/crm/contacts/upsert` | Opretter eller opdaterer én kontakt ud fra e-mail eller `externalId` |
| `POST` | `/crm/contacts/upsert/batch` | Opretter eller opdaterer op til 500 kontakter |
| `PATCH` | `/crm/contacts/{id}/fields` | Opdaterer en kontakts brugerdefinerede felter og oplysninger |
| `GET` | `/crm/contacts` | Finder kontakter |

---

## `POST /auth/token`

Logger ind med en API-brugers e-mail og adgangskode. Kræver ingen `Authorization`-header.

**Body**

| Felt | Type | Påkrævet | Noter |
|---|---|---|---|
| `email` | string | Ja | |
| `password` | string | Ja | |

**Svar `200`:**

| Felt | Type | Noter |
|---|---|---|
| `idToken` | string | Send det som `Authorization: Bearer <idToken>` |
| `refreshToken` | string | Til `POST /auth/token/refresh` |
| `expiresIn` | number | Sekunder, til `idToken` udløber (3600) |
| `tokenType` | string | Altid `Bearer` |

**Fejl:** `401` ved forkert e-mail eller adgangskode, `403`, når brugeren er deaktiveret, `429` efter for mange mislykkede forsøg, `422`, når et felt mangler.

---

## `POST /auth/token/refresh`

Får et nyt `idToken` uden at sende adgangskoden igen. Kræver ingen `Authorization`-header.

**Body**

| Felt | Type | Påkrævet | Noter |
|---|---|---|---|
| `refreshToken` | string | Ja | Fra login eller den forrige fornyelse |

**Svar `200`:** de samme felter som `POST /auth/token`, med et nyt `refreshToken` til næste gang.

**Fejl:** `401`, når refresh-tokenet er ugyldigt eller udløbet (log ind igen), `403`, når brugeren er deaktiveret.

---

## `POST /feedbacks`

Sender én feedback.

**Body**

| Felt | Type | Påkrævet | Noter |
|---|---|---|---|
| `integrationId` | string | Ja | Udfylder `companyId`, `productId`, `type` og `identity`, når du udelader dem |
| `external_id` | string | Anbefalet | Dit id. Et eksisterende `external_id` for samme integration returnerer den feedback i stedet for at oprette en ny |
| `name` | string | Nej | |
| `text` | string | Nej | Fritekst |
| `answers` | array af `{key, value: string[]}` | Nej | |
| `metrics` | array af `{key, value}` | Nej | |
| `metadata` | array af `{key, value}` | Nej | |
| `externalGeneratedAt` | ISO 8601-string | Nej | Standard er nu |
| `externalUpdatedAt` | ISO 8601-string | Nej | Standard er nu |
| `externalUrl` | string | Nej | |
| `crmContactId` | string | Nej | En aktiv kontakt i samme virksomhed |

**Svar `200`:** feedbacken, inklusive `id`, `status` (`REGISTERED`, når den er ny) og `createdAt`.

**Fejl:** `404`, når integrationen ikke kan læses, eller `crmContactId` ikke er en aktiv kontakt, du kan se, `400`, når integrationen, eller kontakten i `crmContactId`, hører til en anden virksomhed, `422`, når body'en ikke er gyldig.

---

## `POST /feedbacks/bulk`

Sender mange feedbacks for én virksomhed og ét produkt.

**Body**

| Felt | Type | Påkrævet | Noter |
|---|---|---|---|
| `company` | string | Ja | Dit `companyId` |
| `product` | string | Ja | Dit `productId` |
| `feedbacks` | array | Ja | Samme felter som `POST /feedbacks` plus `type` og `identity`, som er påkrævede her |

**Svar `200`:** listen over oprettede feedbacks. Feedbacks, hvis `external_id` allerede findes for samme integration, springes over og returneres ikke.

**Fejl:** `400`, når `company` eller `product` er tom eller ikke findes, en feedback angiver en anden virksomhed eller et andet produkt, eller et `crmContactId` hører til en anden virksomhed. `404`, når et `crmContactId` ikke er en aktiv kontakt, du kan se, og så gemmes ingen af forespørgslens feedbacks. `422`, når body'en ikke er gyldig, fx uden `company` eller `product`.

---

## `GET /feedbacks/{id}`

Læser én feedback ud fra dens Deepdots-`id`.

**Svar `200`:** feedbacken. `status` er `DONE`, når den er analyseret.

---

## `POST /crm/contacts/upsert`

Opretter eller opdaterer én kontakt i din virksomhed, fundet ud fra e-mail blandt aktive kontakter, ellers ud fra `externalId`.

**Body**

| Felt | Type | Påkrævet | Noter |
|---|---|---|---|
| `email` | string | Ja | Uden mellemrum og med små bogstaver. Slås op først, blandt aktive kontakter. En kontakt, der er fundet ud fra `externalId`, får denne e-mail |
| `name` | string | Ja | |
| `lastname` | string | Nej | |
| `externalId` | string | Nej | Dit id for kontakten. Slås op, når ingen aktiv kontakt har e-mailen |
| `phone`, `address`, `city`, `state`, `postalCode` | string | Nej | |
| `country` | string | Nej | ISO 3166-1 alpha-2, med små bogstaver (`dk`) |
| `customFields` | object | Nej | Værdier er strings, tal eller booleans. Flettes ved opdatering; `null` fjerner en nøgle |

**Svar `200`:** kontakten, inklusive `id` og `status`. En kontakt, der er fundet ud fra `externalId`, kan være `UNSUBSCRIBED`.

**Fejl:** `400` ved en ugyldig e-mail, `406`, når virksomheden ikke er din, `422`, når body'en ikke er gyldig (fx et manglende `name` eller et `country` med store bogstaver).

---

## `POST /crm/contacts/upsert/batch`

Opretter eller opdaterer op til 500 kontakter i én forespørgsel.

**Body**

```json
{ "items": [ { "email": "...", "name": "...", "customFields": { } } ] }
```

Hvert element har de samme felter som `POST /crm/contacts/upsert`.

**Svar `200`**

```json
{
  "contacts": 2,
  "created": 1,
  "updated": 0,
  "failed": [{ "index": 1, "email": "bad", "error": "Invalid email format." }]
}
```

**Fejl:** `400`, når `items` er tom eller har mere end 500 elementer, `422`, når et element ikke passer til felterne i `POST /crm/contacts/upsert`; så gemmes intet. Andre fejl på enkelte elementer, fx en ugyldig e-mail, returneres i `failed`, og resten gemmes.

---

## `PATCH /crm/contacts/{id}/fields`

Opdaterer en kontakts brugerdefinerede felter og kontaktoplysninger.

**Body**

| Felt | Type | Noter |
|---|---|---|
| `customFields` | object | Flettes: nøgler, du sender, sættes, `null` fjerner en nøgle, resten bevares |
| `name`, `lastname`, `phone`, `address`, `city`, `state`, `postalCode` | string | Overskrives, når de sendes |

Alle andre felter afvises med `400`. `email` og `externalId` kan ikke ændres her.

**Svar `200`**

```json
{ "id": "<contact-id>", "customFields": { "tier": "platinum" } }
```

**Fejl:** `406`, når kontakten ikke findes, ikke er din eller ikke er aktiv (afmeldt eller slettet).

---

## `GET /crm/contacts`

Finder kontakter med en `filter`-forespørgselsparameter (JSON):

| Nøgle | Eksempel |
|---|---|
| `where` | `{"where": {"externalId": "SF-0035g00000XyZ12"}}` |
| `limit` | `{"limit": 100}` |
| `skip` | `{"skip": 100}` |
| `order` | `{"order": ["createdAt DESC"]}` |

**Svar `200`:** en liste af din virksomheds kontakter. Kun de aktive returneres, medmindre dit `where` har en `status`-nøgle på øverste niveau. `status` er `ACTIVE`, `UNSUBSCRIBED` eller `DEPRECATED` (slettet).

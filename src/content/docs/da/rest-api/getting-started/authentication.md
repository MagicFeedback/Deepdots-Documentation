---
title: Godkendelse
description: Godkend med en API-nøgle, eller log ind med din API-bruger og forny tokenet, før det udløber.
sidebar:
  order: 1
---

Hver forespørgsel til Deepdots API har et bearer-token i `Authorization`-headeren. Der er to måder at få et på:

- **En API-nøgle** (anbefalet). Deepdots udsteder den til din integration. Den udløber ikke, så der er intet at forny.
- **Din API-brugers e-mail og adgangskode.** Du logger ind via API'et og får et token, der gælder i en time, plus et refresh-token til at forny det.

## Mulighed 1: API-nøgle

Send nøglen som bearer-token i hver forespørgsel:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_API_KEY"
```

Produktionsnøgler starter med `dd_live_`, udviklingsnøgler med `dd_test_`. En nøgle handler som den API-bruger, den er udstedt til, med de samme rettigheder.

En nøgle er gyldig, indtil Deepdots tilbagekalder den. Hvis en nøgle er lækket, eller du ikke længere har brug for den, så bed din kontaktperson hos Deepdots om at tilbagekalde den og udstede en ny.

## Mulighed 2: E-mail og adgangskode

### 1. Log ind

Send din API-brugers e-mail og adgangskode:

```bash
curl -X POST "https://api.deepdots.com/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-user@yourcompany.com",
    "password": "your-password"
  }'
```

Svaret indeholder tokenet og et refresh-token:

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "AMf-vBx...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### 2. Kald API'et

Send `idToken` som bearer-token i hver forespørgsel:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

### 3. Forny tokenet

Et token er gyldigt i **1 time** (`expiresIn`, i sekunder). Før det udløber, så byt refresh-tokenet til et nyt i stedet for at logge ind igen:

```bash
curl -X POST "https://api.deepdots.com/auth/token/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$DEEPDOTS_REFRESH_TOKEN\"}"
```

Svaret har samme form som login: et nyt `idToken` og et nyt `refreshToken`. Brug det nye refresh-token næste gang.

:::tip
Forny et par minutter før timen er gået, eller når API'et svarer `401`, og prøv derefter forespørgslen igen én gang med det nye token. Hvis selve fornyelsen svarer `401`, så log ind igen.
:::

## Pas på dine loginoplysninger

- Gem API-nøglen, eller e-mail, adgangskode og refresh-token, i en secret manager, aldrig i kildekoden.
- Brug en dedikeret API-bruger eller nøgle til hver integration, ikke en persons konto.
- Udvikling og produktion har hver sine loginoplysninger. En nøgle eller et token fra det ene virker ikke i det andet.

## Fejl

| Status | Hvor | Betydning | Hvad du gør |
|---|---|---|---|
| `401` | `/auth/token` | Forkert e-mail eller adgangskode | Tjek loginoplysningerne |
| `401` | `/auth/token/refresh` | Refresh-tokenet er ugyldigt eller udløbet | Log ind igen |
| `403` | `/auth/token`, `/auth/token/refresh` | API-brugeren er deaktiveret | Kontakt Deepdots |
| `429` | `/auth/token` | For mange mislykkede forsøg for denne konto | Vent, før du prøver igen |
| `401` | Alle andre endpoints | Token eller API-nøgle mangler, er ugyldig eller udløbet | Forny tokenet, og prøv igen én gang; med en API-nøgle, tjek nøglen |
| `403` | Alle andre endpoints | API-brugeren er ikke aktiv | Kontakt Deepdots |
| `405` | Alle andre endpoints | API-brugeren har ikke adgang til dette endpoint | Kontakt Deepdots |

## Næste skridt

- [Hurtig start](/da/rest-api/getting-started/quickstart/) — send din første feedback.

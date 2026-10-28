---
title: Godkendelse
description: Log ind med din API-bruger, få et bearer-token, og forny det, før det udløber.
sidebar:
  order: 1
---

Hver forespørgsel til Deepdots API har et bearer-token i `Authorization`-headeren. Du får tokenet ved at logge ind med din API-bruger via Deepdots API.

## 1. Log ind

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

## 2. Kald API'et

Send `idToken` som bearer-token i hver forespørgsel:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

## 3. Forny tokenet

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

- Gem e-mail, adgangskode og refresh-token i en secret manager, aldrig i kildekoden.
- Brug en dedikeret API-bruger til din integration, ikke en persons konto.
- Udvikling og produktion har hver sin API-bruger. Et token fra det ene virker ikke i det andet.

## Fejl

| Status | Hvor | Betydning | Hvad du gør |
|---|---|---|---|
| `401` | `/auth/token` | Forkert e-mail eller adgangskode | Tjek loginoplysningerne |
| `401` | `/auth/token/refresh` | Refresh-tokenet er ugyldigt eller udløbet | Log ind igen |
| `403` | `/auth/token`, `/auth/token/refresh` | API-brugeren er deaktiveret | Kontakt Deepdots |
| `429` | `/auth/token` | For mange mislykkede forsøg for denne konto | Vent, før du prøver igen |
| `401` | Alle andre endpoints | Token mangler, er ugyldigt eller udløbet | Forny tokenet, og prøv igen én gang |
| `403` | Alle andre endpoints | API-brugeren er ikke aktiv | Kontakt Deepdots |
| `405` | Alle andre endpoints | API-brugeren har ikke adgang til dette endpoint | Kontakt Deepdots |

## Næste skridt

- [Hurtig start](/da/rest-api/getting-started/quickstart/) — send din første feedback.

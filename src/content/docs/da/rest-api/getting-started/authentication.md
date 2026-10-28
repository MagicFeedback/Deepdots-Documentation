---
title: Godkendelse
description: Log ind med din API-bruger, få et bearer-token, og forny det, før det udløber.
sidebar:
  order: 1
---

Hver forespørgsel til Deepdots API har et bearer-token i `Authorization`-headeren. Du får tokenet ved at logge ind med din API-bruger via Google Identity Platform, på samme måde som Deepdots SDK'erne gør.

## 1. Log ind

Send din API-brugers e-mail og adgangskode sammen med den godkendelsesnøgle, Deepdots har givet dig:

```bash
curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$DEEPDOTS_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-user@yourcompany.com",
    "password": "your-password",
    "returnSecureToken": true
  }'
```

Svaret indeholder tokenet og et refresh-token:

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "AMf-vBx...",
  "expiresIn": "3600"
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
curl -X POST "https://securetoken.googleapis.com/v1/token?key=$DEEPDOTS_AUTH_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$DEEPDOTS_REFRESH_TOKEN"
```

Svaret har det nye token i `id_token` (og et nyt `refresh_token`).

:::tip
Forny et par minutter før timen er gået, eller når API'et svarer `401`, og prøv derefter forespørgslen igen én gang med det nye token.
:::

## Pas på dine loginoplysninger

- Gem e-mail, adgangskode og refresh-token i en secret manager, aldrig i kildekoden.
- Brug en dedikeret API-bruger til din integration, ikke en persons konto.
- Udvikling og produktion har hver sin API-bruger. Et token fra det ene virker ikke i det andet.

## Fejl

| Status | Betydning | Hvad du gør |
|---|---|---|
| `400` fra Identity Platform | Forkert e-mail, adgangskode eller nøgle | Tjek loginoplysningerne |
| `401` fra API'et | Token mangler, er ugyldigt eller udløbet | Forny tokenet, og prøv igen én gang |
| `403` fra API'et | API-brugeren er ikke aktiv | Kontakt Deepdots |
| `405` fra API'et | API-brugeren har ikke adgang til dette endpoint | Kontakt Deepdots |

## Næste skridt

- [Hurtig start](/da/rest-api/getting-started/quickstart/) — send din første feedback.

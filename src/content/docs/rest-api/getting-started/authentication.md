---
title: Authentication
description: Sign in with your API user, get a bearer token and refresh it before it expires.
sidebar:
  order: 1
---

Every request to the Deepdots API carries a bearer token in the `Authorization` header. You get the token by signing in with your API user through Google Identity Platform, the same way the Deepdots SDKs do.

## 1. Sign in

Send your API user's email and password, together with the authentication key Deepdots gave you:

```bash
curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$DEEPDOTS_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-user@yourcompany.com",
    "password": "your-password",
    "returnSecureToken": true
  }'
```

The response contains the token and a refresh token:

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "AMf-vBx...",
  "expiresIn": "3600"
}
```

## 2. Call the API

Send `idToken` as a bearer token on every request:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

## 3. Refresh the token

A token is valid for **1 hour** (`expiresIn`, in seconds). Before it expires, exchange the refresh token for a new one instead of signing in again:

```bash
curl -X POST "https://securetoken.googleapis.com/v1/token?key=$DEEPDOTS_AUTH_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$DEEPDOTS_REFRESH_TOKEN"
```

The response has the new token in `id_token` (and a new `refresh_token`).

:::tip
Refresh a few minutes before the hour is up, or whenever the API answers `401`, then retry the request once with the new token.
:::

## Keep your credentials safe

- Store the email, password and refresh token in a secret manager, never in source code.
- Use a dedicated API user for your integration, not a person's account.
- Development and production have separate API users. A token from one does not work on the other.

## Errors

| Status | Meaning | What to do |
|---|---|---|
| `400` from Identity Platform | Wrong email, password or key | Check the credentials |
| `401` from the API | Token missing, invalid or expired | Refresh the token and retry once |
| `403` from the API | The API user is not active | Contact Deepdots |
| `405` from the API | The API user lacks permission for this endpoint | Contact Deepdots |

## Next steps

- [Quickstart](/rest-api/getting-started/quickstart/) — send your first feedback.

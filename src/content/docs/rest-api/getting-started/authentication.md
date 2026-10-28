---
title: Authentication
description: Authenticate with an API key, or sign in with your API user and refresh the token before it expires.
sidebar:
  order: 1
---

Every request to the Deepdots API carries a bearer token in the `Authorization` header. There are two ways to get one:

- **An API key** (recommended). Deepdots issues it for your integration. It does not expire, so there is nothing to refresh.
- **Your API user's email and password.** You sign in through the API and get a token that lasts one hour, plus a refresh token to renew it.

## Option 1: API key

Send the key as the bearer token on every request:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_API_KEY"
```

Production keys start with `dd_live_`, development keys with `dd_test_`. A key acts as the API user it was issued for, with the same permissions.

A key is valid until Deepdots revokes it. If a key leaks, or you no longer need it, ask your Deepdots contact to revoke it and issue a new one.

## Option 2: Email and password

### 1. Sign in

Send your API user's email and password:

```bash
curl -X POST "https://api.deepdots.com/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-user@yourcompany.com",
    "password": "your-password"
  }'
```

The response contains the token and a refresh token:

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "AMf-vBx...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### 2. Call the API

Send `idToken` as a bearer token on every request:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

### 3. Refresh the token

A token is valid for **1 hour** (`expiresIn`, in seconds). Before it expires, exchange the refresh token for a new one instead of signing in again:

```bash
curl -X POST "https://api.deepdots.com/auth/token/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$DEEPDOTS_REFRESH_TOKEN\"}"
```

The response has the same shape as the sign-in: a new `idToken` and a new `refreshToken`. Use the new refresh token next time.

:::tip
Refresh a few minutes before the hour is up, or whenever the API answers `401`, then retry the request once with the new token. If the refresh itself answers `401`, sign in again.
:::

## Keep your credentials safe

- Store the API key, or the email, password and refresh token, in a secret manager, never in source code.
- Use a dedicated API user or key for each integration, not a person's account.
- Development and production have separate credentials. A key or token from one does not work on the other.

## Errors

| Status | Where | Meaning | What to do |
|---|---|---|---|
| `401` | `/auth/token` | Wrong email or password | Check the credentials |
| `401` | `/auth/token/refresh` | The refresh token is invalid or expired | Sign in again |
| `403` | `/auth/token`, `/auth/token/refresh` | The API user is disabled | Contact Deepdots |
| `429` | `/auth/token` | Too many failed attempts for this account | Wait before trying again |
| `401` | Any other endpoint | Token or API key missing, invalid or expired | Refresh the token and retry once; with an API key, check the key |
| `403` | Any other endpoint | The API user is not active | Contact Deepdots |
| `405` | Any other endpoint | The API user lacks permission for this endpoint | Contact Deepdots |

## Next steps

- [Quickstart](/rest-api/getting-started/quickstart/) — send your first feedback.

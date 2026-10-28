---
title: Autenticación
description: Autentícate con una API key, o inicia sesión con tu usuario de API y renueva el token antes de que caduque.
sidebar:
  order: 1
---

Cada petición a la API de Deepdots lleva un token bearer en la cabecera `Authorization`. Hay dos formas de obtenerlo:

- **Una API key** (recomendada). Deepdots la emite para tu integración. No caduca, así que no hay nada que renovar.
- **El email y la contraseña de tu usuario de API.** Inicias sesión a través de la API y obtienes un token que dura una hora, más un token de refresco para renovarlo.

## Opción 1: API key

Envía la key como token bearer en cada petición:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_API_KEY"
```

Las keys de producción empiezan por `dd_live_` y las de desarrollo por `dd_test_`. Una key actúa como el usuario de API para el que se emitió, con sus mismos permisos.

Una key es válida hasta que Deepdots la revoca. Si una key se filtra, o ya no la necesitas, pide a tu contacto de Deepdots que la revoque y te emita una nueva.

## Opción 2: Email y contraseña

### 1. Inicia sesión

Envía el email y la contraseña de tu usuario de API:

```bash
curl -X POST "https://api.deepdots.com/auth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-user@yourcompany.com",
    "password": "your-password"
  }'
```

La respuesta contiene el token y un token de refresco:

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "AMf-vBx...",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

### 2. Llama a la API

Envía `idToken` como token bearer en cada petición:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

### 3. Renueva el token

Un token es válido durante **1 hora** (`expiresIn`, en segundos). Antes de que caduque, cambia el token de refresco por uno nuevo en lugar de volver a iniciar sesión:

```bash
curl -X POST "https://api.deepdots.com/auth/token/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$DEEPDOTS_REFRESH_TOKEN\"}"
```

La respuesta tiene la misma forma que el inicio de sesión: un `idToken` nuevo y un `refreshToken` nuevo. Usa el token de refresco nuevo la próxima vez.

:::tip
Renueva unos minutos antes de que pase la hora, o cuando la API responda `401`, y reintenta la petición una vez con el token nuevo. Si la propia renovación responde `401`, vuelve a iniciar sesión.
:::

## Protege tus credenciales

- Guarda la API key, o el email, la contraseña y el token de refresco, en un gestor de secretos, nunca en el código fuente.
- Usa un usuario de API o una key dedicados para cada integración, no la cuenta de una persona.
- Desarrollo y producción tienen credenciales distintas. Una key o un token de uno no funciona en el otro.

## Errores

| Estado | Dónde | Significado | Qué hacer |
|---|---|---|---|
| `401` | `/auth/token` | Email o contraseña incorrectos | Revisa las credenciales |
| `401` | `/auth/token/refresh` | El token de refresco no es válido o ha caducado | Vuelve a iniciar sesión |
| `403` | `/auth/token`, `/auth/token/refresh` | El usuario de API está deshabilitado | Contacta con Deepdots |
| `429` | `/auth/token` | Demasiados intentos fallidos para esta cuenta | Espera antes de volver a intentarlo |
| `401` | Cualquier otro endpoint | Token o API key ausente, no válido o caducado | Renueva el token y reintenta una vez; con una API key, revisa la key |
| `403` | Cualquier otro endpoint | El usuario de API no está activo | Contacta con Deepdots |
| `405` | Cualquier otro endpoint | El usuario de API no tiene permiso para este endpoint | Contacta con Deepdots |

## Siguientes pasos

- [Inicio rápido](/es/rest-api/getting-started/quickstart/) — envía tu primer feedback.

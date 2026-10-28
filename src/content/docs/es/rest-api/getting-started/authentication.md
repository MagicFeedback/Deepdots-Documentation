---
title: Autenticación
description: Inicia sesión con tu usuario de API, obtén un token bearer y renuévalo antes de que caduque.
sidebar:
  order: 1
---

Cada petición a la API de Deepdots lleva un token bearer en la cabecera `Authorization`. El token se obtiene iniciando sesión con tu usuario de API a través de Google Identity Platform, igual que hacen los SDK de Deepdots.

## 1. Inicia sesión

Envía el email y la contraseña de tu usuario de API, junto con la clave de autenticación que te dio Deepdots:

```bash
curl -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$DEEPDOTS_AUTH_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-user@yourcompany.com",
    "password": "your-password",
    "returnSecureToken": true
  }'
```

La respuesta contiene el token y un token de refresco:

```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "AMf-vBx...",
  "expiresIn": "3600"
}
```

## 2. Llama a la API

Envía `idToken` como token bearer en cada petición:

```bash
curl "https://api.deepdots.com/crm/contacts?filter[limit]=1" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

## 3. Renueva el token

Un token es válido durante **1 hora** (`expiresIn`, en segundos). Antes de que caduque, cambia el token de refresco por uno nuevo en lugar de volver a iniciar sesión:

```bash
curl -X POST "https://securetoken.googleapis.com/v1/token?key=$DEEPDOTS_AUTH_KEY" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=$DEEPDOTS_REFRESH_TOKEN"
```

La respuesta trae el token nuevo en `id_token` (y un `refresh_token` nuevo).

:::tip
Renueva unos minutos antes de que pase la hora, o cuando la API responda `401`, y reintenta la petición una vez con el token nuevo.
:::

## Protege tus credenciales

- Guarda el email, la contraseña y el token de refresco en un gestor de secretos, nunca en el código fuente.
- Usa un usuario de API dedicado para tu integración, no la cuenta de una persona.
- Desarrollo y producción tienen usuarios de API distintos. Un token de uno no funciona en el otro.

## Errores

| Estado | Significado | Qué hacer |
|---|---|---|
| `400` de Identity Platform | Email, contraseña o clave incorrectos | Revisa las credenciales |
| `401` de la API | Token ausente, no válido o caducado | Renueva el token y reintenta una vez |
| `403` de la API | El usuario de API no está activo | Contacta con Deepdots |
| `405` de la API | El usuario de API no tiene permiso para este endpoint | Contacta con Deepdots |

## Siguientes pasos

- [Inicio rápido](/es/rest-api/getting-started/quickstart/) — envía tu primer feedback.

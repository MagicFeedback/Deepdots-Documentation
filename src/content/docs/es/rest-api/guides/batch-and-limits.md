---
title: Bloques, límites y reintentos
description: Qué tamaño puede tener una petición, cómo reintentar de forma segura y cómo gestionar los fallos parciales.
sidebar:
  order: 3
---

## Límites

| Qué | Límite |
|---|---|
| Contactos por `POST /crm/contacts/upsert/batch` | 500 |
| Cuerpo de la petición | 1 MB |
| Vida del token de inicio de sesión (`/auth/token`) | 1 hora; las API keys no caducan |

En `POST /feedbacks/bulk`, mantén cada petición por debajo del límite de 1 MB. Unos cientos de feedbacks por petición es un buen tamaño.

## Reintenta de forma segura

- **Feedback:** envía siempre `external_id`. Una petición reintentada devuelve el feedback que ya existe en lugar de crear un segundo.
- **Contactos:** usa los endpoints de upsert. Enviar el mismo contacto dos veces lo actualiza en lugar de crear un duplicado.
- **Cuándo reintentar:** ante errores de red, tiempos de espera agotados y respuestas `5xx`, con una espera creciente entre intentos (por ejemplo 1 s, 2 s, 4 s). Reintenta un `401` una vez, después de renovar el token (con una API key, un `401` significa que la key es incorrecta o está revocada: no reintentes).
- **Cuándo no reintentar:** `400`, `404`, `406` y `422` significan que la petición en sí está mal. Corrígela antes de volver a enviarla.

## Fallos parciales

`POST /crm/contacts/upsert/batch` trata cada contacto por separado. Una petición mal formada (una lista vacía, o más de 500 elementos) hace fallar toda la llamada con `400`. Lo que solo afecta a un contacto, como un email no válido, aparece en `failed` y el resto se guarda:

```json
{
  "contacts": 3,
  "created": 1,
  "updated": 1,
  "failed": [
    {"index": 2, "email": "not-an-email", "error": "Invalid email format."}
  ]
}
```

Revisa `failed` después de cada bloque y reenvía solo esos elementos una vez corregidos.

`POST /feedbacks/bulk` valida primero la petición entera: si algo está mal, no se guarda nada.

## Siguientes pasos

- [Errores](/es/rest-api/reference/errors/) — cada código de estado y su significado.

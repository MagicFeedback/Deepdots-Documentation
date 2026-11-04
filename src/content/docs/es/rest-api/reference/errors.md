---
title: Errores
description: El formato de error y todos los códigos de estado que devuelve la API REST de Deepdots.
sidebar:
  order: 2
---

## Formato de error

Los errores llegan como JSON con un objeto `error`:

```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid. See error object `details` property for more info.",
    "details": [
      {
        "path": "/answers/0",
        "code": "type",
        "message": "must be object"
      }
    ]
  }
}
```

`details` solo aparece en los errores de validación (`422`) y lista cada campo que ha fallado.

## Códigos de estado

| Estado | Significado | ¿Reintentar? |
|---|---|---|
| `200` | Correcto | — |
| `400` | La petición está mal: un email no válido, una compañía o un producto vacíos o que no existen, un campo que `PATCH /crm/contacts/{id}/fields` no admite, o una integración o un contacto de otra compañía | No, corrige la petición |
| `401` | El token falta, no es válido o ha caducado | Una vez, después de renovar el token |
| `403` | El usuario de API no está activo | No, contacta con Deepdots |
| `404` | La integración no existe o no es visible para ti, o `crmContactId` no es un contacto activo que puedas ver | No |
| `405` | El usuario de API no tiene permiso para este endpoint | No, contacta con Deepdots |
| `406` | La compañía o el contacto no son tuyos, un feedback que lees con `GET /feedbacks/{id}` no existe o no es visible para ti, o el contacto que actualizas no está activo | No |
| `422` | El cuerpo no cumple el esquema (ver `details`): un campo que falta o que no existe, un valor de tipo incorrecto o un valor no permitido, como un `country` en mayúsculas | No, corrige la petición |
| `429` | Demasiados inicios de sesión fallidos para esta cuenta (solo `/auth/token`) | Sí, tras una espera |
| `5xx` | Un problema por nuestra parte | Sí, con una espera creciente |

Si un `5xx` persiste, o ves un error que no puedes explicar, envíanos la hora de la petición, el endpoint y el `external_id` (o el email) afectado.

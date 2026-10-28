---
title: Inicio rápido
description: Autentícate, envía un feedback y vuelve a leerlo, en tres peticiones.
sidebar:
  order: 2
---

Este inicio rápido envía un feedback al entorno de desarrollo. Necesitas las credenciales y el `integrationId` descritos en [Autenticación](/es/rest-api/getting-started/authentication/).

## 1. Prepara tus credenciales

Con una API key de desarrollo, la key es el token:

```bash
export DEEPDOTS_TOKEN="dd_test_..."
```

Si usas un usuario de API, inicia sesión para obtener uno:

```bash
export DEEPDOTS_TOKEN=$(curl -s -X POST "https://api-dev.deepdots.com/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"email": "api-user@yourcompany.com", "password": "your-password"}' \
  | jq -r .idToken)
```

## 2. Envía un feedback

```bash
curl -X POST "https://api-dev.deepdots.com/feedbacks" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "<your-integration-id>",
    "external_id": "order-10045",
    "name": "Order 10045",
    "answers": [
      {"key": "nps", "value": ["9"]},
      {"key": "comment", "value": ["Fast delivery, great service"]}
    ]
  }'
```

La API responde con el feedback guardado. Quédate con su `id`:

```json
{
  "id": "5f0c2a10-...",
  "status": "REGISTERED",
  "integrationId": "<your-integration-id>",
  "companyId": "YOUR_COMPANY",
  "external_id": "order-10045",
  ...
}
```

:::note
La compañía, el producto, el tipo y la identidad se toman de la integración, así que no hace falta enviarlos.
:::

## 3. Vuelve a leerlo

```bash
curl "https://api-dev.deepdots.com/feedbacks/<feedback-id>" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN"
```

`status` pasa de `REGISTERED` a `DONE` cuando Deepdots ha analizado el feedback. A partir de ahí aparece en el dashboard.

## Siguientes pasos

- [Feedback](/es/rest-api/guides/feedback/) — métricas, metadatos, envíos en bloque y duplicados.
- [Contactos](/es/rest-api/guides/contacts/) — crea contactos y vincúlalos al feedback.

---
title: Enviar feedback
description: Envía feedback con respuestas, métricas y metadatos, de uno en uno o en bloque, sin crear duplicados.
sidebar:
  order: 1
---

Un feedback es una respuesta de una persona: la respuesta a una encuesta, una reseña, una conversación de soporte. Se envía con `POST /feedbacks`, o muchos a la vez con `POST /feedbacks/bulk`.

## Envía un feedback

```bash
curl -X POST "https://api.deepdots.com/feedbacks" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "<your-integration-id>",
    "external_id": "survey-2026-10-26-000123",
    "name": "Post-purchase survey",
    "externalGeneratedAt": "2026-10-26T09:41:00Z",
    "answers": [
      {"key": "nps", "value": ["9"]},
      {"key": "comment", "value": ["The staff were really helpful"]}
    ],
    "metrics": [
      {"key": "store", "value": "Copenhagen Central"},
      {"key": "channel", "value": "email"}
    ],
    "metadata": [
      {"key": "order_id", "value": "10045"}
    ]
  }'
```

La respuesta es el feedback guardado, con su `id` de Deepdots.

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `integrationId` | string | **Obligatorio.** La fuente de la que viene este feedback. Deepdots te da uno por fuente. |
| `external_id` | string | Recomendado. Tu propio id para este feedback. Evita duplicados (ver más abajo). |
| `name` | string | Una etiqueta corta que se muestra en el dashboard. |
| `externalGeneratedAt` | string (ISO 8601) | Cuándo se dio el feedback. Por defecto, la hora de la petición. |
| `externalUpdatedAt` | string (ISO 8601) | Cuándo se modificó por última vez el feedback en tu sistema. |
| `externalUrl` | string | Un enlace al feedback en tu sistema. |
| `answers` | array | Las respuestas: `{"key": "<pregunta>", "value": ["<respuesta>"]}`. `value` siempre es una lista. |
| `text` | string | Texto libre, para feedback que no es un conjunto de respuestas (una reseña, una conversación). |
| `metrics` | array | Valores por los que quieres filtrar y agrupar en el dashboard: `{"key": "<nombre>", "value": "<valor>"}`. |
| `metadata` | array | Contexto adicional que se guarda con el feedback: `{"key": "<nombre>", "value": "<valor>"}`. |
| `crmContactId` | string | El contacto que dio el feedback. Ver [Contactos](/es/rest-api/guides/contacts/#vincular-feedback-a-un-contacto). |

`companyId`, `productId`, `type` e `identity` se toman de la integración. Solo los envías si Deepdots te lo pide.

:::tip[¿Métricas o metadatos?]
Usa **métricas** para lo que la gente va a filtrar: tienda, región, canal, nivel de cliente. Usa **metadatos** para el contexto que quieres guardar pero no filtrar, como un número de pedido.
:::

## Evita duplicados

Envía `external_id` con cada feedback. Si ya existe un feedback con el mismo `external_id` para esa integración, la API **no crea uno nuevo**: responde `200` con el feedback existente.

Eso hace que los reintentos sean seguros. Si una petición agota el tiempo de espera, vuelve a enviarla con el mismo `external_id`.

## Envía muchos feedbacks a la vez

`POST /feedbacks/bulk` recibe una lista de feedbacks de una compañía y un producto:

```bash
curl -X POST "https://api.deepdots.com/feedbacks/bulk" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "<your-company-id>",
    "product": "<your-product-id>",
    "feedbacks": [
      {
        "integrationId": "<your-integration-id>",
        "type": "SURVEY",
        "identity": "CUSTOM",
        "external_id": "survey-000124",
        "answers": [{"key": "nps", "value": ["10"]}]
      },
      {
        "integrationId": "<your-integration-id>",
        "type": "SURVEY",
        "identity": "CUSTOM",
        "external_id": "survey-000125",
        "answers": [{"key": "nps", "value": ["6"]}]
      }
    ]
  }'
```

Diferencias con `POST /feedbacks`:

- `company` y `product` son **obligatorios**, y todos los feedbacks de la lista deben pertenecer a ellos.
- No se toma nada de la integración: cada feedback necesita su propio `type` e `identity`. Deepdots te indica qué valores usar.
- La respuesta es la lista de feedbacks **creados**. Los feedbacks cuyo `external_id` ya existía se omiten y no aparecen en la respuesta, así que reintentar un bloque no crea duplicados.

Consulta [Bloques y límites](/es/rest-api/guides/batch-and-limits/) para el tamaño de los bloques.

## Siguientes pasos

- [Contactos](/es/rest-api/guides/contacts/) — registra quién dio cada feedback.
- [Endpoints](/es/rest-api/reference/endpoints/) — la petición y la respuesta completas de cada llamada.

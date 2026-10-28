---
title: Gestionar contactos
description: Crea o actualiza contactos del CRM por email, mantén sincronizados sus campos personalizados y vincúlalos al feedback.
sidebar:
  order: 2
---

Los contactos son las personas detrás de tu feedback. Cada contacto pertenece a tu compañía y se identifica por su **email**.

## Crea o actualiza un contacto

Usa `POST /crm/contacts/upsert`. Si ya existe un contacto con ese email en tu compañía, se actualiza; si no, se crea:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anna.jensen@example.com",
    "name": "Anna",
    "lastname": "Jensen",
    "externalId": "SF-0035g00000XyZ12",
    "country": "DK",
    "customFields": {
      "tier": "gold",
      "customer_since": "2019-04-01",
      "newsletter": true,
      "lifetime_orders": 42
    }
  }'
```

La respuesta es el contacto, con su `id` de Deepdots.

### Cómo funcionan las actualizaciones

- El email es la clave de búsqueda. Se guarda sin espacios y en minúsculas, así que `Anna.Jensen@Example.com` y `anna.jensen@example.com` son el mismo contacto.
- Los campos que envías se sobrescriben. Los que no envías se mantienen.
- `customFields` se **fusionan**: las claves que envías se añaden o actualizan, una clave enviada como `null` se elimina y el resto de campos personalizados se mantienen.

:::caution
`POST /crm/contacts` también existe, pero **siempre crea** un contacto nuevo, aunque el email ya exista. Usa el upsert para no tener nunca duplicados.
:::

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `email` | string | **Obligatorio.** El email del contacto y la clave para encontrarlo. |
| `name`, `lastname` | string | El nombre del contacto. |
| `externalId` | string | Tu propio id para el contacto, por ejemplo su id en tu CRM. |
| `phone`, `address`, `city`, `state`, `postalCode` | string | Datos de contacto. |
| `country` | string | Código ISO 3166-1 alpha-2, por ejemplo `DK`. |
| `customFields` | object | Tus propios campos. Cada valor es un string, un número o un booleano. |

## Muchos contactos a la vez

`POST /crm/contacts/upsert/batch` hace upsert de hasta **500** contactos en una sola petición:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert/batch" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"email": "anna.jensen@example.com", "customFields": {"tier": "gold"}},
      {"email": "lars.nielsen@example.com", "customFields": {"tier": "silver"}}
    ]
  }'
```

Cada contacto se trata como un upsert individual. Un elemento erróneo no detiene al resto: se informa en `failed`, con su posición en la lista.

```json
{
  "contacts": 2,
  "created": 1,
  "updated": 1,
  "failed": []
}
```

## Actualiza solo algunos campos

Cuando ya tienes el `id` de Deepdots del contacto, `PATCH /crm/contacts/{id}/fields` actualiza sus campos personalizados (fusionados de la misma forma) y sus datos de contacto:

```bash
curl -X PATCH "https://api.deepdots.com/crm/contacts/<contact-id>/fields" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customFields": {"tier": "platinum", "newsletter": null},
    "city": "Aarhus"
  }'
```

La respuesta es el `id` del contacto y sus `customFields` después de la fusión. Este endpoint no cambia `email` ni `externalId`.

## Busca un contacto

`GET /crm/contacts` acepta un `filter` para buscar contactos, por ejemplo por tu propio id:

```bash
curl -G "https://api.deepdots.com/crm/contacts" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  --data-urlencode 'filter={"where": {"externalId": "SF-0035g00000XyZ12"}, "limit": 1}'
```

## Vincular feedback a un contacto

Para registrar quién dio un feedback, envía el `id` de Deepdots del contacto como `crmContactId` al enviar el feedback:

```bash
curl -X POST "https://api.deepdots.com/feedbacks" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "integrationId": "<your-integration-id>",
    "external_id": "survey-000126",
    "crmContactId": "<contact-id>",
    "answers": [{"key": "nps", "value": ["8"]}]
  }'
```

El contacto debe pertenecer a la misma compañía que el feedback. Deepdots guarda una copia de los campos del contacto tal como estaban cuando se dio el feedback, así que los cambios posteriores en el contacto no reescriben el feedback anterior.

Un flujo típico: haz upsert del contacto, guarda el `id` que devuelve y envía el feedback con ese `crmContactId`.

## Siguientes pasos

- [Bloques y límites](/es/rest-api/guides/batch-and-limits/) — tamaño de los bloques, reintentos y errores.
- [Endpoints](/es/rest-api/reference/endpoints/) — la petición y la respuesta completas de cada llamada.

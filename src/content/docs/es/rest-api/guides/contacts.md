---
title: Gestionar contactos
description: Crea o actualiza contactos del CRM por email o por tu propio id, mantén sincronizados sus campos personalizados y vincúlalos al feedback.
sidebar:
  order: 2
---

Los contactos son las personas detrás de tu feedback. Cada contacto pertenece a tu compañía y se busca por su **email**, o por tu propio `externalId`.

## Crea o actualiza un contacto

Usa `POST /crm/contacts/upsert`. Actualiza el contacto activo de tu compañía con ese email o, en su defecto, el que tenga el `externalId` que envías, y crea un contacto cuando no hay ninguno de los dos:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "anna.jensen@example.com",
    "name": "Anna",
    "lastname": "Jensen",
    "externalId": "SF-0035g00000XyZ12",
    "country": "dk",
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

- El email es la primera clave de búsqueda. Se guarda sin espacios y en minúsculas, así que `Anna.Jensen@Example.com` y `anna.jensen@example.com` son el mismo contacto. Por email solo se buscan los contactos activos.
- Cuando ningún contacto activo tiene ese email, se actualiza en su lugar el contacto con el `externalId` que envías, sea cual sea su estado: toma el nuevo email y vuelve a estar activo si estaba eliminado. Un contacto dado de baja sigue dado de baja: la respuesta trae `"status": "UNSUBSCRIBED"`, y el contacto no se puede vincular a un feedback.
- Cuando ningún contacto tiene el `externalId` que envías, o no envías ninguno, se crea un contacto nuevo, aunque un contacto dado de baja o eliminado tenga ese email. Envía tu `externalId` siempre que lo tengas, para que una persona que se dio de baja se encuentre en lugar de volver como un contacto nuevo y activo.
- Varios contactos pueden tener el mismo `externalId`, por ejemplo contactos creados antes del cambio de noviembre de 2026, o dos contactos creados por peticiones enviadas al mismo tiempo. En ese caso solo se actualiza uno de ellos: el activo más antiguo; si no hay ninguno activo, el dado de baja más antiguo, y si no, el eliminado más antiguo.
- Los campos que envías se sobrescriben. Los que no envías se mantienen.
- `customFields` se **fusionan**: las claves que envías se añaden o actualizan, una clave enviada como `null` se elimina y el resto de campos personalizados se mantienen.

:::caution
`POST /crm/contacts` también existe. Cuando tu compañía ya tiene un contacto con el `externalId` que envías, actualiza y devuelve ese contacto de la misma forma, en lugar de crear uno; si tu usuario de API puede crear contactos pero no actualizarlos, el contacto se devuelve sin cambios. En cualquier otro caso, **siempre crea** un contacto nuevo, aunque el email ya exista. Usa el upsert para evitar duplicados.
:::

### Campos

| Campo | Tipo | Descripción |
|---|---|---|
| `email` | string | **Obligatorio.** El email del contacto y la primera clave para encontrarlo. |
| `name` | string | **Obligatorio.** El nombre del contacto. |
| `lastname` | string | El apellido del contacto. |
| `externalId` | string | Tu propio id para el contacto, por ejemplo su id en tu CRM. Se usa para encontrar el contacto cuando ningún contacto activo tiene el email. |
| `phone`, `address`, `city`, `state`, `postalCode` | string | Datos de contacto. |
| `country` | string | Código ISO 3166-1 alpha-2 en minúsculas, por ejemplo `dk`. Un valor que la API no acepta, como `DK`, se rechaza con `422`. |
| `customFields` | object | Tus propios campos. Cada valor es un string, un número o un booleano. |

## Muchos contactos a la vez

`POST /crm/contacts/upsert/batch` hace upsert de hasta **500** contactos en una sola petición:

```bash
curl -X POST "https://api.deepdots.com/crm/contacts/upsert/batch" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"email": "anna.jensen@example.com", "name": "Anna", "customFields": {"tier": "gold"}},
      {"email": "lars.nielsen@example.com", "name": "Lars", "customFields": {"tier": "silver"}}
    ]
  }'
```

Cada contacto se trata como un upsert individual. Un contacto que falla por sí solo, por ejemplo por un email no válido, se informa en `failed` con su posición en la lista, y el resto se guarda. Un contacto que no se ajusta a los campos de arriba, por ejemplo uno sin `name`, hace fallar toda la petición con `422`, y no se guarda nada.

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

La respuesta es el `id` del contacto y sus `customFields` después de la fusión. Este endpoint no cambia `email` ni `externalId`, y solo funciona con un contacto activo: con uno dado de baja o eliminado responde `406`.

## Busca un contacto

`GET /crm/contacts` acepta un `filter` para buscar contactos, por ejemplo por tu propio id:

```bash
curl -G "https://api.deepdots.com/crm/contacts" \
  -H "Authorization: Bearer $DEEPDOTS_TOKEN" \
  --data-urlencode 'filter={"where": {"externalId": "SF-0035g00000XyZ12"}, "limit": 1}'
```

Solo devuelve contactos activos, salvo que tu `where` tenga una clave `status` en su primer nivel (`ACTIVE`, `UNSUBSCRIBED`, o `DEPRECATED` para un contacto eliminado), así que no lo uses para decidir si crear un contacto: el upsert también encuentra por su `externalId` los contactos dados de baja o eliminados.

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

El contacto debe estar activo y pertenecer a la misma compañía que el feedback. Deepdots guarda una copia de los campos del contacto tal como estaban cuando se dio el feedback, así que los cambios posteriores en el contacto no reescriben el feedback anterior.

Un flujo típico: haz upsert del contacto, guarda el `id` que devuelve y envía el feedback con ese `crmContactId`. Solo se puede vincular un contacto activo, así que comprueba el `status` que devuelve el upsert.

## Siguientes pasos

- [Bloques y límites](/es/rest-api/guides/batch-and-limits/) — tamaño de los bloques, reintentos y errores.
- [Endpoints](/es/rest-api/reference/endpoints/) — la petición y la respuesta completas de cada llamada.

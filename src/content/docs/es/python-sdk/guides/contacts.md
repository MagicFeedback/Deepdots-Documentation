---
title: Gestión de Contactos
description: Crea, actualiza (también con upsert), lista y elimina contactos CRM con el SDK Python de Deepdots.
---

Los contactos representan las personas en tu CRM — clientes, usuarios o cualquier individuo que quieras asociar con campañas o feedback.

## Crear un contacto

```python
contact = client.contacts.create({
    "name": "Jane",
    "lastname": "Smith",
    "email": "jane.smith@ejemplo.com",
    "companyId": "TU_COMPANY_ID",
})
print(contact["id"])
```

### Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre |
| `lastname` | string | Apellido |
| `email` | string | Dirección de correo |
| `companyId` | string | Tu identificador de empresa |

Si la empresa ya tiene un contacto con el `externalId` que envías, `create()` no agrega uno nuevo: actualiza ese contacto con los campos que envías (incluido `email`; `customFields` se fusiona) y lo retorna. Un contacto eliminado vuelve a estar activo; uno dado de baja sigue dado de baja. Si tu rol no permite actualizar contactos, el contacto se retorna sin cambios. La API funciona así desde noviembre de 2026, con cualquier versión del SDK.

En cualquier otro caso, `create()` siempre agrega un contacto nuevo, aunque la empresa ya tenga uno con el mismo email. Para buscar el contacto por email, usa [`upsert()`](#crear-o-actualizar-por-email).

Aun así, varios contactos pueden tener el mismo `externalId`, por ejemplo contactos creados antes del cambio de noviembre de 2026, o dos contactos creados por llamadas enviadas al mismo tiempo. En ese caso, `create()`, y `upsert()` cuando ningún contacto activo tiene tu email, actualizan solo uno de ellos: el activo más antiguo; si no hay ninguno activo, el dado de baja más antiguo, y si no, el eliminado más antiguo.

## Crear o actualizar por email

`upsert()` actualiza el contacto activo de la empresa que tenga el mismo email (sin distinguir mayúsculas ni espacios al principio o al final). Si no hay ninguno, actualiza el contacto con el `externalId` que envías, que pasa a tener tu email y vuelve a estar activo si estaba eliminado; uno dado de baja sigue dado de baja. Si tampoco hay ningún contacto con ese `externalId`, crea uno. Disponible a partir del SDK 1.0.22.

Por email solo se buscan los contactos activos: un contacto dado de baja o eliminado solo se encuentra a través de su `externalId`. Si no lo envías, `upsert()` crea un contacto activo nuevo con el mismo email. Un contacto dado de baja no se puede enviar como `crmContactId` de un feedback, así que comprueba el `status` que retornan `create()` o `upsert()` antes de usar su `id` así.

```python
contact = client.contacts.upsert({
    "name": "Jane",
    "email": "jane.smith@ejemplo.com",
    "companyId": "TU_COMPANY_ID",
    "customFields": {"loyalty_tier": "gold"},
})
```

`name`, `email` y `companyId` son obligatorios. Si el contacto ya existe, los campos que envías se sobrescriben y `customFields` se fusiona: los campos personalizados que envías se agregan o cambian, y los demás se conservan. Retorna el contacto.

### Muchos contactos a la vez

`upsert_batch()` hace lo mismo con una lista de cualquier longitud. El SDK la envía en requests de 500 contactos.

```python
result = client.contacts.upsert_batch([
    {"name": "Jane", "email": "jane.smith@ejemplo.com", "companyId": "TU_COMPANY_ID"},
    {"name": "John", "email": "john.doe@ejemplo.com", "companyId": "TU_COMPANY_ID"},
])
print(result["created"], result["updated"], result["failed"])
```

Un contacto que falla por sí solo (un email no válido, o una empresa a la que no tienes acceso) aparece en `failed` con su `index` en la lista que pasaste, y los demás se guardan igualmente. Un contacto que la API no puede aceptar en absoluto — sin `name` o `email`, con un campo que no conoce, con un valor de tipo incorrecto o `None`, o con un `country` que no sea un código ISO en minúsculas — hace que la API rechace con un 422 todo su request, de hasta 500 contactos, y `upsert_batch()` lanza `requests.HTTPError`. Los requests enviados antes ya se han guardado, y el resto de la lista no se envía. Retorna `{"contacts", "created", "updated", "failed"}`.

## Listar contactos

```python
contacts = client.contacts.get()
```

Filtra con un dict estilo LoopBack (ver [Consultas](/es/python-sdk/guides/querying/)):

```python
contacts = client.contacts.get({
    "where": {"companyId": "TU_COMPANY_ID"},
    "limit": 100,
})
```

`get()` solo retorna contactos activos, salvo que tu `where` tenga una clave `status` en su primer nivel, por ejemplo `{"where": {"externalId": "C-1001", "status": "UNSUBSCRIBED"}}`. Así que no lo uses para decidir si crear un contacto: `create()` y `upsert()` también encuentran por su `externalId` los contactos dados de baja o eliminados.

## Actualizar un contacto

Pasa solo los campos que quieras cambiar:

```python
client.contacts.update(contact["id"], {
    "name": "Janet",
})
```

`update()` retorna un dict vacío (`{}`). `update()`, `update_fields()` y `delete()` solo funcionan con contactos activos: con un contacto dado de baja o eliminado lanzan `requests.HTTPError` con HTTP 406.

## Actualizar campos personalizados

`update()` reemplaza el objeto `customFields` completo, así que si lo usas para cambiar un campo personalizado se borran todos los demás. Usa en su lugar `update_fields()`. Agrega o cambia los campos personalizados que envías, conserva el resto y elimina los que pones a `None`. Disponible a partir del SDK 1.0.22.

```python
# Agregar o cambiar campos personalizados, conservando los demás
client.contacts.update_fields(contact["id"], {"loyalty_tier": "gold", "vip": True})

# Eliminar un campo personalizado
client.contacts.update_fields(contact["id"], {"loyalty_tier": None})

# Campos personalizados y campos nativos en una sola llamada
client.contacts.update_fields(contact["id"], {"nps_segment": "promoter"}, city="Copenhagen")
```

Los valores pueden ser strings, números o booleanos. Como argumentos con nombre también puedes cambiar `name`, `lastname`, `phone`, `address`, `city`, `state` y `postalCode`. Cualquier otro campo se rechaza con un 400; cámbialo con `update()`. Retorna `{"id": ..., "customFields": {...}}` con todos los campos personalizados tras el cambio.

## Eliminar un contacto

```python
client.contacts.delete(contact["id"])
```

:::tip
Guarda el `id` del contacto retornado por `create()` cuando necesites referenciar el contacto más adelante — por ejemplo, al crear sesiones de campaña. Ver [Campañas](/es/python-sdk/guides/campaigns/).
:::

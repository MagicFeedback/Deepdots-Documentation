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

`create()` siempre agrega un contacto nuevo, aunque la empresa ya tenga uno con el mismo email. Para evitar duplicados, usa [`upsert()`](#crear-o-actualizar-por-email).

## Crear o actualizar por email

`upsert()` actualiza el contacto activo de la empresa que tenga el mismo email (sin distinguir mayúsculas ni espacios al principio o al final), o crea uno si no existe. Disponible a partir del SDK 1.0.22.

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

## Actualizar un contacto

Pasa solo los campos que quieras cambiar:

```python
updated = client.contacts.update(contact["id"], {
    "name": "Janet",
})
```

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

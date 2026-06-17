---
title: Gestión de Contactos
description: Crea, lista, actualiza y elimina contactos CRM con el SDK Python de MagicFeedback.
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
| `email` | string | Dirección de correo (debe ser única por empresa) |
| `companyId` | string | Tu identificador de empresa |

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

## Eliminar un contacto

```python
client.contacts.delete(contact["id"])
```

:::tip
Guarda el `id` del contacto retornado por `create()` cuando necesites referenciar el contacto más adelante — por ejemplo, al crear sesiones de campaña. Ver [Campañas](/es/python-sdk/guides/campaigns/).
:::

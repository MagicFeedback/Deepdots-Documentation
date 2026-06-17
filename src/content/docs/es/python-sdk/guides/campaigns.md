---
title: Campañas
description: Crea campañas, adjunta contactos mediante sesiones y recupera el feedback de sesiones con el SDK Python de MagicFeedback.
---

Las campañas te permiten agrupar esfuerzos de alcance y rastrear qué contactos participaron. Cada campaña contiene una o más sesiones; cada sesión enlaza con una lista de contactos.

## Crear una campaña

```python
campaign = client.campaigns.create({
    "name": "Encuesta NPS Q3",
    "companyId": "TU_COMPANY_ID",
})
print(campaign["id"])
```

### Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Nombre legible de la campaña |
| `companyId` | string | Tu identificador de empresa |

## Listar campañas

```python
campaigns = client.campaigns.get()
```

## Crear una sesión

Una sesión vincula un conjunto de contactos a una campaña. Cada contacto se referencia por su `id`.

```python
session = client.campaigns.create_session(campaign["id"], {
    "crmContactId": ["contact-uuid-1", "contact-uuid-2"],
})
```

:::caution
`crmContactId` debe ser una lista no vacía. Pasar una lista vacía o un string simple hará que la API rechace el request.
:::

## Listar sesiones de una campaña

```python
sessions = client.campaigns.get_sessions(campaign["id"])
```

## Obtener feedback de las sesiones

Recupera todas las submissions de feedback vinculadas a las sesiones de una campaña:

```python
feedbacks = client.campaigns.get_sessions_feedbacks(campaign["id"])
```

### Flujo típico

```python
# 1. Crear contactos
contact_a = client.contacts.create({
    "name": "Alice", "lastname": "Doe",
    "email": "alice@ejemplo.com", "companyId": "TU_COMPANY_ID",
})
contact_b = client.contacts.create({
    "name": "Bob", "lastname": "Doe",
    "email": "bob@ejemplo.com", "companyId": "TU_COMPANY_ID",
})

# 2. Crear una campaña
campaign = client.campaigns.create({
    "name": "Encuesta NPS Q3", "companyId": "TU_COMPANY_ID",
})

# 3. Agregar una sesión con ambos contactos
session = client.campaigns.create_session(campaign["id"], {
    "crmContactId": [contact_a["id"], contact_b["id"]],
})

# 4. Más tarde: obtener todo el feedback de esta campaña
feedbacks = client.campaigns.get_sessions_feedbacks(campaign["id"])
```

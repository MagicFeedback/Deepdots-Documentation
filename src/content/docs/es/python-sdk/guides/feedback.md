---
title: Gestión de Feedback
description: Crea, lee, actualiza y elimina submissions de feedback con el SDK Python de MagicFeedback.
---

Las submissions de feedback son el recurso principal en MagicFeedback. Cada submission registra un conjunto de respuestas para una integración y producto específicos.

## Crear una submission

```python
feedback = client.feedbacks.create({
    "name": "Respuesta de encuesta de usuario",
    "type": "APP",
    "identity": "MAGICFORM",
    "answers": [
        {"key": "nps", "value": "9"},
        {"key": "reason", "value": "Rápido y confiable"},
    ],
    "integrationId": "0eb9d270-6dd7-11ef-9987-21e04f383573",
    "companyId": "TU_COMPANY_ID",
    "productId": "TU_PRODUCT_ID",
})
print(feedback["id"])
```

### Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Etiqueta legible para esta submission |
| `type` | string | Tipo de fuente — ej. `"APP"`, `"DOCUMENT"` |
| `identity` | string | Identidad del renderer — ej. `"MAGICFORM"` |
| `integrationId` | string | UUID de la integración a la que pertenece este feedback |
| `companyId` | string | Tu identificador de empresa |
| `productId` | string | El producto con el que se asocia este feedback |

### Envoltura de valores de respuesta

El SDK automáticamente envuelve un `value` de tipo string en una lista. Ambas formas son equivalentes:

```python
{"key": "comment", "value": "Gran producto"}
{"key": "comment", "value": ["Gran producto"]}
```

Siempre puedes pasar una lista directamente si necesitas múltiples valores para una clave.

## Listar todas las submissions

```python
feedbacks = client.feedbacks.get()
```

Filtra los resultados con un dict estilo LoopBack (ver [Consultas](/es/python-sdk/guides/querying/)):

```python
feedbacks = client.feedbacks.get({
    "where": {"companyId": "TU_COMPANY_ID"},
    "limit": 50,
})
```

## Obtener una submission por ID

```python
feedback = client.feedbacks.get_id("feedback-uuid-aqui")
```

## Actualizar una submission

```python
updated = client.feedbacks.update("feedback-uuid-aqui", {
    "name": "Etiqueta actualizada",
})
```

Solo se cambian los campos que pasas; el resto permanece sin cambios.

## Eliminar una submission

```python
client.feedbacks.delete("feedback-uuid-aqui")
```

:::caution
La eliminación es permanente. La API no soporta soft deletes.
:::

---
title: Consultas
description: Usa dicts de filtro estilo LoopBack para consultar, paginar y dar forma a los resultados de cualquier método de lista del SDK.
---

Cada método `.get()` del SDK acepta un dict `filter` opcional. El filtro sigue la sintaxis de consulta LoopBack utilizada por la API de MagicFeedback.

## Estructura básica

```python
filter = {
    "where": {…},
    "limit": 50,
    "skip": 0,
    "order": "createdAt DESC",
    "fields": {…},
    "include": […],
}
```

Todas las claves son opcionales. Pasa solo las que necesitas.

## Filtrar por valor de campo

```python
contacts = client.contacts.get({
    "where": {
        "companyId": "TU_COMPANY_ID",
    }
})
```

Múltiples condiciones en `where` se combinan como AND:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "companyId": "TU_COMPANY_ID",
        "type": "APP",
    }
})
```

## Paginación

Usa `limit` y `skip` para requests paginados:

```python
page_1 = client.feedbacks.get({"limit": 20, "skip": 0})
page_2 = client.feedbacks.get({"limit": 20, "skip": 20})
```

## Ordenamiento

```python
feedbacks = client.feedbacks.get({
    "order": "createdAt DESC",
    "limit": 10,
})
```

## Seleccionar campos específicos

Retorna solo los campos que necesitas para reducir el tamaño del payload:

```python
contacts = client.contacts.get({
    "fields": {
        "id": True,
        "email": True,
    }
})
```

## Combinando condiciones

```python
result = client.feedbacks.get({
    "where": {"companyId": "TU_COMPANY_ID"},
    "order": "createdAt DESC",
    "limit": 50,
    "skip": 0,
})
```

:::tip
El objeto `where` se pasa como parámetro de consulta JSON a la API. Se soportan condiciones anidadas complejas (operadores `and`/`or` de LoopBack) siempre que el endpoint de la API los acepte.
:::

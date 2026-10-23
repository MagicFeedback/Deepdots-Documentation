---
title: Consultas
description: Usa dicts de filtro estilo LoopBack para consultar, paginar y dar forma a los resultados de cualquier método de lista del SDK.
---

Cada método `.get()` del SDK acepta un dict `filter` opcional. El filtro sigue la sintaxis de consulta LoopBack utilizada por la API de Deepdots.

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

## Rangos de fechas

Usa el operador `between` de LoopBack para seleccionar registros dentro de una ventana temporal. Pasa timestamps ISO 8601:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "createdAt": {"between": ["2026-07-01T00:00:00Z", "2026-07-01T23:59:59.999Z"]},
    }
})
```

Los operadores de rango `gt`, `gte`, `lt` y `lte` funcionan igual para ventanas abiertas:

```python
feedbacks = client.feedbacks.get({
    "where": {"createdAt": {"gte": "2026-07-01T00:00:00Z"}},
})
```

:::caution
Usa un solo operador por condición. La API solo aplica el primer operador de una condición, así que `{"createdAt": {"gte": ..., "lt": ...}}` ignora `lt` sin avisar y retorna todo desde la primera fecha en adelante. Para acotar una ventana por ambos lados, usa `between`, o pon cada límite en su propia condición dentro de `and`, como se muestra más abajo.
:::

### Filtrar feedback por la fecha en que ocurrió

`createdAt` es el momento en que la API recibió un registro. Para el feedback que viene de otro sistema, la fecha que importa — la que muestra el panel — es `externalGeneratedAt` (ver [Campos del sistema de origen](/es/python-sdk/guides/feedback/#campos-del-sistema-de-origen)). Fíltralo con un rango semiabierto de fechas simples: `gte` el primer día y `lt` el día siguiente al último, cada uno en su propia condición dentro de `and`:

```python
feedbacks = client.feedbacks.get({
    "where": {"and": [
        {"externalGeneratedAt": {"gte": "2026-09-01"}},
        {"externalGeneratedAt": {"lt": "2026-10-01"}},
    ]},
    "order": "externalGeneratedAt DESC",
})
```

`externalGeneratedAt` se almacena como texto, así que los límites se comparan como strings. Las fechas en el formato recomendado (`2026-09-30T12:00:00.000Z`) se ordenan cronológicamente, y el rango anterior retorna todas las del 1 al 30 de septiembre, en días UTC.

:::caution
Para `externalGeneratedAt`, usa fechas simples, como en el ejemplo anterior. Si usas timestamps, escríbelos exactamente en el mismo formato que tus valores almacenados: como texto, un límite como `2026-09-01T00:00:00Z` se ordena después de `2026-09-01T00:00:00.500Z`, así que ese valor quedaría fuera. No uses desfases de zona horaria como `+02:00`: también se comparan como texto plano.
:::

:::caution
El SDK pone el filtro en la URL sin codificarlo, así que algunos caracteres de los valores de filtro se interpretan mal: `+` se convierte en un espacio, `&` y `#` cortan el filtro (HTTP 400), y `%` seguido de dos dígitos hexadecimales se decodifica. En esos casos, el request no encuentra nada, encuentra registros equivocados o falla. Un `]` seguido directamente de `=` (como en una URL que contiene `ids[]=4`) hace que la API ignore todo el filtro y devuelva todos los feedbacks que puedes ver. Escapa estos caracteres como se muestra en [Buscar un feedback por su ID de origen](#buscar-un-feedback-por-su-id-de-origen).
:::

## Buscar un feedback por su ID de origen

Filtra por `external_id` para encontrar el feedback creado a partir de un registro de tu propio sistema:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "integrationId": "TU_INTEGRATION_ID",
        "external_id": {"inq": ["48213", "48214"]},
    },
    "fields": {"id": True, "external_id": True, "externalGeneratedAt": True},
})
```

Si tienes una lista larga de IDs, búscalos en lotes (por ejemplo, de 100 en 100) para mantener corta la URL. Si tus IDs pueden contener `%`, `+`, `&`, `#` o `=`, escapa primero esos caracteres (ver el aviso de precaución anterior):

```python
def filter_value(value: str) -> str:
    """Escapa los caracteres que, de otro modo, se interpretarían mal en la URL del filtro."""
    return value.replace("%", "%25").replace("+", "%2B").replace("&", "%26").replace("#", "%23").replace("=", "%3D")

feedbacks = client.feedbacks.get({
    "where": {
        "integrationId": "TU_INTEGRATION_ID",
        "external_id": {"inq": [filter_value(i) for i in ["+4512345678", "R&D-17"]]},
    },
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

Pasa `order` de forma explícita: sin él, los resultados no se retornan en orden de fecha. Usa `"externalGeneratedAt DESC"` para listar el feedback por la fecha en que ocurrió y no por la fecha en que se recibió. Cuando pagines, agrega `id` como criterio de desempate — `"order": ["externalGeneratedAt DESC", "id ASC"]` — porque muchos feedbacks pueden compartir la misma fecha, y las páginas ordenadas solo por ella pueden repetir u omitir registros.

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

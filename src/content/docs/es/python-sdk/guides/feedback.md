---
title: Gestión de Feedback
description: Crea, lee, actualiza y elimina submissions de feedback con el SDK Python de Deepdots.
---

Las submissions de feedback son el recurso principal en Deepdots. Cada submission registra un conjunto de respuestas para una integración y producto específicos.

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
    "integrationId": "TU_INTEGRATION_ID",
    "companyId": "TU_COMPANY_ID",
    "productId": "TU_PRODUCT_ID",
    # Opcional: de dónde viene el feedback (ver "Campos del sistema de origen" más abajo)
    "external_id": "48213",
    "externalGeneratedAt": "2026-10-06T11:00:00.000Z",
})
print(feedback["id"])
```

El SDK envía el dict como cuerpo JSON de `POST /feedbacks` con los nombres de clave exactamente como los escribiste, así que todos los campos van en el nivel superior. Los campos opcionales, como `external_id` y `externalGeneratedAt`, van junto a `integrationId` y `companyId`, no dentro de `answers` ni de `metadata`.

### Campos requeridos

| Campo | Tipo | Descripción |
|---|---|---|
| `name` | string | Etiqueta legible para esta submission |
| `type` | string | Tipo de fuente: `"APP"`, `"SURVEY"` o `"DOCUMENT"` |
| `identity` | string | Identidad de la fuente — usa la identidad de la integración a la que pertenece el feedback (ej. `"MAGICFORM"`). Determina si el feedback se analiza y cómo |
| `integrationId` | string | UUID de la integración a la que pertenece este feedback |
| `companyId` | string | Tu identificador de empresa |
| `productId` | string | El producto con el que se asocia este feedback |

Los valores de `type` y de `identity` van en mayúsculas; cualquier otra forma de escribirlos se rechaza. Con algunos valores aceptados de `identity`, el feedback no se analiza en absoluto, así que no elijas un valor solo porque lleve el nombre de tu herramienta de origen. La identidad también determina qué se analiza: con identidades de encuesta como `MAGICFORM`, `MAGICSURVEY` y `CSV` se analiza `answers`, mientras que con la mayoría de las demás, como `GENERAL` y `CUSTOM`, solo se analiza `text`. Si no sabes cuál es la identidad de tu integración, pregúntale a tu contacto de Deepdots.

### Campos opcionales

| Campo | Tipo | Descripción |
|---|---|---|
| `answers` | Answer[] | Respuestas como pares `{"key": …, "value": [...]}`. `key` es el `ref` de la pregunta (ver `integrations_questions.get()`) |
| `text` | string | Texto libre del feedback — ej. una reseña o una conversación de soporte |
| `metadata` | Metadata[] | Entradas clave/valor personalizadas (ver [Actualizar métricas y metadatos](#actualizar-métricas-y-metadatos)) |
| `metrics` | Metric[] | Valores de métricas con nombre |
| `crmContactId` | string | ID del contacto CRM que dio el feedback. El contacto debe pertenecer a la misma empresa |
| `external_id` | string | ID del registro en el sistema de origen. Reenviarlo para la misma empresa, producto e integración retorna el feedback existente en lugar de un duplicado |
| `externalGeneratedAt` | string | Cuándo se creó el feedback en el sistema de origen — la fecha que usa el panel. UTC ISO 8601 terminado en `Z`; por defecto, la hora del request. Ver [La fecha del feedback](#la-fecha-del-feedback-externalgeneratedat) |
| `externalUpdatedAt` | string | Cuándo se modificó el registro por última vez en el sistema de origen |
| `externalUrl` | string | Enlace al registro original |

Los nombres de campo distinguen entre mayúsculas y minúsculas. `external_id` es el único campo en snake_case; todos los demás están en camelCase (es `companyId`, no `company_id`). La API rechaza cualquier clave que no conozca: una clave desconocida o mal escrita, como `externalId`, hace fallar todo el request con HTTP 422, y no se crea nada. Lo mismo ocurre si envías `status` o `createdAt`, que define la propia API. Una clave requerida mal escrita, como `company_id`, se detecta antes de enviar nada: `create()` lanza `ValueError: Missing required field: companyId`. Ver [Manejo de errores](/es/python-sdk/reference/api/#manejo-de-errores).

### Envoltura de valores de respuesta

El SDK automáticamente envuelve un `value` de tipo string en una lista. Ambas formas son equivalentes:

```python
{"key": "comment", "value": "Gran producto"}
{"key": "comment", "value": ["Gran producto"]}
```

Siempre puedes pasar una lista directamente si necesitas múltiples valores para una clave.

Los valores de las respuestas deben ser strings: envía `"9"`, no `9`. Un valor numérico se acepta al crear el feedback, pero después el feedback nunca se analiza.

## Campos del sistema de origen

Usa estos campos opcionales cuando el feedback venga de otro sistema — un helpdesk, un sitio de reseñas, una herramienta de encuestas o una exportación CSV. Registran cuándo ocurrió realmente el feedback y permiten reenviarlo de forma segura. Los cuatro son strings y van en el nivel superior del payload.

### La fecha del feedback: `externalGeneratedAt`

`externalGeneratedAt` es la fecha que usan el panel, los reportes y los filtros de fecha para un feedback. En el panel, es la columna **Fecha** de la lista de feedback; *Agregado en*, en los detalles de un feedback, es el momento en que la API lo recibió (`createdAt`). Los gráficos y reportes cuentan los días en UTC.

Si lo omites, la API usa el momento en que recibió el request, así que el feedback histórico que importes sin este campo aparece en el día de la importación. Para corregir el feedback que ya hayas importado, consulta [Corregir la fecha de un feedback existente](#corregir-la-fecha-de-un-feedback-existente).

Envíalo como un **string ISO 8601 en UTC terminado en `Z`**, por ejemplo `"2026-10-06T11:00:00.000Z"` — el formato que genera `toISOString()` de JavaScript. También funciona un valor con segundos pero sin milisegundos (`"2026-10-06T11:00:00Z"`).

La API guarda el string exactamente como lo envías y no comprueba su formato. Otros formatos se guardan igualmente, pero la analítica no puede leer la mayoría de ellos, así que el feedback desaparece de los gráficos y reportes filtrados por fecha. Eso incluye un desfase de zona horaria como `+02:00`, una fecha sin hora, un espacio en lugar de la `T` y más de seis dígitos después del punto decimal (como `.1234567Z` en .NET o `.123456789Z` en Java).

Pasa un string. El SDK no puede serializar un objeto `datetime` (lanza `TypeError`), y la API rechaza un número o `None` con HTTP 422. Convierte los datetimes así:

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo  # Python 3.9+; en Windows ejecuta también: pip install tzdata

def to_api_datetime(dt: datetime) -> str:
    """Formatea un datetime con zona horaria como UTC ISO 8601 con milisegundos y una Z final."""
    if dt.utcoffset() is None:
        raise ValueError("Datetime sin zona horaria: asigna primero la zona horaria de origen, ej. dt.replace(tzinfo=ZoneInfo('Europe/Copenhagen'))")
    return dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")

to_api_datetime(datetime(2026, 10, 6, 13, 0, tzinfo=ZoneInfo("Europe/Copenhagen")))
# '2026-10-06T11:00:00.000Z'
```

:::caution
Para un datetime en UTC, el `isoformat()` por defecto de Python genera `2026-10-06T11:00:00+00:00`, que la analítica no puede leer. Usa la función auxiliar de arriba, que rechaza los datetimes sin zona horaria. Si tus datetimes no tienen zona horaria, asígnales primero la zona del sistema de origen — `dt.replace(tzinfo=ZoneInfo("Europe/Copenhagen"))` — porque `astimezone()` interpretaría un datetime sin zona horaria como la hora local de la máquina que ejecuta el código.
:::

### `externalUpdatedAt` y `externalUrl`

- `externalUpdatedAt` — cuándo cambió el registro por última vez en el sistema de origen. Usa el mismo formato que `externalGeneratedAt`. Si lo omites, la API usa la hora del request.
- `externalUrl` — un enlace al registro original, que el panel muestra como el enlace *Fuente original* del feedback. Usa una URL absoluta `https://`.

### Reenviar de forma segura: `external_id`

`external_id` es tu identificador del registro en el sistema de origen. Envíalo como string — `"48213"`, no `48213`.

Cuando creas un feedback cuyo `external_id` ya existe para la misma empresa, producto e integración, la API no crea un duplicado. Retorna el feedback **existente**, sin cambios, con la misma respuesta de éxito que uno nuevo. Esto hace que los reintentos sean seguros.

También significa que reenviar un feedback nunca lo actualiza, ni siquiera su fecha. Para cambiar un feedback que ya existe, usa [`update()`](#actualizar-una-submission). La respuesta es igual para un feedback nuevo que para uno existente; para detectar uno existente — por ejemplo, cuando repites una importación después de agregar las fechas — compara el `externalGeneratedAt` retornado con el que enviaste.

Los feedbacks enviados sin `external_id` nunca se deduplican: reintentar el request crea una segunda copia. Envía los reintentos de un mismo `external_id` uno tras otro y no en paralelo, porque dos requests simultáneos pueden crear un feedback cada uno.

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

Pasa un filtro como segundo argumento para dar forma a los campos devueltos:

```python
feedback = client.feedbacks.get_id("feedback-uuid-aqui", {"fields": {"answers": True}})
```

## Actualizar una submission

```python
client.feedbacks.update("feedback-uuid-aqui", {
    "name": "Etiqueta actualizada",
})
```

Solo se cambian los campos que pasas; el resto permanece sin cambios. `update()` retorna un dict vacío (`{}`), porque la API responde `204 No Content`. Llama a `get_id()` si necesitas el feedback actualizado.

Algunos campos no se pueden cambiar una vez que el feedback existe: `external_id`, `type`, `identity`, `integrationId`, `productId`, `profile` y `data`. Enviar cualquiera de ellos hace fallar todo el request con HTTP 422. Envía solo los campos que estás cambiando, no un objeto completo leído con `get_id()`.

`update()` necesita un usuario de la API cuyo rol permita actualizar feedback. Si tu usuario puede crear feedback pero no actualizarlo, la llamada falla con HTTP 405 (ver [Manejo de errores](/es/python-sdk/reference/api/#manejo-de-errores)); pide a tu contacto de Deepdots que cambie el rol del usuario.

### Volver a ejecutar el análisis

La actualización se guarda de inmediato, pero los gráficos y reportes solo reflejan los cambios en la fecha, `text`, `answers`, `metrics` o `metadata` después de que el feedback se analice de nuevo. Agrega `"status": "REGISTERED"` a la misma llamada para poner en cola un nuevo análisis. Un nuevo análisis es una ejecución completamente nueva:

- El resumen, los problemas y los temas se generan de nuevo y pueden diferir de la ejecución anterior. Cualquier estado o prioridad que hayas asignado a los problemas del feedback se reinicia.
- El feedback pasa por `PROCESSING` y normalmente vuelve a terminar en `DONE` — comprueba su `status` con `get_id()`. Una vez en `DONE`, los gráficos y reportes pueden tardar hasta una hora en reflejar por completo el cambio. Si termina en `PARTIAL` o `ERROR`, los gráficos siguen mostrando la versión anterior: vuelve a enviar la misma actualización.
- Las automatizaciones que se ejecutan cuando un feedback termina de procesarse se vuelven a ejecutar.

Envía `"status": "REGISTERED"` solo cuando el feedback haya terminado de procesarse: si lo envías mientras el feedback sigue en `REGISTERED` o `PROCESSING`, se inicia un segundo análisis. Si algunos feedbacks siguen en `REGISTERED` o `PROCESSING` mucho después de que los demás hayan terminado, probablemente no se están analizando en absoluto (por ejemplo, porque el valor de una respuesta es un número o porque tienen una `identity` que no se analiza); consulta a tu contacto de Deepdots en lugar de volver a enviarlos. Cualquier actualización de un feedback en estado `DONE` también vuelve a ejecutar esas automatizaciones, incluso sin `status`. Si necesitas volver a analizar muchos feedbacks, habla con tu contacto de Deepdots antes de empezar.

### Corregir la fecha de un feedback existente

Reenviar un feedback no lo modifica (ver [Reenviar de forma segura](#reenviar-de-forma-segura-external_id)), así que corrige una fecha ausente o incorrecta con `update()`. Incluye `"status": "REGISTERED"` para que el feedback se analice de nuevo y los gráficos y reportes lo muevan a la nueva fecha (ver [Volver a ejecutar el análisis](#volver-a-ejecutar-el-análisis)):

```python
client.feedbacks.update("feedback-uuid-aqui", {
    "externalGeneratedAt": "2026-10-06T11:00:00.000Z",
    "status": "REGISTERED",
})
```

Para corregir muchos feedbacks, búscalos por tus propios IDs (ver [Buscar un feedback por su ID de origen](/es/python-sdk/guides/querying/#buscar-un-feedback-por-su-id-de-origen)) y actualiza cada uno:

```python
# Fechas correctas, con tus propios IDs como claves (UTC ISO 8601 terminado en Z)
dates = {
    "48213": "2024-05-01T10:00:00.000Z",
    "48214": "2024-05-02T08:30:00.000Z",
}

found = client.feedbacks.get({
    "where": {
        "integrationId": "TU_INTEGRATION_ID",
        "external_id": {"inq": list(dates)},
    },
    "fields": {"id": True, "external_id": True, "status": True, "externalGeneratedAt": True},
})

for fb in found:
    new_date = dates[fb["external_id"]]
    if fb["status"] in ("REGISTERED", "PROCESSING"):
        continue  # todavía se está analizando: vuelve a ejecutar el script más tarde
    if fb["status"] in ("DONE", "EMPTY") and fb["externalGeneratedAt"] == new_date:
        continue  # ya está corregido
    client.feedbacks.update(fb["id"], {
        "externalGeneratedAt": new_date,
        "status": "REGISTERED",
    })
```

Puedes volver a ejecutar el script, que omite los feedbacks ya corregidos y vuelve a enviar aquellos cuyo análisis terminó en `PARTIAL` o `ERROR`. Si tienes una lista larga de IDs, búscalos en lotes (por ejemplo, de 100 en 100) para mantener corta la URL del request. Si tus IDs contienen `%`, `+`, `&`, `#` o `=`, revisa [Consultas](/es/python-sdk/guides/querying/#buscar-un-feedback-por-su-id-de-origen). Un feedback importado sin fecha tiene un `externalGeneratedAt` que coincide con su `createdAt` con una diferencia de, como mucho, unos pocos milisegundos. No envíes un `externalGeneratedAt` vacío a `update()`: a diferencia de `create()`, `update()` lo guarda tal cual, y entonces el feedback desaparece de los gráficos y reportes filtrados por fecha.

## Actualizar métricas y metadatos

Además de los campos principales, una submission puede llevar **métricas** (valores con nombre, como una puntuación o un canal) y **metadatos** (entradas clave/valor personalizadas). Puedes enviar ambos con `create()`. Una vez que el feedback existe, cámbialos con `update()`, pasando la lista completa que quieres almacenar: lee primero los valores actuales, modifícalos y vuelve a escribirlos para no perder entradas que quieras conservar.

```python
from datetime import datetime, timedelta, timezone

# Obtén los feedbacks a enriquecer — ej. todo lo recibido ayer (UTC)
today = datetime.now(timezone.utc).date()
yesterday = today - timedelta(days=1)
feedbacks = client.feedbacks.get({
    "where": {"createdAt": {"gte": f"{yesterday}T00:00:00.000Z", "lt": f"{today}T00:00:00.000Z"}},
})

for fb in feedbacks:
    if fb["status"] in ("REGISTERED", "PROCESSING"):
        continue  # todavía se está analizando: inténtalo de nuevo más tarde

    metrics = [m for m in (fb.get("metrics") or []) if m["key"] != "nps"]
    metrics.append({"key": "nps", "value": ["9"]})

    metadata = [m for m in (fb.get("metadata") or []) if m["key"] != "source"]
    metadata.append({"key": "source", "value": ["crm-import"]})

    # Una sola llamada por feedback, para que se analice solo una vez
    client.feedbacks.update(fb["id"], {
        "metrics": metrics,
        "metadata": metadata,
        "status": "REGISTERED",
    })
```

| Campo | Shape | Descripción |
|---|---|---|
| `metrics` | `[{"key": str, "value": [str]}]` | Valores de métricas con nombre |
| `metadata` | `[{"key": str, "value": [str]}]` | Metadatos clave/valor personalizados |
| `status` | string | `"REGISTERED"` pone en cola un nuevo análisis, para que el cambio llegue a los gráficos y reportes (ver [Volver a ejecutar el análisis](#volver-a-ejecutar-el-análisis)) |

Envía los valores como strings — `["9"]`, no `[9]`. Los nombres y valores de las métricas se convierten a minúsculas en los reportes.

:::tip
`update()` reemplaza la lista completa de `metrics` (o `metadata`) — no fusiona entradas individuales. Empieza siempre desde la lista existente, como arriba, para conservar los valores que no estás cambiando.
:::

## Eliminar una submission

```python
client.feedbacks.delete("feedback-uuid-aqui")
```

Si tiene éxito, retorna un dict vacío (`{}`).

:::caution
El SDK no puede deshacer una eliminación. El feedback se retira (su estado pasa a ser `DEPRECATED`) y se oculta de `get_id()`, el panel y los reportes, y de `get()` salvo que filtres por `status`. Si después creas un feedback con el mismo `external_id`, se crea un feedback nuevo en lugar de restaurar el anterior.
:::

## Adjuntar un archivo

Adjunta un archivo a una submission existente. El archivo se envía como una carga multipart.

```python
attachment = client.feedbacks.upload_attachment(
    "feedback-uuid-aqui",
    file_path="/ruta/al/reporte.pdf",
)
```

Pasa argumentos opcionales para controlar el nombre de visualización y adjuntar metadatos adicionales:

```python
attachment = client.feedbacks.upload_attachment(
    "feedback-uuid-aqui",
    file_path="/ruta/al/reporte.pdf",
    filename="reporte-q3.pdf",
    extra_data={"fuente": "crm", "año": 2026},
)
```

| Parámetro | Tipo | Descripción |
|---|---|---|
| `feedback_id` | string | ID del feedback al que adjuntar el archivo |
| `file_path` | string | Ruta absoluta o relativa al archivo en disco |
| `filename` | string \| None | Nombre de visualización en el panel — por defecto el nombre del archivo |
| `extra_data` | dict \| None | Cualquier dict JSON-serializable almacenado junto al adjunto |

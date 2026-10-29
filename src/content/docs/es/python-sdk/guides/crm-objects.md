---
title: Objetos CRM
description: Guarda tickets, partidos, membresías y otros registros junto a tus contactos con el SDK Python de Deepdots, y vincula a ellos las respuestas de encuestas.
---

Además de los [contactos](/es/python-sdk/guides/contacts/), tu CRM puede contener cualquier otro registro por el que quieras analizar el feedback: tickets, partidos, membresías, pedidos, etc. Cada uno es un **objeto CRM**:

- un `type`, como `ticket` o `match`;
- tu propio id para él, `externalId`;
- un objeto `data` con los campos que quieras.

Un objeto puede pertenecer a un contacto (`contactKey`) y a otro objeto (`parentType` + `parentKey`). Por ejemplo, un ticket pertenece a un aficionado y a un partido. Cuando un enlace de encuesta indica un objeto, cada respuesta dada a través de ese enlace recibe la información de ese objeto. Ver [Vincular respuestas de encuesta a objetos](#vincular-respuestas-de-encuesta-a-objetos).

Disponible a partir del SDK 1.0.23, como `client.crm`.

## Guardar objetos

```python
result = client.crm.upsert_objects("match", [
    {
        "externalId": "8449",
        "startsAt": "2026-10-18T16:00:00Z",
        "sourceUpdatedAt": "2026-10-07T00:00:00Z",
        "data": {"name": "F.C. København - AGF", "venue": "Parken"},
    },
])
print(result)  # {"count": 1, "created": 1, "updated": 0, "failed": []}
```

`upsert_objects(object_type, items)` crea cada objeto, o actualiza el de ese tipo que tenga el mismo `externalId`.

| Campo | Tipo | Descripción |
|---|---|---|
| `externalId` | string o número | **Obligatorio.** Tu id para el objeto, único por tipo (hasta 255 caracteres) |
| `status` | string | Cualquier estado que uses, como `active` o `cancelled` |
| `contactKey` | string | El `externalId` del contacto al que pertenece el objeto |
| `parentType`, `parentKey` | string | El tipo y el `externalId` del objeto al que pertenece este, ej. `"match"` y `"8449"` |
| `startsAt`, `endsAt` | string | Fechas ISO 8601, ej. cuándo empieza un partido o cuándo termina una membresía |
| `sourceUpdatedAt` | string | Cuándo cambió el registro por última vez en tu sistema (ver más abajo) |
| `data` | dict | Cualquier otro campo |

- **Los campos que omites conservan su valor guardado**, y `data` se fusiona clave por clave.
- **Las fechas** son una fecha ISO 8601 (`2026-10-18`) o una fecha y hora con zona horaria (`2026-10-18T16:00:00Z` o `+02:00`). Una fecha y hora sin zona se rechaza, para que el servidor nunca tenga que adivinar su zona.
- **Con `sourceUpdatedAt`**, un elemento más antiguo que el objeto guardado solo rellena los campos que están vacíos, así que los elementos pueden llegar en cualquier orden. **Sin él**, gana el último elemento enviado.
- **Los tipos de objeto** usan letras minúsculas, dígitos y `_`, empiezan por una letra y no pueden ser `contact`.
- **Tamaño:** cada elemento puede ocupar hasta 64 KB.

## Leer objetos

```python
tickets = client.crm.get_objects("ticket", contact_key="1058531")
```

`get_objects(object_type, ...)` retorna los objetos de un tipo, ordenados por `externalId`. Los objetos eliminados nunca se retornan. Cada filtro busca una coincidencia exacta:

| Argumento | Coincide con |
|---|---|
| `external_id` | `externalId` |
| `status` | `status` |
| `contact_key` | `contactKey` |
| `parent_type`, `parent_key` | `parentType`, `parentKey` |

Los resultados llegan en páginas de `limit` objetos (100 por defecto, como máximo 1000). Para obtener la página siguiente, pasa el último `externalId` que recibiste como `after`:

```python
after = None
while True:
    page = client.crm.get_objects("match", limit=1000, after=after)
    if not page:
        break
    for match in page:
        print(match["externalId"], match["data"].get("name"))
    after = page[-1]["externalId"]
```

## Lotes, reintentos y errores

Estas reglas se aplican a todos los métodos de `client.crm`:

- **Listas de cualquier longitud.** Pasa una lista de cualquier longitud, o un solo registro como dict. El SDK envía 500 registros por request y retorna los totales de todos los requests.
- **Fallos por registro.** Un registro que la API no puede guardar aparece en `failed` con su `index` en la lista que pasaste, y los demás registros se guardan igualmente. Si uno no es un dict, `upsert_objects()` lanza `ValueError` antes de enviar nada.
- **Tamaño del request.** Un request debe quedar por debajo del límite de 1 MB de la API; 500 registros normales quedan muy por debajo. Para registros grandes, pasa un `chunk_size` más pequeño.
- **Reenvíos automáticos.** Un request que falla de forma temporal (502, 503 o 504, un error de conexión o ninguna respuesta en 300 segundos) se reenvía hasta 3 veces, tras 2, 4 y 8 segundos. Si el token ha caducado, el cliente vuelve a iniciar sesión una vez y reenvía el request.
- **Errores.** Si un request sigue fallando, la llamada lanza una `requests.RequestException`: `HTTPError` para una respuesta de error, `ConnectionError` o `Timeout` para la red. Los requests enviados antes ya se han aplicado.
- **Sin duplicados.** Reenviar registros nunca crea duplicados, porque se identifican por su propio id. Tras un fallo, reenvía la misma lista enseguida.

```python
import requests

try:
    result = client.crm.upsert_objects("match", matches)
except requests.RequestException as e:
    print("No enviado, inténtalo de nuevo:", e)
```

## Conectores

Un conector recibe los registros de otro sistema exactamente como los genera ese sistema, y los convierte en contactos y objetos en Deepdots. No tienes que transformar nada. Los conectores se configuran para los sistemas de un cliente concreto, así que pregunta a tu contacto de Deepdots si quieres uno para los tuyos.

### Usuarios de FCK

```python
result = client.crm.sync_fck_users(users)
# {"count": 1, "created": 1, "updated": 0, "failed": []}
```

Cada objeto de usuario de FCK se convierte en un contacto.
- **Coincidencia:** los usuarios se identifican primero por `roboticket_id` y después por email, así que la primera carga y los cambios posteriores son la misma llamada. Cada usuario necesita un email.
- **Gana la última versión:** nunca envíes una exportación más antigua después de cambios más recientes.
- **Fallos:** cada entrada de `failed` tiene el `index` del usuario, su `id` de FCK y el `error`.

### Roboticket

```python
result = client.crm.ingest_roboticket(lines)
# {"count": 2, "applied": 2, "ignored": 0, "failed": []}
```

- **Qué actualiza una línea:** cada línea actualiza su ticket o membresía y el partido o producto al que pertenece.
- **Devoluciones y transferencias:** se gestionan ambas. Un ticket cancelado sigue cancelado, y una línea más antigua nunca sobrescribe una más reciente.
- **`AccessToken`:** el campo se descarta y nunca se guarda.
- **`ignored`:** cuenta las líneas que no son ni una venta ni una devolución. Solo se conservan en el log.

## Vincular respuestas de encuesta a objetos

Puedes vincular una respuesta de encuesta a un objeto agregando al enlace un parámetro de URL con el nombre del tipo del objeto y su `externalId` como valor:

```text
https://<tu enlace de encuesta>?ticket=21522673
```

Cada respuesta dada a través de ese enlace recibe la información del objeto como datos de la encuesta: para un ticket, por ejemplo, la grada, el partido y las membresías del aficionado. Después puedes filtrar los resultados por ella. Si el feedback aún no está vinculado a un contacto, también se vincula al contacto al que pertenece el objeto. Deepdots configura, para cada empresa, qué tipos de objeto aportan información de esta forma y qué campos de esos objetos se convierten en datos de la encuesta. Un enlace que indica un tipo de objeto no configurado solo registra el id del objeto.

Una empresa también puede exigir un parámetro de **verificación** que solo lleva el enlace de la persona correcta, por ejemplo el id del propietario en tu plataforma de email:
- **La verificación coincide con el propietario del objeto:** la respuesta recibe la información del objeto.
- **La verificación pertenece a otra persona** (el enlace se modificó): la encuesta muestra una página de "enlace no válido".
- **Falta la verificación, o el propietario aún no está sincronizado:** la encuesta sigue funcionando, y la respuesta se guarda sin la información del objeto.

:::tip
Carga los contactos y los objetos antes de enviar los enlaces de la encuesta. Una respuesta recibe la información de un objeto cuando se analiza, poco después de enviarse, así que si el objeto llega más tarde, la respuesta no la tendrá.
:::

---
title: Referencia de la API
description: Referencia completa de cada clase y método público del SDK Python de Deepdots.
---

## Deepdots

El punto de entrada principal. Importa e instancia una vez; reutiliza el cliente en toda tu aplicación.

```python
from deepdots_sdk import Deepdots

client = Deepdots(
    user="tu@ejemplo.com",
    password="tu-contraseña",
    base_url="https://api.magicfeedback.io",  # opcional
)
```

### Parámetros del constructor

| Parámetro | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `user` | string | — | Correo de la cuenta |
| `password` | string | — | Contraseña de la cuenta |
| `base_url` | string | `"https://api.magicfeedback.io"` | URL raíz de la API |
| `auth_source` | string | `"datastore"` | De dónde sale el token. Pasa `"identity"` para iniciar sesión con `user` y `password`, que es lo que necesitas fuera del propio Google Cloud de Deepdots. El valor por defecto busca primero un token cacheado en el Google Cloud Datastore de Deepdots e inicia sesión con `user` y `password` cuando no lo hay |

El constructor inicia sesión de inmediato. Un token dura aproximadamente una hora.

### Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| `feedbacks` | `FeedbackAPI` | Operaciones de submissions de feedback |
| `contacts` | `ContactsAPI` | Operaciones de contactos CRM |
| `campaigns` | `CampaignsAPI` | Operaciones de campañas y sesiones |
| `products` | `ProductsAPI` | Listado de productos |
| `metrics` | `MetricsAPI` | Recuperación de métricas |
| `integrations_questions` | `IntegrationsQuestionsAPI` | Preguntas para una integración |
| `reports` | `ReportsAPI` | Endpoints de reportes |
| `crm` | `CrmAPI` | Objetos CRM y conectores (SDK 1.0.23) |
| `companies` | `CompaniesAPI` | Listado de empresas |
| `requests` | `RequestsAPI` | Solicitudes de investigación |
| `signals` | `SignalsAPI` | Signals |

### Métodos

#### `set_logging(level)`

Configura el logger interno del SDK.

```python
import logging
client.set_logging(logging.DEBUG)
```

#### `refresh_token()`

Obtiene un token nuevo (con el mismo `auth_source`) y actualiza todas las sub-APIs sin recrearlas. Llámalo en un proceso de larga duración cuando los requests empiecen a fallar con 401. `client.crm` lo hace por sí solo.

---

## FeedbackAPI

Acceso via `client.feedbacks`.

### `create(feedback)`

Comprueba que las claves requeridas estén presentes (lanza `ValueError` si falta alguna), envuelve en una lista cada `value` que no sea una lista (ver [Envoltura de valores de respuesta](/es/python-sdk/guides/feedback/#envoltura-de-valores-de-respuesta)) y envía `feedback` como cuerpo JSON de `POST /feedbacks` con tus claves sin cambios. Retorna el objeto de feedback creado. Si `external_id` coincide con un feedback que ya existe para la misma empresa, producto e integración y que no se ha eliminado, retorna en su lugar ese feedback existente, sin cambios. Ver [Gestión de Feedback](/es/python-sdk/guides/feedback/).

### `get(filter=None)`

Retorna una lista de objetos de feedback.

### `get_id(feedback_id, filter=None)`

Retorna un único objeto de feedback.

### `update(feedback_id, feedback)`

Envía `PATCH /feedbacks/{feedback_id}` solo con los campos que pasas. Retorna un dict vacío (`{}`), porque la API responde `204 No Content`. Incluye `"status": "REGISTERED"` para que el feedback se analice de nuevo (ver [Volver a ejecutar el análisis](/es/python-sdk/guides/feedback/#volver-a-ejecutar-el-análisis)).

### `update_metadata_batch(items, mode=None)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `items` | list | `[{"feedbackId": str, "metadata": [{"key": str, "value": [str]}]}]` |
| `mode` | string \| None | `"append"` agrega los valores a los que ya tiene una clave; por defecto se reemplazan (SDK 1.0.22) |

Agrega o sobrescribe las claves de metadatos que envías en muchos feedbacks con un solo request, conserva todas las demás claves y pone cada feedback en cola para un nuevo análisis. Retorna `{"feedbacks", "triggered", "failed"}`. Lanza `HTTPError` (404) y no escribe nada si algún feedback no existe o no es accesible. Ver [Agregar metadatos a muchos feedbacks a la vez](/es/python-sdk/guides/feedback/#agregar-metadatos-a-muchos-feedbacks-a-la-vez). SDK 1.0.21.

### `delete(feedback_id)`

Retira el feedback (su estado pasa a ser `DEPRECATED`, y se oculta de los reportes y de las lecturas que no filtren por `status`). Retorna un dict vacío (`{}`).

### `upload_attachment(feedback_id, file_path, filename=None, extra_data=None, max_attachments=3, check_duplicate_content=True)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `feedback_id` | string | ID del feedback al que adjuntar el archivo |
| `file_path` | string | Ruta al archivo en disco |
| `filename` | string \| None | Nombre de visualización — por defecto el nombre del archivo |
| `extra_data` | dict \| None | Dict JSON-serializable almacenado junto al adjunto |
| `max_attachments` | int | Número máximo de adjuntos que puede tener un feedback (SDK 1.0.20) |
| `check_duplicate_content` | bool | Rechaza un archivo cuyo contenido ya está adjunto (SDK 1.0.20) |

Sube el archivo como una solicitud multipart. Retorna el objeto de adjunto creado. Lanza `ValueError` sin subir nada cuando el feedback ya tiene `max_attachments` archivos, cuando el mismo contenido ya está adjunto o cuando no se pueden leer sus adjuntos.

---

## ContactsAPI

Acceso via `client.contacts`.

### `create(contact)`

Retorna el objeto de contacto creado. Ver [Contactos](/es/python-sdk/guides/contacts/).

### `get(filter=None)`

Retorna una lista de objetos de contacto.

### `update(contact_id, contact)`

Retorna el objeto de contacto actualizado.

### `upsert(contact)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `contact` | dict | Payload del contacto; `name`, `email` y `companyId` son obligatorios |

Actualiza el contacto activo de la empresa que tenga el mismo email, o crea uno. En una actualización, los campos que envías se sobrescriben y `customFields` se fusiona. Retorna el contacto. Ver [Crear o actualizar por email](/es/python-sdk/guides/contacts/#crear-o-actualizar-por-email). SDK 1.0.22.

### `upsert_batch(items, chunk_size=500)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `items` | list | Contactos, cada uno como los de `upsert()` |
| `chunk_size` | int | Contactos por request, de 1 a 500 |

Hace upsert de una lista de cualquier longitud, en requests de 500 contactos. Retorna `{"contacts", "created", "updated", "failed"}`; el `index` de cada entrada de `failed` indica su posición en `items`. SDK 1.0.22.

### `update_fields(contact_id, custom_fields=None, **native_fields)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `contact_id` | string | ID del contacto |
| `custom_fields` | dict \| None | Campos personalizados a agregar o cambiar; `None` como valor elimina ese campo |
| `**native_fields` | | Cualquiera de `name`, `lastname`, `phone`, `address`, `city`, `state`, `postalCode` |

Agrega o cambia los campos personalizados que envías y conserva los demás. Retorna `{"id", "customFields"}`. Ver [Actualizar campos personalizados](/es/python-sdk/guides/contacts/#actualizar-campos-personalizados). SDK 1.0.22.

### `delete(contact_id)`

Retorna el objeto de contacto eliminado.

---

## CrmAPI

Acceso via `client.crm`. SDK 1.0.23. Ver [Objetos CRM](/es/python-sdk/guides/crm-objects/).

Cada método envía 500 registros por request, reenvía hasta 3 veces un request que falla de forma temporal (502, 503, 504, un error de conexión o un timeout de 300 segundos) y vuelve a iniciar sesión una vez si el token ha caducado. Si un request sigue fallando, lanza una `requests.RequestException`. Los métodos de escritura retornan totales de todos los requests, y el `index` de cada entrada de `failed` indica su posición en la lista que pasaste.

### `upsert_objects(object_type, items, company_id=None, chunk_size=500)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `object_type` | string | Letras minúsculas, dígitos y `_`, ej. `"match"` |
| `items` | list | Objetos; cada uno necesita un `externalId` (ver [Guardar objetos](/es/python-sdk/guides/crm-objects/#guardar-objetos)) |
| `company_id` | string \| None | Obligatorio para cuentas de administrador (sin él, la API responde 400). Los demás usuarios escriben por defecto en su propia empresa; también pueden indicar otra empresa a la que pertenezcan, y cualquier otra empresa se rechaza con 403. Lo mismo se aplica a los demás métodos de `CrmAPI` |
| `chunk_size` | int | Registros por request, de 1 a 500 |

Retorna `{"count", "created", "updated", "failed"}`; una entrada de `failed` es `{"index", "externalId", "error"}`.

### `get_objects(object_type, company_id=None, external_id=None, status=None, parent_type=None, parent_key=None, contact_key=None, limit=None, after=None)`

Retorna una lista de objetos de un tipo, ordenados por `externalId`. Los filtros buscan coincidencias exactas. `limit` es 100 por defecto (como máximo 1000); pasa el último `externalId` que recibiste como `after` para obtener la página siguiente.

### `sync_fck_users(users, company_id=None, chunk_size=500)`

Crea o actualiza contactos a partir de objetos de usuario de FCK, enviados tal cual. Retorna `{"count", "created", "updated", "failed"}`; una entrada de `failed` es `{"index", "id", "error"}`.

### `ingest_roboticket(lines, company_id=None, chunk_size=500)`

Guarda líneas de tickets y membresías de Roboticket, enviadas tal cual. Retorna `{"count", "applied", "ignored", "failed"}`; una entrada de `failed` es `{"index", "id", "error"}`.

---

## CampaignsAPI

Acceso via `client.campaigns`.

### `create(campaign)`

Retorna el objeto de campaña creado. Ver [Campañas](/es/python-sdk/guides/campaigns/).

### `get(filter=None)`

Retorna una lista de objetos de campaña.

### `create_session(campaign_id, session)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `campaign_id` | string | ID de la campaña a la que agregar una sesión |
| `session` | dict | Payload de sesión — debe incluir `crmContactId` (string[]) |

Retorna el objeto de sesión creado.

### `get_sessions(campaign_id, filter=None)`

Retorna una lista de objetos de sesión.

### `get_sessions_feedbacks(campaign_id, filter=None)`

Retorna una lista de objetos de feedback vinculados a las sesiones de esta campaña.

---

## ProductsAPI

Acceso via `client.products`.

### `get(filter=None)`

Retorna una lista de productos registrados en tu cuenta.

---

## MetricsAPI

Acceso via `client.metrics`.

### `get(filter=None)`

Retorna una lista de objetos de métricas.

---

## IntegrationsQuestionsAPI

Acceso via `client.integrations_questions`.

### `get(integration_id, filter=None)`

Retorna la lista de preguntas configuradas para la integración indicada. Úsalo para consultar las claves de respuesta válidas antes de crear feedback: el `ref` de cada pregunta es la `key` que debes usar en `answers`.

```python
questions = client.integrations_questions.get("TU_INTEGRATION_ID")
for q in questions:
    print(q["ref"], q["type"], q["title"])
```

---

## ReportsAPI

Acceso via `client.reports`.

### `get(filter=None)`

Retorna datos de reportes generales.

### `get_newsletter(filter=None)`

Retorna datos de reportes específicos de newsletter.

### `update(report_id, report)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `report_id` | string | ID del reporte a actualizar |
| `report` | dict | Campos a cambiar |

Retorna el objeto de reporte actualizado.

### `regenerate(report_id, body=None)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `report_id` | string | ID del reporte a regenerar |
| `body` | dict \| None | Configuración de publicación opcional |

Vuelve a publicar el reporte llamando a `POST /reporting/report/{report_id}/publish`. Retorna la respuesta del endpoint de publicación.

---

## Manejo de errores

Todos los errores HTTP lanzan `requests.exceptions.HTTPError`. Envuelve las llamadas en un try/except cuando necesites manejar códigos de estado específicos:

```python
import requests

try:
    feedback = client.feedbacks.create({…})
except requests.exceptions.HTTPError as e:
    print(e.response.status_code, e.response.text)
```

La validación del lado del cliente (campos requeridos faltantes) lanza `ValueError` antes de que se envíe el request.

Los métodos de `client.crm` reenvían por sí mismos los fallos temporales (ver [CrmAPI](#crmapi)). Si siguen fallando, también pueden lanzar `requests.ConnectionError` o `requests.Timeout`, así que captura `requests.RequestException` al llamarlos.

Códigos de estado que puedes recibir:

| Código | Significado |
|---|---|
| `400` | El request está mal formado o no está permitido — por ejemplo, un valor de filtro que contiene `&` o `#` (ver [Consultas](/es/python-sdk/guides/querying/)), o un `crmContactId` de una empresa distinta a la del feedback, cuando tu usuario tiene acceso a ambas empresas (un contacto de una empresa a la que no tienes acceso retorna `404`) |
| `401` | El token falta, no es válido o ha caducado, o tu usuario está desactivado. Los tokens caducan después de aproximadamente una hora: en procesos largos, como una importación, crea un nuevo cliente (o, a partir del SDK 1.0.17, llama a `client.refresh_token()`) y vuelve a intentarlo |
| `403` | Filtraste por una empresa a la que tu usuario no tiene acceso, por ejemplo con un `companyId` incorrecto en `where` |
| `404` | Algo a lo que hace referencia el request no existe o no es visible para ti — por ejemplo, un `crmContactId`, una campaña o un reporte |
| `405` | El rol de tu usuario no permite esta operación (ej. actualizar feedback) |
| `406` | El registro no existe, fue eliminado o pertenece a una empresa a la que no tienes acceso — por ejemplo, `feedbacks.get_id()`, `update()` o `delete()` sobre un feedback así (estas llamadas retornan 406, no 404) |
| `422` | El cuerpo del request no es válido — un campo desconocido o mal escrito, un tipo incorrecto o un valor fuera de la lista permitida |

Una respuesta `422` lista todos los problemas en `details`; con el SDK, léelo desde la excepción como `e.response.json()["error"]["details"]`. Por ejemplo, enviar `externalId` en lugar de `external_id` retorna:

```json
{
  "error": {
    "statusCode": 422,
    "name": "UnprocessableEntityError",
    "message": "The request body is invalid. See error object `details` property for more info.",
    "code": "VALIDATION_FAILED",
    "details": [
      {
        "path": "",
        "code": "additionalProperties",
        "message": "must NOT have additional properties",
        "info": {"additionalProperty": "externalId"}
      }
    ]
  }
}
```

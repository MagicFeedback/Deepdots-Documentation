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

### Métodos

#### `set_logging(level)`

Configura el logger interno del SDK.

```python
import logging
client.set_logging(logging.DEBUG)
```

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

### `delete(feedback_id)`

Retira el feedback (su estado pasa a ser `DEPRECATED`, y se oculta de los reportes y de las lecturas que no filtren por `status`). Retorna un dict vacío (`{}`).

### `upload_attachment(feedback_id, file_path, filename=None, extra_data=None)`

| Parámetro | Tipo | Descripción |
|---|---|---|
| `feedback_id` | string | ID del feedback al que adjuntar el archivo |
| `file_path` | string | Ruta al archivo en disco |
| `filename` | string \| None | Nombre de visualización — por defecto el nombre del archivo |
| `extra_data` | dict \| None | Dict JSON-serializable almacenado junto al adjunto |

Sube el archivo como una solicitud multipart. Retorna el objeto de adjunto creado.

---

## ContactsAPI

Acceso via `client.contacts`.

### `create(contact)`

Retorna el objeto de contacto creado. Ver [Contactos](/es/python-sdk/guides/contacts/).

### `get(filter=None)`

Retorna una lista de objetos de contacto.

### `update(contact_id, contact)`

Retorna el objeto de contacto actualizado.

### `delete(contact_id)`

Retorna el objeto de contacto eliminado.

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

Códigos de estado que puedes recibir:

| Código | Significado |
|---|---|
| `400` | El request está mal formado o no está permitido — por ejemplo, un valor de filtro que contiene `&` o `#` (ver [Consultas](/es/python-sdk/guides/querying/)), o un `crmContactId` que pertenece a otra empresa |
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

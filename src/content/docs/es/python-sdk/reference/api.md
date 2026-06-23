---
title: Referencia de la API
description: Referencia completa de cada clase y método público del SDK Python de MagicFeedback.
---

## MagicFeedback

El punto de entrada principal. Importa e instancia una vez; reutiliza el cliente en toda tu aplicación.

```python
from magicfeedback_sdk import MagicFeedback

client = MagicFeedback(
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

Retorna el objeto de feedback creado. Ver [Gestión de Feedback](/es/python-sdk/guides/feedback/).

### `get(filter=None)`

Retorna una lista de objetos de feedback.

### `get_id(feedback_id, filter=None)`

Retorna un único objeto de feedback.

### `update(feedback_id, feedback)`

Retorna el objeto de feedback actualizado.

### `delete(feedback_id)`

Retorna el objeto de feedback eliminado.

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

Retorna la lista de preguntas configuradas para la integración indicada.

```python
questions = client.integrations_questions.get("0eb9d270-6dd7-11ef-9987-21e04f383573")
for q in questions:
    print(q["key"], q["type"])
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

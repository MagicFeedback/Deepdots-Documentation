---
title: Changelog
description: Versiones publicadas del SDK Python de Deepdots, con fechas y cambios.
---

Todas las versiones publicadas, de más reciente a más antigua. Las fechas son las de publicación en PyPI.

Para instalar una versión concreta, consulta [Instalación](/es/python-sdk/getting-started/installation/).

## 1.0.24 — sin publicar

- **API keys.** Pasa `api_key="dd_live_..."` al constructor y la key se envía en cada request, sin iniciar sesión. Ver [Inicio rápido](/es/python-sdk/getting-started/quickstart/).
- **El inicio de sesión pasa por la API de Deepdots** (`POST /auth/token`) en lugar de llamar directamente a Google Identity Platform. El argumento `ip_key` ya no se usa: se ignora, con un `DeprecationWarning`.
- `refresh_token()` renueva un token de inicio de sesión con su token de refresco (`POST /auth/token/refresh`), y solo vuelve a iniciar sesión si el token de refresco se rechaza.
- Nuevo `client.crm` para objetos de CRM: `upsert_objects()` y `get_objects()`.

## 1.0.22 — 2026-09-25

- **Contactos:** nuevos `update_fields()`, que fusiona campos personalizados en un contacto y conserva los demás; `upsert()`, que crea o actualiza un contacto identificado por su email; y `upsert_batch()`, que hace lo mismo con una lista de cualquier tamaño, dividida en requests de 500.
- **Cambio:** `update_metadata_batch()` ahora fusiona los metadatos por clave en lugar de reemplazarlos: las claves que no envías se conservan. Pasa `mode="append"` para añadir valores a los que ya tiene una clave.

## 1.0.21 — 2026-09-16

- Nuevo `feedbacks.update_metadata_batch()`: actualiza los metadatos de muchos feedbacks en una sola request, y cada uno se vuelve a analizar.

## 1.0.20 — 2026-08-24

- `upload_attachment()` rechaza un fichero cuando el feedback ya tiene `max_attachments` ficheros (3 por defecto) o cuando el mismo contenido ya está adjunto. Pasa `check_duplicate_content=False` para saltarte la comprobación de contenido.
- `value` ahora es siempre una lista también en `metadata`, `metrics` y `profile`, tanto al enviar un feedback como al leerlo.

## 1.0.19 — 2026-08-20

- Los nombres de distribución pasan a escribirse en minúscula: `deepdots` y `magicfeedback`. Es solo cosmético — PyPI trata los nombres de paquete sin distinguir mayúsculas, así que `pip install MagicFeedback` sigue funcionando.

## 1.0.18 — 2026-08-20

- **Nuevo nombre de paquete `deepdots`.** Ya funciona `pip install deepdots`.
- **Nuevo paquete de importación `deepdots_sdk` y clase `Deepdots`**, junto a los originales `magicfeedback_sdk` y `MagicFeedback`. Ambos apuntan a los mismos objetos; el código existente no necesita cambios.

## 1.0.17 — 2026-07-10

- **Autenticación con token cacheado en Datastore.** El token se lee por defecto de una caché en Google Cloud Datastore (`auth_source="datastore"`), evitando un login en Identity Platform en cada uso, y recurriendo a Identity Platform cuando el token cacheado falta, está caducado o no es accesible. Usa `auth_source="identity"` para el comportamiento original.
- `refresh_token()` vuelve a resolver el token y actualiza la cabecera de autenticación en todos los sub-clientes de la API.
- `build_done_message()` construye el mensaje de finalización para el topic de Pub/Sub `request-done`.
- **Corregido:** los wheels publicados ya declaran sus dependencias. Hasta la 1.0.16 no declaraban ninguna, así que pip instalaba el SDK sin `requests` ni las librerías de Google Cloud.

## 1.0.16 — 2026-07-07

- Corrección de empaquetado.

## 1.0.15 — 2026-07-07

- Endpoint de actualización de reports.

## 1.0.14 — 2026-06-22

- `upload_attachment()` en la API de Feedback — adjunta un fichero a un feedback existente.

## 1.0.13 — 2026-05-13

- API de Signals.

## 1.0.12 — 2026-04-28

- Corregida la actualización de un feedback.

## 1.0.11 — 2026-04-23

- Versión de mantenimiento.

## 1.0.10 — 2026-03-17

- API de Requests.

## 1.0.9 — 2026-01-23

- API de Companies.

## Versiones anteriores

Son anteriores a este changelog. Las fechas son exactas; los resúmenes están reconstruidos del histórico de commits, así que son orientativos y no exhaustivos.

| Versión | Fecha | Notas |
|---|---|---|
| 1.0.8 | 2025-12-09 | Actualización de reports |
| 1.0.7 | 2025-12-02 | — |
| 1.0.6 | 2025-12-02 | — |
| 1.0.5 | 2025-12-02 | APIs de Reports y Products |
| 1.0.4 | 2025-09-29 | API de Campaigns |
| 1.0.3.2 | 2025-09-29 | — |
| 1.0.3 | 2025-07-22 | — |
| 1.0.2 | 2025-04-30 | Integration questions |
| 1.0.1 | 2025-04-14 | Filtros y endpoints de listado |
| 1.0.0 | 2025-04-14 | Reestructuración del paquete, control de logs |
| 0.0.7 | 2025-04-12 | — |
| 0.0.6 | 2025-04-07 | — |
| 0.0.5 | 2025-04-07 | Sesiones de campaña, métricas |
| 0.0.4 | 2024-12-18 | — |
| 0.0.3 | 2024-12-11 | Contactos y campañas |
| 0.0.2 | 2024-09-08 | — |
| 0.0.1 | 2024-09-08 | Versión inicial |

---
title: Changelog
description: Cambios en los endpoints de autenticación, feedback y contactos de la API REST de Deepdots.
sidebar:
  order: 4
---

## 2026-11

- **Los contactos también se buscan por `externalId`.** Cuando ningún contacto activo tiene el email que envías, `POST /crm/contacts/upsert` y `POST /crm/contacts/upsert/batch` actualizan el contacto con el `externalId` que envías, sea cual sea su estado, en lugar de crear otro. Ese contacto toma el email que envías y vuelve a estar activo si estaba eliminado; uno dado de baja sigue dado de baja. `POST /crm/contacts` con un `externalId` que tu compañía ya tiene actualiza y devuelve ese contacto de la misma forma, en lugar de crear uno. Ver [Gestionar contactos](/es/rest-api/guides/contacts/#cómo-funcionan-las-actualizaciones).
- **Documentación corregida, sin cambios en la API:** `POST /crm/contacts/upsert` y su batch siempre han exigido `name`, y un `country` en minúsculas (`dk`) cuando se envía, y han respondido `422` en caso contrario; la documentación anterior mostraba `name` como opcional y usaba `DK`. Un elemento del batch que no se ajusta a los campos del contacto hace fallar todo el batch con `422`. `crmContactId` tiene que ser un contacto activo; si no, el feedback se rechaza con `404`.

## 2026-10

- **Inicio de sesión a través de la API.** `POST /auth/token` inicia sesión con el email y la contraseña de un usuario de API, y `POST /auth/token/refresh` renueva el token. Ver [Autenticación](/es/rest-api/getting-started/authentication/). Ya no necesitas una clave de autenticación para iniciar sesión.
- Primera versión publicada de la documentación de la API REST: feedback (`POST /feedbacks`, `POST /feedbacks/bulk`, `GET /feedbacks/{id}`) y contactos (`POST /crm/contacts/upsert`, `POST /crm/contacts/upsert/batch`, `PATCH /crm/contacts/{id}/fields`, `GET /crm/contacts`).

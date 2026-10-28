---
title: Changelog
description: Cambios en los endpoints de autenticación, feedback y contactos de la API REST de Deepdots.
sidebar:
  order: 4
---

## 2026-10

- **Inicio de sesión a través de la API.** `POST /auth/token` inicia sesión con el email y la contraseña de un usuario de API, y `POST /auth/token/refresh` renueva el token. Ver [Autenticación](/es/rest-api/getting-started/authentication/). Ya no necesitas una clave de autenticación para iniciar sesión.
- Primera versión publicada de la documentación de la API REST: feedback (`POST /feedbacks`, `POST /feedbacks/bulk`, `GET /feedbacks/{id}`) y contactos (`POST /crm/contacts/upsert`, `POST /crm/contacts/upsert/batch`, `PATCH /crm/contacts/{id}/fields`, `GET /crm/contacts`).

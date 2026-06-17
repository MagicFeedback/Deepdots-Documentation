---
title: Inicio rápido
description: Instala el SDK, autentícate y realiza tu primera llamada a la API en menos de un minuto.
---

## 1. Instalar

```bash
pip install MagicFeedback
```

## 2. Crear un cliente

Importa `MagicFeedback` y pasa las credenciales de tu cuenta. El constructor se autentica de inmediato y almacena el bearer token para todas las requests posteriores.

```python
from magicfeedback_sdk import MagicFeedback

client = MagicFeedback(
    user="tu@ejemplo.com",
    password="tu-contraseña",
)
```

## 3. Tu primera llamada

Lista los productos registrados en tu cuenta:

```python
products = client.products.get()
for product in products:
    print(product["id"], product["name"])
```

## 4. Enviar una entrada de feedback

```python
feedback = client.feedbacks.create({
    "name": "Primera submission",
    "type": "APP",
    "identity": "MAGICFORM",
    "answers": [
        {"key": "rating", "value": "5"},
        {"key": "comment", "value": "¡Funciona genial!"},
    ],
    "integrationId": "<tu-integration-id>",
    "companyId": "<tu-company-id>",
    "productId": "<tu-product-id>",
})
print(feedback["id"])
```

:::tip
`integrationId`, `companyId` y `productId` provienen de tu panel de MagicFeedback. Usa `client.products.get()` para obtenerlos de forma programática.
:::

## Próximos pasos

- [Gestión de Feedback](/es/python-sdk/guides/feedback/) — CRUD completo para entradas de feedback
- [Contactos](/es/python-sdk/guides/contacts/) — crea y gestiona contactos CRM
- [Campañas](/es/python-sdk/guides/campaigns/) — organiza el alcance y rastrea sesiones
- [Referencia de la API](/es/python-sdk/reference/api/) — cada clase y método del SDK

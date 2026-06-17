---
title: Instalación
description: Requisitos e instrucciones de configuración para el SDK Python de MagicFeedback.
---

## Requisitos

- Python 3.8 o superior
- pip (incluido en todas las distribuciones estándar de Python)

El SDK tiene una única dependencia en tiempo de ejecución — `requests` — que pip instala automáticamente.

## Instalar

```bash
pip install MagicFeedback
```

Para fijar una versión específica en tu proyecto:

```bash
pip install MagicFeedback==1.0.7
```

O agrégalo a tu `requirements.txt`:

```text
MagicFeedback>=1.0.7
```

## Verificar

```python
from magicfeedback_sdk import MagicFeedback
print("SDK importado correctamente")
```

## Entornos

El SDK se conecta a `https://api.magicfeedback.io` por defecto. Puedes apuntarlo a otra URL base pasando el argumento `base_url` al constructor:

```python
client = MagicFeedback(
    user="tu@ejemplo.com",
    password="tu-contraseña",
    base_url="https://api-dev.magicfeedback.io",
)
```

:::tip
Usa un `base_url` diferente para instancias de staging o API locales. El valor de `base_url` se almacena en el cliente y se antepone a cada ruta de request automáticamente.
:::

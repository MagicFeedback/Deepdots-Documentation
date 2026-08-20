---
title: Instalación
description: Requisitos e instrucciones de configuración para el SDK Python de Deepdots.
---

## Requisitos

- Python 3.8 o superior
- pip (incluido en todas las distribuciones estándar de Python)

pip instala automáticamente las dependencias en tiempo de ejecución: `requests`, `google-cloud-pubsub` y `google-cloud-datastore`.

## Instalar

```bash
pip install deepdots
```

Esto instala siempre la última versión publicada.

### Instalar una versión concreta

Para fijar una versión exacta — sustituye `X.Y.Z` por la que quieras:

```bash
pip install "deepdots==X.Y.Z"
```

O define una versión mínima en tu `requirements.txt`:

```text
deepdots>=X.Y.Z
```

El [Changelog](/es/python-sdk/reference/changelog/) lista todas las versiones publicadas con su fecha.

## ¿Vienes de `MagicFeedback`?

El SDK se publicaba como `MagicFeedback` antes de que la empresa pasara a llamarse Deepdots. **El código existente sigue funcionando igual** — no hay nada que migrar.

Ambas distribuciones están publicadas e instalan el mismo código:

```bash
pip install deepdots        # nombre actual
pip install magicfeedback   # nombre original, sigue soportado
```

Con los nombres de importación pasa lo mismo. `deepdots_sdk` y `magicfeedback_sdk` exponen exactamente los mismos objetos, y la clase `Deepdots` *es* la clase `MagicFeedback` — el mismo objeto de Python bajo dos nombres, así que las comprobaciones con `isinstance()` se comportan igual.

En código nuevo, usa los nombres de Deepdots.

## Verificar

```python
from deepdots_sdk import Deepdots
print("SDK importado correctamente")
```

## Entornos

El SDK se conecta a `https://api.magicfeedback.io` por defecto. Puedes apuntarlo a otra URL base pasando el argumento `base_url` al constructor:

```python
client = Deepdots(
    user="tu@ejemplo.com",
    password="tu-contraseña",
    base_url="https://api-dev.magicfeedback.io",
)
```

:::tip
Usa un `base_url` diferente para instancias de staging o API locales. El valor de `base_url` se almacena en el cliente y se antepone a cada ruta de request automáticamente.
:::

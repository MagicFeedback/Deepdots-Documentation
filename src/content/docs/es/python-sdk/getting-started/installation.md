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

Esto instala la última versión publicada. `deepdots` no tiene código propio: instala `magicfeedback`, el paquete que contiene el SDK y su número de versión. Para actualizar el SDK o fijar su versión, usa `magicfeedback`.

### Actualizar

`pip install --upgrade deepdots` no actualiza un SDK que ya está instalado. Actualiza `magicfeedback` en su lugar:

```bash
pip install --upgrade magicfeedback
```

### Instalar una versión concreta

Para fijar una versión exacta — sustituye `X.Y.Z` por la que quieras:

```bash
pip install "magicfeedback==X.Y.Z"
```

O define una versión mínima en tu `requirements.txt`:

```text
magicfeedback>=X.Y.Z
```

No fijes `deepdots`: su última versión es la 1.0.19, y la versión de `deepdots` no determina qué versión del SDK obtienes.

El [Changelog](/es/python-sdk/reference/changelog/) lista todas las versiones publicadas con su fecha.

## ¿Vienes de `MagicFeedback`?

El SDK se publicó primero como `MagicFeedback`, antes de que la empresa pasara a llamarse Deepdots, y su código se sigue publicando con ese nombre, como `magicfeedback`. **El código existente sigue funcionando igual** — no hay nada que migrar.

Los dos nombres instalan el mismo código:

```bash
pip install deepdots        # instala magicfeedback
pip install magicfeedback   # el paquete que actualizas y cuya versión fijas
```

Si ya instalas `magicfeedback`, sigue haciéndolo.

Con los nombres de importación pasa lo mismo. `deepdots_sdk` y `magicfeedback_sdk` exponen exactamente los mismos objetos, y la clase `Deepdots` *es* la clase `MagicFeedback` — el mismo objeto de Python bajo dos nombres, así que las comprobaciones con `isinstance()` se comportan igual.

En código nuevo, importa `deepdots_sdk` y usa la clase `Deepdots`.

## Verificar

```python
from deepdots_sdk import Deepdots
print("SDK importado correctamente")
```

## Entornos

El SDK se conecta a la API de producción por defecto. Para usar el entorno de desarrollo, pasa su `base_url` al constructor, con credenciales de desarrollo:

```python
client = Deepdots(
    user="tu@ejemplo.com",
    password="tu-contraseña",
    base_url="https://api-dev.deepdots.com",
)
```

:::tip
Usa un `base_url` diferente para instancias de staging o API locales. El valor de `base_url` se almacena en el cliente y se antepone a cada ruta de request automáticamente.
:::

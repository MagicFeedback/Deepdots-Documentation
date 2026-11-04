---
title: Installation
description: Krav og opsætningsinstruktioner til Deepdots Python SDK.
---

## Krav

- Python 3.8 eller nyere
- pip (inkluderet i alle standard Python-distributioner)

pip installerer automatisk runtime-afhængighederne: `requests`, `google-cloud-pubsub` og `google-cloud-datastore`.

## Installer

```bash
pip install deepdots
```

Dette installerer den nyeste udgivelse. `deepdots` har ingen egen kode: den installerer `magicfeedback`, som er den pakke, der indeholder SDK'en og dens versionsnummer. Brug `magicfeedback` til at opgradere eller fastlåse SDK'en.

### Opgradering

`pip install --upgrade deepdots` opgraderer ikke en SDK, der allerede er installeret. Opgrader `magicfeedback` i stedet:

```bash
pip install --upgrade magicfeedback
```

### Installation af en bestemt version

Sådan fastlåser du en præcis version — erstat `X.Y.Z` med den ønskede:

```bash
pip install "magicfeedback==X.Y.Z"
```

Eller angiv en minimumsversion i din `requirements.txt`:

```text
magicfeedback>=X.Y.Z
```

Fastlås ikke `deepdots`: dens sidste version er 1.0.19, og en `deepdots`-version afgør ikke, hvilken SDK-version du får.

[Changelog](/da/python-sdk/reference/changelog/) viser alle udgivne versioner med dato.

## Kommer du fra `MagicFeedback`?

SDK'en blev først udgivet som `MagicFeedback`, før virksomheden skiftede navn til Deepdots, og koden udgives stadig under det navn, som `magicfeedback`. **Eksisterende kode virker uændret** — der er ikke noget, der skal migreres.

Begge navne installerer den samme kode:

```bash
pip install deepdots        # installerer magicfeedback
pip install magicfeedback   # pakken du opgraderer og fastlåser
```

Installerer du allerede `magicfeedback`, så behold det.

Det samme gælder importnavnene. `deepdots_sdk` og `magicfeedback_sdk` eksponerer præcis de samme objekter, og klassen `Deepdots` *er* klassen `MagicFeedback` — det samme Python-objekt under to navne, så `isinstance()`-tjek opfører sig ens.

I ny kode skal du importere `deepdots_sdk` og bruge klassen `Deepdots`.

## Verificer

```python
from deepdots_sdk import Deepdots
print("SDK importeret korrekt")
```

## Miljøer

SDK'en forbinder til produktions-API'et som standard. Send udviklingsmiljøets `base_url` til konstruktøren sammen med loginoplysninger til udvikling for at bruge det:

```python
client = Deepdots(
    user="dig@eksempel.com",
    password="din-adgangskode",
    base_url="https://api-dev.deepdots.com",
)
```

:::tip
Brug en anden `base_url` til staging- eller lokale API-instanser. Værdien af `base_url` gemmes på klienten og tilføjes automatisk til alle request-stier.
:::

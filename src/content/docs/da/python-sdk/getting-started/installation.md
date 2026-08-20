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

Dette installerer altid den nyeste udgivelse.

### Installation af en bestemt version

Sådan fastlåser du en præcis version — erstat `X.Y.Z` med den ønskede:

```bash
pip install "deepdots==X.Y.Z"
```

Eller angiv en minimumsversion i din `requirements.txt`:

```text
deepdots>=X.Y.Z
```

[Changelog](/da/python-sdk/reference/changelog/) viser alle udgivne versioner med dato.

## Kommer du fra `MagicFeedback`?

SDK'en blev tidligere udgivet som `MagicFeedback`, før virksomheden skiftede navn til Deepdots. **Eksisterende kode virker uændret** — der er ikke noget, der skal migreres.

Begge distributioner er udgivet, og begge installerer den samme kode:

```bash
pip install deepdots        # nuværende navn
pip install magicfeedback   # oprindeligt navn, stadig understøttet
```

Det samme gælder importnavnene. `deepdots_sdk` og `magicfeedback_sdk` eksponerer præcis de samme objekter, og klassen `Deepdots` *er* klassen `MagicFeedback` — det samme Python-objekt under to navne, så `isinstance()`-tjek opfører sig ens.

Brug Deepdots-navnene i ny kode.

## Verificer

```python
from deepdots_sdk import Deepdots
print("SDK importeret korrekt")
```

## Miljøer

SDK'en forbinder til `https://api.magicfeedback.io` som standard. Du kan pege den mod en anden basis-URL ved at sende `base_url`-argumentet til konstruktøren:

```python
client = Deepdots(
    user="dig@eksempel.com",
    password="din-adgangskode",
    base_url="https://api-dev.magicfeedback.io",
)
```

:::tip
Brug en anden `base_url` til staging- eller lokale API-instanser. Værdien af `base_url` gemmes på klienten og tilføjes automatisk til alle request-stier.
:::

---
title: Installation
description: Krav og opsætningsinstruktioner til MagicFeedback Python SDK.
---

## Krav

- Python 3.8 eller nyere
- pip (inkluderet i alle standard Python-distributioner)

SDK'en har én runtime-afhængighed — `requests` — som pip installerer automatisk.

## Installer

```bash
pip install MagicFeedback
```

For at fastlåse en specifik version i dit projekt:

```bash
pip install MagicFeedback==1.0.14
```

Eller tilføj den til din `requirements.txt`:

```text
MagicFeedback>=1.0.14
```

## Verificer

```python
from magicfeedback_sdk import MagicFeedback
print("SDK importeret korrekt")
```

## Miljøer

SDK'en forbinder til `https://api.magicfeedback.io` som standard. Du kan pege den mod en anden basis-URL ved at sende `base_url`-argumentet til konstruktøren:

```python
client = MagicFeedback(
    user="dig@eksempel.com",
    password="din-adgangskode",
    base_url="https://api-dev.magicfeedback.io",
)
```

:::tip
Brug en anden `base_url` til staging- eller lokale API-instanser. Værdien af `base_url` gemmes på klienten og tilføjes automatisk til alle request-stier.
:::

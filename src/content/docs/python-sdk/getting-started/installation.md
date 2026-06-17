---
title: Installation
description: Requirements and setup instructions for the MagicFeedback Python SDK.
---

## Requirements

- Python 3.8 or higher
- pip (bundled with all standard Python distributions)

The SDK has a single runtime dependency — `requests` — which pip installs automatically.

## Install

```bash
pip install MagicFeedback
```

To pin a specific version in your project:

```bash
pip install MagicFeedback==1.0.7
```

Or add it to your `requirements.txt`:

```text
MagicFeedback>=1.0.7
```

## Verify

```python
from magicfeedback_sdk import MagicFeedback
print("SDK imported successfully")
```

## Environments

The SDK connects to `https://api.magicfeedback.io` by default. You can point it at a different base URL by passing the `base_url` argument to the constructor:

```python
client = MagicFeedback(
    user="you@example.com",
    password="your-password",
    base_url="https://api-dev.magicfeedback.io",
)
```

:::tip
Use a different `base_url` for staging or local API instances. The `base_url` value is stored on the client and prepended to every request path automatically.
:::

---
title: Installation
description: Requirements and setup instructions for the Deepdots Python SDK.
---

## Requirements

- Python 3.8 or higher
- pip (bundled with all standard Python distributions)

pip installs the runtime dependencies automatically: `requests`, `google-cloud-pubsub` and `google-cloud-datastore`.

## Install

```bash
pip install deepdots
```

This always gives you the latest release.

### Installing a specific version

To pin an exact version — replace `X.Y.Z` with the one you want:

```bash
pip install "deepdots==X.Y.Z"
```

Or set a minimum in your `requirements.txt`:

```text
deepdots>=X.Y.Z
```

The [Changelog](/python-sdk/reference/changelog/) lists every released version with its date.

## Coming from `MagicFeedback`?

The SDK used to be published as `MagicFeedback`, before the company was renamed to Deepdots. **Existing code keeps working unchanged** — nothing needs migrating.

Both distributions are published, and both install the same code:

```bash
pip install deepdots        # current name
pip install magicfeedback   # original name, still supported
```

The import names work the same way. `deepdots_sdk` and `magicfeedback_sdk` expose the very same objects, and the `Deepdots` class *is* the `MagicFeedback` class — the same Python object under two names, so `isinstance()` checks behave identically.

New code should use the Deepdots names.

## Verify

```python
from deepdots_sdk import Deepdots
print("SDK imported successfully")
```

## Environments

The SDK connects to the production API by default. To use the development environment, pass its `base_url` to the constructor, with development credentials:

```python
client = Deepdots(
    api_key="dd_test_...",
    base_url="https://api-dev.deepdots.com",
)
```

:::tip
Use a different `base_url` for staging or local API instances. The `base_url` value is stored on the client and prepended to every request path automatically.
:::

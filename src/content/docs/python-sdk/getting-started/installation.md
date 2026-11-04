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

This installs the latest release. `deepdots` has no code of its own: it installs `magicfeedback`, the package that holds the SDK and its version number. To upgrade or pin the SDK, use `magicfeedback`.

### Upgrading

`pip install --upgrade deepdots` doesn't upgrade an SDK that is already installed. Upgrade `magicfeedback` instead:

```bash
pip install --upgrade magicfeedback
```

### Installing a specific version

To pin an exact version — replace `X.Y.Z` with the one you want:

```bash
pip install "magicfeedback==X.Y.Z"
```

Or set a minimum in your `requirements.txt`:

```text
magicfeedback>=X.Y.Z
```

Don't pin `deepdots`: its last version is 1.0.19, and a `deepdots` version doesn't decide which SDK version you get.

The [Changelog](/python-sdk/reference/changelog/) lists every released version with its date.

## Coming from `MagicFeedback`?

The SDK was first published as `MagicFeedback`, before the company was renamed to Deepdots, and its code is still published under that name, as `magicfeedback`. **Existing code keeps working unchanged** — nothing needs migrating.

Both names install the same code:

```bash
pip install deepdots        # installs magicfeedback
pip install magicfeedback   # the package to upgrade and pin
```

If you already install `magicfeedback`, keep it.

The import names work the same way. `deepdots_sdk` and `magicfeedback_sdk` expose the very same objects, and the `Deepdots` class *is* the `MagicFeedback` class — the same Python object under two names, so `isinstance()` checks behave identically.

New code should import `deepdots_sdk` and use the `Deepdots` class.

## Verify

```python
from deepdots_sdk import Deepdots
print("SDK imported successfully")
```

## Environments

The SDK connects to the production API by default. To use the development environment, pass its `base_url` to the constructor, with development credentials:

```python
client = Deepdots(
    user="you@example.com",
    password="your-password",
    base_url="https://api-dev.deepdots.com",
)
```

:::tip
Use a different `base_url` for staging or local API instances. The `base_url` value is stored on the client and prepended to every request path automatically.
:::

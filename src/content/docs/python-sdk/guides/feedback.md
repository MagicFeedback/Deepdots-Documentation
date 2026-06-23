---
title: Managing Feedback
description: Create, read, update, and delete feedback submissions with the MagicFeedback Python SDK.
---

Feedback submissions are the primary resource in MagicFeedback. Each submission records a set of answers for a specific integration and product.

## Create a submission

```python
feedback = client.feedbacks.create({
    "name": "User survey response",
    "type": "APP",
    "identity": "MAGICFORM",
    "answers": [
        {"key": "nps", "value": "9"},
        {"key": "reason", "value": "Fast and reliable"},
    ],
    "integrationId": "0eb9d270-6dd7-11ef-9987-21e04f383573",
    "companyId": "YOUR_COMPANY_ID",
    "productId": "YOUR_PRODUCT_ID",
})
print(feedback["id"])
```

### Required fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Human-readable label for this submission |
| `type` | string | Source type — e.g. `"APP"`, `"DOCUMENT"` |
| `identity` | string | Renderer identity — e.g. `"MAGICFORM"` |
| `integrationId` | string | UUID of the integration this feedback belongs to |
| `companyId` | string | Your company identifier |
| `productId` | string | The product this feedback is associated with |

### Answer value wrapping

The SDK automatically wraps a bare string `value` in a list. Both forms below are equivalent:

```python
{"key": "comment", "value": "Great product"}
{"key": "comment", "value": ["Great product"]}
```

You can always pass a list directly if you need multiple values for one key.

## List all submissions

```python
feedbacks = client.feedbacks.get()
```

Filter the results with a LoopBack-style filter dict (see [Querying](/python-sdk/guides/querying/)):

```python
feedbacks = client.feedbacks.get({
    "where": {"companyId": "YOUR_COMPANY_ID"},
    "limit": 50,
})
```

## Get a single submission

```python
feedback = client.feedbacks.get_id("feedback-uuid-here")
```

Pass a filter as the second argument to shape the returned fields:

```python
feedback = client.feedbacks.get_id("feedback-uuid-here", {"fields": {"answers": True}})
```

## Update a submission

```python
updated = client.feedbacks.update("feedback-uuid-here", {
    "name": "Updated label",
})
```

Only the fields you pass are changed; the rest remain unchanged.

## Delete a submission

```python
client.feedbacks.delete("feedback-uuid-here")
```

Returns the deleted object on success.

:::caution
Deletion is permanent. The API does not support soft deletes.
:::

## Upload a file attachment

Attach a file to an existing feedback submission. The file is sent as a multipart upload.

```python
attachment = client.feedbacks.upload_attachment(
    "feedback-uuid-here",
    file_path="/path/to/report.pdf",
)
```

Pass optional arguments to control the display name and attach extra metadata:

```python
attachment = client.feedbacks.upload_attachment(
    "feedback-uuid-here",
    file_path="/path/to/report.pdf",
    filename="q3-report.pdf",          # overrides the file name shown in the dashboard
    extra_data={"source": "crm", "year": 2026},
)
```

| Parameter | Type | Description |
|---|---|---|
| `feedback_id` | string | ID of the feedback to attach the file to |
| `file_path` | string | Absolute or relative path to the file on disk |
| `filename` | string \| None | Display name in the dashboard — defaults to the file's base name |
| `extra_data` | dict \| None | Any JSON-serialisable dict stored alongside the attachment |

---
title: Managing Feedback
description: Create, read, update, and delete feedback submissions with the Deepdots Python SDK.
---

Feedback submissions are the primary resource in Deepdots. Each submission records a set of answers for a specific integration and product.

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
    "integrationId": "YOUR_INTEGRATION_ID",
    "companyId": "YOUR_COMPANY_ID",
    "productId": "YOUR_PRODUCT_ID",
    # Optional: where the feedback comes from (see "Source-system fields" below)
    "external_id": "48213",
    "externalGeneratedAt": "2026-10-06T11:00:00.000Z",
})
print(feedback["id"])
```

The SDK sends the dict as the JSON body of `POST /feedbacks` with your key names exactly as you wrote them, so every field sits at the top level. Optional fields such as `external_id` and `externalGeneratedAt` go next to `integrationId` and `companyId`, not inside `answers` or `metadata`.

### Required fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Human-readable label for this submission |
| `type` | string | Source type: `"APP"`, `"SURVEY"` or `"DOCUMENT"` |
| `identity` | string | Source identity — use the identity of the integration the feedback belongs to (e.g. `"MAGICFORM"`). It decides whether and how the feedback is analysed |
| `integrationId` | string | UUID of the integration this feedback belongs to |
| `companyId` | string | Your company identifier |
| `productId` | string | The product this feedback is associated with |

`type` and `identity` are uppercase values; any other spelling is rejected. Some accepted `identity` values are not analysed at all, so don't pick one just because it names your source tool. The identity also decides what is analysed: survey identities such as `MAGICFORM`, `MAGICSURVEY` and `CSV` analyse `answers`, while most others, such as `GENERAL` and `CUSTOM`, analyse only `text`. If you don't know your integration's identity, ask your Deepdots contact.

### Optional fields

| Field | Type | Description |
|---|---|---|
| `answers` | Answer[] | Answers as `{"key": …, "value": [...]}` pairs. `key` is the question's `ref` (see `integrations_questions.get()`) |
| `text` | string | Free text of the feedback — e.g. a review or a support conversation |
| `metadata` | Metadata[] | Custom key/value entries (see [Update metrics and metadata](#update-metrics-and-metadata)) |
| `metrics` | Metric[] | Named metric values |
| `crmContactId` | string | ID of the CRM contact who gave the feedback. The contact must belong to the same company |
| `external_id` | string | ID of the record in the source system. Re-sending it for the same company, product and integration returns the existing feedback instead of a duplicate |
| `externalGeneratedAt` | string | When the feedback was created in the source system — the date the dashboard uses. UTC ISO 8601 ending in `Z`; defaults to the time of the request. See [The feedback date](#the-feedback-date-externalgeneratedat) |
| `externalUpdatedAt` | string | When the record was last changed in the source system |
| `externalUrl` | string | Link to the original record |

Field names are case-sensitive. `external_id` is the only snake_case field; every other field is camelCase (it is `companyId`, not `company_id`). The API rejects any key it does not know: an unknown or misspelled key such as `externalId` fails the whole request with HTTP 422, and nothing is created. The same happens if you send `status` or `createdAt`, which the API sets itself. A misspelled required key such as `company_id` is caught before anything is sent: `create()` raises `ValueError: Missing required field: companyId`. See [Error handling](/python-sdk/reference/api/#error-handling).

### Answer value wrapping

The SDK automatically wraps a bare string `value` in a list. Both forms below are equivalent:

```python
{"key": "comment", "value": "Great product"}
{"key": "comment", "value": ["Great product"]}
```

You can always pass a list directly if you need multiple values for one key.

Answer values must be strings: send `"9"`, not `9`. A numeric value is accepted when you create the feedback, but the feedback is then never analysed.

## Source-system fields

Use these optional fields when the feedback comes from another system — a helpdesk, a review site, a survey tool or a CSV export. They record when the feedback really happened and make re-sending it safe. All four are strings and go at the top level of the payload.

### The feedback date: `externalGeneratedAt`

`externalGeneratedAt` is the date the dashboard, reports and date filters use for a feedback. In the dashboard it is the **Date** column of the feedback list; *Added on* in a feedback's details is when the API received it (`createdAt`). Charts and reports count days in UTC.

If you leave it out, the API uses the moment it received the request, so historical feedback imported without it shows up on the day of the import. To fix feedback you have already imported, see [Correct the date of an existing feedback](#correct-the-date-of-an-existing-feedback).

Send it as a **UTC ISO 8601 string ending in `Z`**, for example `"2026-10-06T11:00:00.000Z"` — the format JavaScript's `toISOString()` produces. Seconds without milliseconds (`"2026-10-06T11:00:00Z"`) also work.

The API stores the string exactly as you send it and does not check its format. Other formats are still saved, but analytics cannot read most of them, so the feedback drops out of date-filtered charts and reports. That includes a time zone offset such as `+02:00`, a date without a time, a space instead of the `T`, and more than six digits after the decimal point (such as `.1234567Z` from .NET or `.123456789Z` from Java).

Pass a string. The SDK cannot serialise a `datetime` object (it raises `TypeError`), and the API rejects a number or `None` with HTTP 422. Convert datetimes like this:

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo  # Python 3.9+; on Windows also run: pip install tzdata

def to_api_datetime(dt: datetime) -> str:
    """Format a timezone-aware datetime as UTC ISO 8601 with milliseconds and a trailing Z."""
    if dt.utcoffset() is None:
        raise ValueError("Naive datetime: attach the source time zone first, e.g. dt.replace(tzinfo=ZoneInfo('Europe/Copenhagen'))")
    return dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")

to_api_datetime(datetime(2026, 10, 6, 13, 0, tzinfo=ZoneInfo("Europe/Copenhagen")))
# '2026-10-06T11:00:00.000Z'
```

:::caution
For a UTC datetime, Python's default `isoformat()` produces `2026-10-06T11:00:00+00:00`, which analytics cannot read. Use the helper above; it refuses naive datetimes. If your datetimes have no time zone, attach the source system's zone first — `dt.replace(tzinfo=ZoneInfo("Europe/Copenhagen"))` — because `astimezone()` would treat a naive datetime as the local time of the machine running the code.
:::

### `externalUpdatedAt` and `externalUrl`

- `externalUpdatedAt` — when the record last changed in the source system. Use the same format as `externalGeneratedAt`. If you leave it out, the API uses the time of the request.
- `externalUrl` — a link to the original record, shown as the feedback's *Original source* link in the dashboard. Use an absolute `https://` URL.

### Re-sending safely: `external_id`

`external_id` is your identifier for the record in the source system. Send it as a string — `"48213"`, not `48213`.

When you create a feedback whose `external_id` already exists for the same company, product and integration, the API does not create a duplicate. It returns the **existing** feedback, unchanged, with the same success response as a new one. This makes retries safe.

It also means that re-sending a feedback never updates it, not even its date. To change a feedback that already exists, use [`update()`](#update-a-submission). The response looks the same for a new and an existing feedback; to spot an existing one — for example when you re-run an import with dates added — compare the returned `externalGeneratedAt` with the one you sent.

Feedbacks sent without `external_id` are never deduplicated: retrying the request creates a second copy. Send retries for the same `external_id` one after another rather than in parallel, because two simultaneous requests can both create a feedback.

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
client.feedbacks.update("feedback-uuid-here", {
    "name": "Updated label",
})
```

Only the fields you pass are changed; the rest remain unchanged. `update()` returns an empty dict (`{}`), because the API answers `204 No Content`. Call `get_id()` if you need the updated feedback.

Some fields cannot be changed once the feedback exists: `external_id`, `type`, `identity`, `integrationId`, `productId`, `profile` and `data`, plus the server-set `id`, `createdAt` and `userId`. Sending any of them fails the whole request with HTTP 422. To correct a feedback's date, change `externalGeneratedAt`, not `createdAt` (see [Correct the date of an existing feedback](#correct-the-date-of-an-existing-feedback)). Send only the fields you are changing, not a whole object read back from `get_id()`.

`update()` needs an API user whose role may update feedback. If your user can create feedback but not update it, the call fails with HTTP 405 (see [Error handling](/python-sdk/reference/api/#error-handling)); ask your Deepdots contact to change the user's role.

### Re-run the analysis

The update is saved straight away, but charts and reports pick up changes to the date, `text`, `answers`, `metrics` or `metadata` only after the feedback is analysed again. Add `"status": "REGISTERED"` to the same call to queue a new analysis. A new analysis is a complete new run:

- The summary, issues and topics are generated again and can differ from the previous run. Any status or priority you set on its issues starts over.
- The feedback goes through `PROCESSING` and normally ends `DONE` again — check its `status` with `get_id()`. Once it is `DONE`, charts and reports can take up to an hour to fully reflect the change. If it ends `PARTIAL` or `ERROR`, charts keep showing the previous version: send the same update again.
- Automations that run when a feedback finishes processing run again.

Send `"status": "REGISTERED"` only once the feedback has finished processing: while it is still `REGISTERED` or `PROCESSING`, it starts a second analysis. If some feedbacks stay `REGISTERED` or `PROCESSING` long after the rest have finished, they are probably not being analysed at all (for example because an answer value is a number, or their `identity` is not analysed); ask your Deepdots contact instead of re-sending them. Any update to a feedback whose status is `DONE` also runs those automations again, even without `status`. If you need to re-analyse many feedbacks, talk to your Deepdots contact before you start.

### Correct the date of an existing feedback

Re-sending a feedback does not change it (see [Re-sending safely](#re-sending-safely-external_id)), so fix a missing or wrong date with `update()`. Include `"status": "REGISTERED"` so the feedback is analysed again and charts and reports move it to the new date (see [Re-run the analysis](#re-run-the-analysis)):

```python
client.feedbacks.update("feedback-uuid-here", {
    "externalGeneratedAt": "2026-10-06T11:00:00.000Z",
    "status": "REGISTERED",
})
```

To fix many feedbacks, look them up by your own IDs (see [Find a feedback by its source ID](/python-sdk/guides/querying/#find-a-feedback-by-its-source-id)) and update each one:

```python
# Correct dates, keyed by your own IDs (UTC ISO 8601 ending in Z)
dates = {
    "48213": "2024-05-01T10:00:00.000Z",
    "48214": "2024-05-02T08:30:00.000Z",
}

found = client.feedbacks.get({
    "where": {
        "integrationId": "YOUR_INTEGRATION_ID",
        "external_id": {"inq": list(dates)},
    },
    "fields": {"id": True, "external_id": True, "status": True, "externalGeneratedAt": True},
})

for fb in found:
    new_date = dates[fb["external_id"]]
    if fb["status"] in ("REGISTERED", "PROCESSING"):
        continue  # still being analysed: run the script again later
    if fb["status"] in ("DONE", "EMPTY") and fb["externalGeneratedAt"] == new_date:
        continue  # already corrected
    client.feedbacks.update(fb["id"], {
        "externalGeneratedAt": new_date,
        "status": "REGISTERED",
    })
```

You can run the script again: it skips feedbacks that are already corrected and re-sends those whose analysis ended `PARTIAL` or `ERROR`. Look up long lists of IDs in batches (for example 100 at a time) to keep the request URL short, and see [Querying](/python-sdk/guides/querying/#find-a-feedback-by-its-source-id) if your IDs contain `%`, `+`, `&`, `#` or `=`. A feedback imported without a date has an `externalGeneratedAt` that matches its `createdAt` to within a few milliseconds. Don't send an empty `externalGeneratedAt` to `update()`: unlike `create()`, `update()` stores it as it is, and the feedback then drops out of date-filtered charts and reports.

## Update metrics and metadata

Beyond the core fields, a submission can carry **metrics** (named values, such as a score or a channel) and **metadata** (custom key/value entries). You can send both with `create()`. Once the feedback exists, change them with `update()`, passing the full list you want to store: read the current values first, modify them, then write them back so you don't drop entries you want to keep.

```python
from datetime import datetime, timedelta, timezone

# Fetch the feedbacks to enrich — e.g. everything received yesterday (UTC)
today = datetime.now(timezone.utc).date()
yesterday = today - timedelta(days=1)
feedbacks = client.feedbacks.get({
    "where": {"and": [
        {"createdAt": {"gte": f"{yesterday}T00:00:00.000Z"}},
        {"createdAt": {"lt": f"{today}T00:00:00.000Z"}},
    ]},
})

for fb in feedbacks:
    if fb["status"] in ("REGISTERED", "PROCESSING"):
        continue  # still being analysed: try again later

    metrics = [m for m in (fb.get("metrics") or []) if m["key"] != "nps"]
    metrics.append({"key": "nps", "value": ["9"]})

    metadata = [m for m in (fb.get("metadata") or []) if m["key"] != "source"]
    metadata.append({"key": "source", "value": ["crm-import"]})

    # One call per feedback, so it is analysed only once
    client.feedbacks.update(fb["id"], {
        "metrics": metrics,
        "metadata": metadata,
        "status": "REGISTERED",
    })
```

| Field | Shape | Description |
|---|---|---|
| `metrics` | `[{"key": str, "value": [str]}]` | Named metric values |
| `metadata` | `[{"key": str, "value": [str]}]` | Custom key/value metadata |
| `status` | string | `"REGISTERED"` queues a new analysis, so the change reaches charts and reports (see [Re-run the analysis](#re-run-the-analysis)) |

Send values as strings — `["9"]`, not `[9]`. Metric names and values are lowercased in reports.

:::tip
`update()` replaces the entire `metrics` (or `metadata`) list — it does not merge individual entries. Always start from the existing list, as shown above, so you keep the values you're not changing.
:::

### Add metadata to many feedbacks at once

For metadata there is a simpler way that needs no read first. `update_metadata_batch()` adds or overwrites the metadata keys you send on many feedbacks in one request, keeps every other key, and has each feedback analysed again. Available from SDK 1.0.21.

```python
result = client.feedbacks.update_metadata_batch([
    {"feedbackId": "feedback-uuid-1", "metadata": [{"key": "source", "value": ["crm-import"]}]},
    {"feedbackId": "feedback-uuid-2", "metadata": [{"key": "source", "value": ["crm-import"]}]},
])
print(result)  # {"feedbacks": 2, "triggered": 2, "failed": []}
```

- **Overwrite or append:** a key you send replaces the values it holds, so a key sent with no value (`None`, `""` or `[]`) is emptied. Keys you don't send are kept, and no key is ever removed. Pass `mode="append"` (SDK 1.0.22) to add your values to the ones the key already holds; values it already has are skipped, so a retry adds nothing twice.
- **All or nothing:** if any feedback id doesn't exist, is deleted or belongs to a company you can't access, the API answers 404 naming them and nothing is written.
- **`failed`:** lists a feedback only when writing it, or queuing it for analysis, failed.

## Delete a submission

```python
client.feedbacks.delete("feedback-uuid-here")
```

Returns an empty dict (`{}`) on success.

:::caution
The SDK cannot undo a deletion. The feedback is retired (its status becomes `DEPRECATED`) and hidden from `get_id()`, the dashboard and reports, and from `get()` unless you filter on `status`. Creating a feedback with the same `external_id` afterwards makes a new feedback instead of restoring the old one.
:::

## Upload a file attachment

Attach a file to an existing feedback submission. The file is sent as a multipart upload.

Before uploading, the SDK reads the feedback's attachments and raises `ValueError`, uploading nothing, if:
- the feedback already has `max_attachments` files (3 by default);
- the same content is already attached, even under another name (`check_duplicate_content=True`, the default). This downloads each existing attachment to compare it; pass `check_duplicate_content=False` to skip it.

If the existing attachments can't be read, the upload is refused.

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
| `max_attachments` | int | Most attachments a feedback may have; default `3` |
| `check_duplicate_content` | bool | Refuse a file whose content is already attached; default `True` |

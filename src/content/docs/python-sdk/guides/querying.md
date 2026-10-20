---
title: Querying
description: Use LoopBack-style filter dicts to query, paginate, and shape results from any SDK list method.
---

Every `.get()` method in the SDK accepts an optional `filter` dict. The filter follows the LoopBack query syntax used by the Deepdots API.

## Basic structure

```python
filter = {
    "where": {…},
    "limit": 50,
    "skip": 0,
    "order": "createdAt DESC",
    "fields": {…},
    "include": […],
}
```

All keys are optional. Pass only the ones you need.

## Filtering by field value

```python
contacts = client.contacts.get({
    "where": {
        "companyId": "YOUR_COMPANY_ID",
    }
})
```

Multiple conditions in `where` are combined as AND:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "companyId": "YOUR_COMPANY_ID",
        "type": "APP",
    }
})
```

## Date ranges

Use the LoopBack `between` operator to select records within a time window. Pass ISO 8601 timestamps:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "createdAt": {"between": ["2026-07-01T00:00:00Z", "2026-07-01T23:59:59.999Z"]},
    }
})
```

The range operators `gt`, `gte`, `lt`, and `lte` work the same way for open-ended windows:

```python
feedbacks = client.feedbacks.get({
    "where": {"createdAt": {"gte": "2026-07-01T00:00:00Z"}},
})
```

### Filter feedback by the date it happened

`createdAt` is when the API received a record. For feedback that comes from another system, the date that matters — the one the dashboard shows — is `externalGeneratedAt` (see [Source-system fields](/python-sdk/guides/feedback/#source-system-fields)). Filter it with a half-open range of plain dates: `gte` the first day and `lt` the day after the last:

```python
feedbacks = client.feedbacks.get({
    "where": {"externalGeneratedAt": {"gte": "2026-09-01", "lt": "2026-10-01"}},
    "order": "externalGeneratedAt DESC",
})
```

`externalGeneratedAt` is stored as text, so the bounds are compared as strings. Dates in the recommended format (`2026-09-30T12:00:00.000Z`) sort chronologically, and the range above returns every one of them from September 1 to September 30, in UTC days.

:::caution
For `externalGeneratedAt`, use plain dates as shown above. If you use timestamps, write them exactly like your stored values: as text, a bound such as `2026-09-01T00:00:00Z` sorts after `2026-09-01T00:00:00.500Z`, so that value would be left out. Don't use time zone offsets such as `+02:00`: they compare as plain text too.
:::

:::caution
The SDK puts the filter in the URL without encoding it, so some characters in filter values are misread: `+` becomes a space, `&` and `#` cut the filter short (HTTP 400), and `%` followed by two hex digits is decoded. The request then finds nothing, finds the wrong records or fails. A `]` directly followed by `=` (as in a URL containing `ids[]=4`) makes the API ignore the whole filter and return every feedback you can see. Escape these characters as shown in [Find a feedback by its source ID](#find-a-feedback-by-its-source-id).
:::

## Find a feedback by its source ID

Filter on `external_id` to find the feedback created from a record in your own system:

```python
feedbacks = client.feedbacks.get({
    "where": {
        "integrationId": "YOUR_INTEGRATION_ID",
        "external_id": {"inq": ["48213", "48214"]},
    },
    "fields": {"id": True, "external_id": True, "externalGeneratedAt": True},
})
```

Look up long lists of IDs in batches (for example 100 at a time) to keep the URL short. If your IDs can contain `%`, `+`, `&`, `#` or `=`, escape those characters first (see the caution above):

```python
def filter_value(value: str) -> str:
    """Escape the characters the filter URL would otherwise misread."""
    return value.replace("%", "%25").replace("+", "%2B").replace("&", "%26").replace("#", "%23").replace("=", "%3D")

feedbacks = client.feedbacks.get({
    "where": {
        "integrationId": "YOUR_INTEGRATION_ID",
        "external_id": {"inq": [filter_value(i) for i in ["+4512345678", "R&D-17"]]},
    },
})
```

## Pagination

Use `limit` and `skip` for paginated requests:

```python
page_1 = client.feedbacks.get({"limit": 20, "skip": 0})
page_2 = client.feedbacks.get({"limit": 20, "skip": 20})
```

## Sorting

```python
feedbacks = client.feedbacks.get({
    "order": "createdAt DESC",
    "limit": 10,
})
```

Pass `order` explicitly: without it, results are not returned in date order. Use `"externalGeneratedAt DESC"` to list feedback by the date it happened rather than the date it was received. When you paginate, add `id` as a tiebreaker — `"order": ["externalGeneratedAt DESC", "id ASC"]` — because many feedbacks can share the same date, and pages sorted only by it can repeat or skip records.

## Selecting specific fields

Return only the fields you need to reduce payload size:

```python
contacts = client.contacts.get({
    "fields": {
        "id": True,
        "email": True,
    }
})
```

## Combining conditions

```python
result = client.feedbacks.get({
    "where": {"companyId": "YOUR_COMPANY_ID"},
    "order": "createdAt DESC",
    "limit": 50,
    "skip": 0,
})
```

:::tip
The `where` object is passed as a JSON query parameter to the API. Complex nested conditions (LoopBack `and`/`or` operators) are supported as long as the API endpoint accepts them — check the API Reference for per-endpoint notes.
:::

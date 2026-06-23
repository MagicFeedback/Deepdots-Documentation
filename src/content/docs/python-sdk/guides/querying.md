---
title: Querying
description: Use LoopBack-style filter dicts to query, paginate, and shape results from any SDK list method.
---

Every `.get()` method in the SDK accepts an optional `filter` dict. The filter follows the LoopBack query syntax used by the MagicFeedback API.

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

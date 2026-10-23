---
title: CRM objects
description: Store tickets, matches, memberships and other records next to your contacts with the Deepdots Python SDK, and link survey answers to them.
---

Besides [contacts](/python-sdk/guides/contacts/), your CRM can hold any other record you want to analyse feedback by: tickets, matches, memberships, orders and so on. Each one is a **CRM object**:

- a `type`, such as `ticket` or `match`;
- your own id for it, `externalId`;
- a `data` object holding any fields you like.

An object can belong to a contact (`contactKey`) and to another object (`parentType` + `parentKey`). For example, a ticket belongs to a fan and to a match. When a survey link names an object, every answer given through that link gets that object's information. See [Link survey answers to objects](#link-survey-answers-to-objects).

Available from SDK 1.0.23, as `client.crm`.

## Store objects

```python
result = client.crm.upsert_objects("match", [
    {
        "externalId": "8449",
        "startsAt": "2026-10-18T16:00:00Z",
        "sourceUpdatedAt": "2026-10-07T00:00:00Z",
        "data": {"name": "F.C. København - AGF", "venue": "Parken"},
    },
])
print(result)  # {"count": 1, "created": 1, "updated": 0, "failed": []}
```

`upsert_objects(object_type, items)` creates each object, or updates the one of that type with the same `externalId`.

| Field | Type | Description |
|---|---|---|
| `externalId` | string or number | **Required.** Your id for the object, unique per type (up to 255 characters) |
| `status` | string | Any status you use, such as `active` or `cancelled` |
| `contactKey` | string | The `externalId` of the contact the object belongs to |
| `parentType`, `parentKey` | string | The type and `externalId` of the object this one belongs to, e.g. `"match"` and `"8449"` |
| `startsAt`, `endsAt` | string | ISO 8601 dates, e.g. when a match starts or a membership ends |
| `sourceUpdatedAt` | string | When the record last changed in your system (see below) |
| `data` | dict | Any other fields |

- **Fields you leave out keep their stored value**, and `data` is merged key by key.
- **Dates** are an ISO 8601 date (`2026-10-18`) or a date-time with a time zone (`2026-10-18T16:00:00Z` or `+02:00`). A date-time without a zone is rejected, so the server never has to guess its zone.
- **With `sourceUpdatedAt`**, an item older than the stored object only fills in fields that are empty, so items can arrive in any order. **Without it**, the last item sent wins.
- **Object types** use lowercase letters, digits and `_`, start with a letter, and can't be `contact`.
- **Size:** each item can be up to 64 KB.

## Read objects

```python
tickets = client.crm.get_objects("ticket", contact_key="1058531")
```

`get_objects(object_type, ...)` returns the objects of one type, ordered by `externalId`. Deleted objects are never returned. Every filter is an exact match:

| Argument | Matches |
|---|---|
| `external_id` | `externalId` |
| `status` | `status` |
| `contact_key` | `contactKey` |
| `parent_type`, `parent_key` | `parentType`, `parentKey` |

Results come in pages of `limit` objects (100 by default, at most 1000). To get the next page, pass the last `externalId` you received as `after`:

```python
after = None
while True:
    page = client.crm.get_objects("match", limit=1000, after=after)
    if not page:
        break
    for match in page:
        print(match["externalId"], match["data"].get("name"))
    after = page[-1]["externalId"]
```

## Batches, retries and errors

These rules apply to every `client.crm` method:

- **Any list length.** Pass a list of any length, or a single record as a dict. The SDK sends 500 records per request and returns the totals over all requests.
- **Per-record failures.** A record the API can't store is listed in `failed` with its `index` in the list you passed, and the other records still land. One that isn't a dict makes `upsert_objects()` raise `ValueError` before anything is sent.
- **Request size.** A request must stay under the API's 1 MB limit; 500 typical records are well under it. For large records, pass a smaller `chunk_size`.
- **Automatic resends.** A request that fails temporarily (502, 503 or 504, a connection error, or no answer within 300 seconds) is resent up to 3 times, after 2, 4 and 8 seconds. If the token has expired, the client logs in again once and resends.
- **Errors.** If a request still fails, the call raises a `requests.RequestException`: `HTTPError` for an error answer, `ConnectionError` or `Timeout` for the network. The requests sent before it have already been applied.
- **No duplicates.** Resending records never creates duplicates, because they are matched by their own id. After a failure, resend the same list straight away.

```python
import requests

try:
    result = client.crm.upsert_objects("match", matches)
except requests.RequestException as e:
    print("Not sent, try again:", e)
```

## Connectors

A connector takes another system's records exactly as that system produces them, and maps them to contacts and objects on our side. You don't have to transform anything. Connectors are set up for a specific client's systems, so ask your Deepdots contact if you'd like one for yours.

### FCK users

```python
result = client.crm.sync_fck_users(users)
# {"count": 1, "created": 1, "updated": 0, "failed": []}
```

Each FCK user object becomes a contact.
- **Matching:** users are matched by `roboticket_id` first and by email second, so the first load and later changes are the same call. Each user needs an email.
- **Last version wins:** never send an older export after newer changes.
- **Failures:** each `failed` entry has the user's `index`, their FCK `id` and the `error`.

### Roboticket

```python
result = client.crm.ingest_roboticket(lines)
# {"count": 2, "applied": 2, "ignored": 0, "failed": []}
```

- **What a line updates:** each line updates its ticket or membership and the match or product it belongs to.
- **Returns and transfers:** both are handled. A cancelled ticket stays cancelled, and an older line never overwrites a newer one.
- **`AccessToken`:** the field is dropped and never stored.
- **`ignored`:** counts lines that are neither a sale nor a return. They are kept in the log only.

## Link survey answers to objects

You can link a survey answer to an object by adding a URL parameter named after the object's type, with its `externalId` as the value:

```text
https://<your survey link>?ticket=21522673
```

Every answer given through that link gets the object's information as survey data: for a ticket, for example, the stand, the match and the fan's memberships. You can then filter results by it. If the feedback isn't linked to a contact yet, it is also linked to the contact who owns the object. Deepdots sets up, per company, which object types add information this way and which of their fields become survey data. A link that names an object type that isn't set up only records the object's id.

A company can also require a **proof** parameter that only the right person's link carries, for example the owner's id in your email platform:
- **The proof matches the object's owner:** the answer gets the object's information.
- **The proof belongs to someone else** (the link was edited): the survey shows an "invalid link" page.
- **The proof is missing, or the owner isn't synced yet:** the survey still works, and the answer is saved without the object's information.

:::tip
Load contacts and objects before the survey links go out. An answer gets an object's information when it is analysed, shortly after it is submitted, so an object that arrives later is missing from it.
:::

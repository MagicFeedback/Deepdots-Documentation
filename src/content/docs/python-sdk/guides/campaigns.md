---
title: Campaigns
description: Create campaigns, attach contacts via sessions, and retrieve session feedback with the MagicFeedback Python SDK.
---

Campaigns let you group outreach efforts and track which contacts participated. Each campaign holds one or more sessions; each session links to a list of contacts.

## Create a campaign

```python
campaign = client.campaigns.create({
    "name": "Q3 NPS Survey",
    "companyId": "YOUR_COMPANY_ID",
})
print(campaign["id"])
```

### Required fields

| Field | Type | Description |
|---|---|---|
| `name` | string | Human-readable campaign name |
| `companyId` | string | Your company identifier |

## List campaigns

```python
campaigns = client.campaigns.get()
```

Filter with a LoopBack-style dict (see [Querying](/python-sdk/guides/querying/)):

```python
campaigns = client.campaigns.get({
    "where": {"companyId": "YOUR_COMPANY_ID"},
})
```

## Create a session

A session links a set of contacts to a campaign. Each contact is referenced by their `id`.

```python
session = client.campaigns.create_session(campaign["id"], {
    "crmContactId": ["contact-uuid-1", "contact-uuid-2"],
})
```

:::caution
`crmContactId` must be a non-empty list. Passing an empty list or a bare string will cause the API to reject the request.
:::

### Required fields

| Field | Type | Description |
|---|---|---|
| `crmContactId` | string[] | List of contact IDs to include in this session |

## List sessions for a campaign

```python
sessions = client.campaigns.get_sessions(campaign["id"])
```

## Get feedback from sessions

Retrieve all feedback submissions linked to sessions of a campaign:

```python
feedbacks = client.campaigns.get_sessions_feedbacks(campaign["id"])
```

This is useful for reporting — you can cross-reference which contacts submitted responses within a specific campaign.

### Typical workflow

```python
# 1. Create contacts
contact_a = client.contacts.create({
    "name": "Alice", "lastname": "Doe",
    "email": "alice@example.com", "companyId": "YOUR_COMPANY_ID",
})
contact_b = client.contacts.create({
    "name": "Bob", "lastname": "Doe",
    "email": "bob@example.com", "companyId": "YOUR_COMPANY_ID",
})

# 2. Create a campaign
campaign = client.campaigns.create({
    "name": "Q3 NPS Survey", "companyId": "YOUR_COMPANY_ID",
})

# 3. Add a session with both contacts
session = client.campaigns.create_session(campaign["id"], {
    "crmContactId": [contact_a["id"], contact_b["id"]],
})

# 4. Later: pull all feedback for this campaign
feedbacks = client.campaigns.get_sessions_feedbacks(campaign["id"])
```

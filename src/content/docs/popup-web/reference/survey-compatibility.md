---
title: Survey version compatibility
description: Which survey SDK each popup SDK draws surveys with, and which survey versions assigned in the Admin it follows.
sidebar:
  hidden: true
pagefind: false
head:
  - tag: meta
    attrs:
      name: robots
      content: noindex
---

Every survey has a **survey version** in the Admin (*Survey frontend version*: **latest** or a pinned version). Each survey version is a release of the survey app built with one version of `@magicfeedback/native`, the **survey SDK** that draws the questions.

From **popup SDK web 1.19.0 and native 0.7.10**, a popup draws its survey with the survey SDK of the survey version assigned in the Admin, like the survey page does, as long as the popup SDK supports that survey SDK. Older popup SDKs always use the survey SDK they ship with.

## Popup SDKs

| Popup SDK | Bundled survey SDK | Supported survey SDKs | Survey versions it follows |
|---|---|---|---|
| Web 1.19.0 and later (`@magicfeedback/popup-sdk`) | 2.2.39 | 2.2.38, 2.2.39 | 3.3.0, 3.4.0, 3.4.1 |
| Native 0.7.10 and later (Android, iOS) | 2.2.39 | 2.2.38, 2.2.39 | 3.3.0, 3.4.0, 3.4.1 |
| Web 1.18.0 and earlier | 2.2.37 (1.18.0) | Fixed | None: always the bundled survey SDK |
| Native 0.7.9 and earlier | 2.2.31 (0.7.9) | Fixed | None: always the bundled survey SDK |

## Survey versions

| Survey version | Survey SDK | Followed by popups (web 1.19.0+, native 0.7.10+) | Production |
|---|---|---|---|
| 3.4.1 | 2.2.39 | Yes | Candidate (can be pinned) |
| 3.4.0 | 2.2.38 | Yes | Not released |
| 3.3.0 | 2.2.38 | Yes | Not released |
| 3.2.1 | 2.2.36 | No: bundled survey SDK | Candidate |
| 3.2.0 | 2.2.36 | No: bundled survey SDK | Stable (latest) |
| 3.1.0 | 2.2.35 | No: bundled survey SDK | Stable |
| 3.0.0 and earlier | Not recorded | No: bundled survey SDK | Stable or deprecated |

Survey SDK per survey version taken from the version registry on 5 November 2026.

## When the popup uses its bundled survey SDK

The popup falls back to the survey SDK it ships with when:

- the survey version assigned in the Admin uses a survey SDK the popup SDK does not support (see the table above);
- the API does not send the survey version with the popup (older API);
- the assigned survey SDK cannot be downloaded (no network, or a Content-Security-Policy that blocks `cdn.jsdelivr.net` and `unpkg.com`).

The survey still works: it looks and behaves like the bundled survey SDK. The JavaScript and the styles of a survey SDK always change together.

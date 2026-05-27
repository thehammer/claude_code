# Feature Request: Nostromo free-text reply to Mother job questions

**Captured:** 2026-05-19  
**Status:** inbox  
**Area:** Nostromo (Mother UI)

---

## Problem

When a Mother job's Cody session raises an open-ended question mid-job (e.g.
"I've hit a dependency — should I stop or proceed with partial work?"), Nostromo
surfaces it with the permission-gate affordance:

```
[a] approve   [d] deny   [v] view diff   [esc] dismiss
```

None of these is right for an open-ended architectural question. "Approve" and
"deny" are binary and don't convey the answer Cody needs. "Dismiss" silently
drops the question. The user has no way to actually answer the question.

## What's needed

A **reply** input mode: when a Mother notification contains a question rather
than a permission request, Nostromo should offer a text input field (or a `[r]
reply` keybinding that opens one) so the user can type a free-text response that
gets sent back to the Cody session.

## Proposed UX

```
[a] approve   [d] deny   [v] view diff   [r] reply   [esc] dismiss
```

Pressing `[r]` opens an inline text input. The entered text is sent to the
Cody session via `mother reply <job-id> "<message>"` (new Mother subcommand
or via the existing session stdin mechanism).

## Mother side

Needs a `mother reply <job-id> <message>` command (or equivalent) that sends
the message into the running Cody session. The mechanism is already partially
there — `mother peek` can observe the session, `mother attach` can connect to
it. A `reply` command just needs to write to the session's stdin or inject a
user turn into the headless Claude process.

## Distinguishing question vs. permission

Mother / Cody could signal the distinction via the notification payload:
- `type: "permission_request"` → existing approve/deny UI
- `type: "question"` → reply UI

If that's too much plumbing short-term, a simpler heuristic: if the
notification text contains a `?`, offer reply; otherwise offer approve/deny.

## Related

- Mother job dependencies (`mother-job-dependencies.md`) — if dependencies
  were properly supported, many of these mid-job questions wouldn't arise
  in the first place.

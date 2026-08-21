---
name: submit-review
description: Submit a GitHub PR review (approve, request changes, or comment) with explicit user confirmation via a selection UI. Always invoke this instead of calling `gh pr review` directly. Never bypass this with a direct gh command.
---

# Submit Review Skill

Gate every PR review submission behind an explicit user confirmation. Perri analyses PRs and forms verdicts independently — this skill is the mandatory checkpoint before anything is posted to GitHub.

## When to Invoke

Any time you are ready to post a review to GitHub:
- You have finished analysing a PR and formed a verdict
- The user has told you to "approve", "request changes", or similar
- You are processing a batch of PRs and have reached the submission step for one

**Never call `gh pr review` directly. Always go through this skill.**

## Inline Findings

Before invoking this skill, Perri may have **inline findings** — line-specific comments tied to exact locations in the diff. These are separate from the overall review body:

- **Inline** — `{path, line, body}` for a specific diff line. Body can contain a ` ```suggestion ``` ` block for one-click application.
- **Body** — overall summary, architectural concerns, or anything without a precise diff location.

Both are presented to the user before the decision is posed (Step 2). If there are no inline findings, the simple `gh pr review` path is used.

**Line constraint**: Only use an inline comment if the target line appears in `gh pr diff` output for this PR. Lines outside the diff will cause a 422 from the API. When in doubt, put the finding in the body instead.

## Workflow

### Step 1 — Present the verdict summary

Before asking, print a brief recap of the PR and your verdict. If there are inline findings, list them here so the user sees exactly what will be posted:

```
**#<number> — <title>** (`<repo>`, <author>)
Verdict: <Approve / Request Changes / Comment>
<one-sentence reason>

Inline comments (N):
• `path/to/file.php:42` [CRITICAL] — <one-line summary>
  ```suggestion
  replacement code here
  ```
• `path/to/other.vue:17` [HIGH] — <one-line summary>
```

### Step 2 — Pose the decision

The option set is the same either way — always `Approve` and `Skip`, plus whichever of
`Approve with comment`, `Approve + N inline`, `Request changes` apply to this verdict —
only the mechanism differs.

**Inside Nostromo (MCP available)** — call `nostromo.ask_decision`, not the `CONFIRM:`
block:

```
nostromo.ask_decision({
  prompt: "Submit review for #<number>?",
  detail: "PR #<number>",
  choices: [
    { id: "approve", label: "Approve", detail: "Post approval, no comment" },
    { id: "skip", label: "Skip", detail: "Do nothing, move on" }
  ]
})
```

Build `choices` from the same option list as the `CONFIRM:` block below — same members,
same order, same descriptions, just addressed by `id`/`label`/`detail` instead of
`l`/`d`/`r`. `ask_decision`'s choice schema has no `"r"` recommendation flag, so mark the
recommended choice by appending `" (recommended)"` to that one choice's `label` instead
(the same choice Step 1's verdict points at — never `Skip`).

The call blocks until the operator answers, and returns one of:

- `{"ok": true, "choice_id": "<id>"}` — the operator's pick. That `id` **is** the answer —
  go straight to Step 3, no waiting on a following message.
- `{"ok": true, "outcome": "dismissed"}` — treat as **Skip**.
- `{"error": "timeout"}` — treat as **Skip**.
- `{"error": "no_operator"}` — no client was there to render it; fall through to the
  `CONFIRM:` block below, same turn, same options.

A dismissed or timed-out decision is never an implicit approval — it is always Skip, same
as the fallback path below.

**Otherwise, or on `no_operator`** — do NOT call `AskUserQuestion`: it does not work in
non-interactive mode and will always error immediately before the user can respond.
Output a `CONFIRM:` line (alone on its own line, no backticks, no fencing) containing the
confirmation JSON instead. Reflect the inline count in the option descriptions when
relevant:

```
CONFIRM:{"q":"Submit review for #<number>?","h":"PR #<number>","opts":[{"l":"Approve","d":"Post approval, no comment","r":true},{"l":"Skip","d":"Do nothing, move on"}]}
```

Include only the relevant options:
- Always include `Approve` and `Skip`
- Add `{"l":"Approve with comment","d":"Post approval with comment body"}` if you have a prepared body comment
- Add `{"l":"Approve + N inline","d":"Post approval with N inline comment(s)"}` if there are inline findings on an approve verdict
- Add `{"l":"Request changes","d":"Post request-changes with N inline comment(s) + summary"}` if there are issues
- Omit options that don't apply

Mark **exactly one** option as Perri's recommendation with `"r":true` (omit `"r"` on every other option — it defaults to false). The recommended option is whichever matches the verdict from Step 1 — e.g. if the verdict is "Approve", `"r":true` goes on the `Approve` option (or `Approve + N inline` if that's the one being offered for an approve verdict with inline findings), not on `Skip`. The GUI renders this as a "(recommended)" suffix on that option's label.

After outputting the CONFIRM line, **your response ends here**. Output nothing else — no text, no tool calls, no `gh` commands. Stop completely. The user's next message is their answer; Step 3 runs only after that message arrives.

**If you are tempted to call `gh pr review` in the same turn as the CONFIRM block: do not. End your response. Wait.**

### Step 2a — Resolve the answer

**From `nostromo.ask_decision`** — you already have it. The returned `choice_id` (or the
`dismissed`/`timeout` mapping to Skip, above) is the answer. Proceed straight to Step 3 —
there is no following message to wait for on this path.

**From the `CONFIRM:` fallback** — the user's **next message** is their confirmation
answer. Parse it case-insensitively:

- Contains "approve" (and not "comment" or "inline") → Approve without comment
- Contains "approve" and ("comment" or "inline") → Approve with comment/inline
- Contains "request" or "changes" → Request changes
- Contains "skip" or "cancel" or "no" → Skip
- Exact option label → use that option directly

Once you have the answer, proceed immediately to Step 3. **Do NOT output another CONFIRM block or call AskUserQuestion.**

### Step 3 — Execute based on selection

#### Simple approve (no body, no inline findings)
```bash
gh pr review <number> --repo <repo> --approve
```

#### Approve with body only (no inline findings)
```bash
gh pr review <number> --repo <repo> --approve --body "$(cat <<'EOF'
<body text>
EOF
)"
```

#### Any review with inline comments — Write file then run script

When there are inline findings, **do not construct JSON in bash**. Instead:

**Step 3a — Write the review JSON using the Write tool.**

Write to `/tmp/perri-review-<number>.json`. The file must be valid JSON matching the GitHub PR Review API shape. Example:

```json
{
  "body": "Two issues found — both must be fixed before merge.",
  "event": "REQUEST_CHANGES",
  "comments": [
    {
      "path": "app/Http/Controllers/FooController.php",
      "line": 42,
      "side": "RIGHT",
      "body": "**Perri:** This input is written to the DB without validation.\n\n```suggestion\n        $value = $request->validated()['value'];\n```"
    },
    {
      "path": "resources/views/calendar.blade.php",
      "line": 17,
      "side": "RIGHT",
      "body": "**Perri:** `@include` references deleted partial `calendar/visit` — guaranteed `ViewNotFoundException` at runtime."
    }
  ]
}
```

**Field notes:**
- `event`: `"APPROVE"`, `"REQUEST_CHANGES"`, or `"COMMENT"`. Approve + inline suggestions still uses `"APPROVE"`.
- `path`: relative to repo root, no leading slash.
- `line`: new-file line number visible in `gh pr diff` output. Only include lines that appear in the diff — otherwise the script will recover but can't post inline.
- `side`: `"RIGHT"` for added/unchanged lines (new code), `"LEFT"` for deleted lines. Default `"RIGHT"` when unsure.
- `body`: markdown. Backticks are fine in JSON. Newlines must be `\n`. Suggestion blocks render as GitHub "Apply suggestion" buttons.

**Step 3b — Run the post-review script:**

```bash
~/.claude/lib/perri-post-review.sh <number> <owner/repo> /tmp/perri-review-<number>.json
```

The script handles posting, 422 recovery (individual comment retry), and appending any failed inline comments to the body. Watch its output for success/failure per comment.

**Step 3c — Clean up:**
```bash
rm -f /tmp/perri-review-<number>.json
```

**Skip:** Do nothing. Inform the user briefly ("Skipped — moving on.") and continue.

### Step 4 — Refresh the dashboard

After any submission (not on Skip):

**For Approve and Approve with inline only** — record the approval BEFORE
touching `queue.dirty` so the daemon always reads the suppression signal on
the same wakeup that triggers the re-fetch (write order matters):

```bash
# Resolve the HEAD SHA that was approved.
_head_sha=$(gh pr view <number> --repo <repo> --json headRefOid -q .headRefOid)

# Append one JSON line to the approvals signal file FIRST.
printf '{"repo":"%s","number":%s,"head_sha":"%s","ts":"%s"}\n' \
  "<repo>" "<number>" "$_head_sha" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  >> ~/.claude/state/perri/approvals.jsonl
```

Then trigger the dashboard refresh (all submissions, not just approvals):

```bash
touch ~/.claude/state/perri/queue.dirty
rm -f ~/.claude/state/perri/current-pr.json
touch ~/.claude/state/perri/current-pr.dirty
```

Do **NOT** write the approvals line for Request changes, Comment, or Skip —
only Approve (and Approve with inline) trigger suppression.

## Rules

- **Never use `AskUserQuestion` in this skill** — it always errors in the GUI and the confirmation never reaches the user. Inside Nostromo, pose the decision with `nostromo.ask_decision`; otherwise (or on `no_operator`), use the `CONFIRM:` text block format.
- **A dismissed or timed-out `ask_decision` is Skip, never an implicit approval** — same as the fallback path, where an unanswered `CONFIRM:` simply never proceeds to Step 3.
- **Never call `gh pr review` without going through Step 2 first.** No exceptions — not for trivial PRs, not when the user says "just approve them all".
- If the user says "approve all" or "batch approve", pose the decision for each PR individually, one at a time — `ask_decision` call or `CONFIRM:` block, whichever path applies. A single pass through five PRs is five confirmation prompts.
- The body and inline comments must be prepared before Step 2. If you have not drafted them yet, draft them first, then invoke this skill.
- After a Skip, do NOT refresh the dashboard — the PR stays in the queue.
- If the script reports a comment was moved to the body, that comment's line number was outside the diff. This is handled automatically — no manual retry needed. Mention it to the user so they're aware.

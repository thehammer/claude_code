---
name: review-prs
description: Work the PR review queue end-to-end the Perri way — fetch the actionable queue (all buckets including dependabot), gate on CI, triage into trivial/clean/comment/discuss groups, and drive each group to a decision with explicit batch-or-individual approval. Invoke when the user says "review PRs", "let's review", "work the queue", "do PR review", or similar, or when they type /review-prs.
---

# Review PRs Skill

A single, repeatable pass over everything that needs PR-review attention right now —
the Perri daemon queue, which now includes a dedicated `dependabot` bucket for
bot-authored PRs alongside the human-review buckets.

Designed to run from a fresh context: each cycle is mostly self-contained and does not
need prior conversation history. Start it after a `/clear` (or in a fresh session) for
maximum room.

## The Approval Principle (never violated)

> Every action posted to GitHub — approve, comment, request-changes, merge — must be
> covered by an **explicit approval from the user, given in the same session**. One
> approval MAY cover a batch, provided the approval request **clearly enumerates exactly
> which PRs and what action** it authorizes.

Corollaries:
- A batch approval is valid only when the request lists the exact PR numbers and the
  exact action ("Approve these 5: #x, #y, #z, #a, #b?"). Vague asks ("approve everything?")
  do **not** satisfy it.
- Comments are almost always 1:1 (the body differs per PR), so they go individually — but
  the same rule holds: clear ask, explicit yes.
- Merges are actions too. If a group will be approved **and merged** (typical for green
  dependabot PRs), the approval request must say so.
- Submissions that carry a comment or a request-changes go through the `submit-review`
  skill, which provides the per-PR confirmation UI. The batch shortcut (one confirmation →
  loop the approvals) is reserved for **trivial**, **clean**, and **green-dependabot**
  groups, where the action is a bare approve (± merge) with no comment.

## Step 1 — Gather the queue

**Single source** — the Perri daemon queue is now the unified source of truth for all
PRs, including dependabot:

```bash
~/.claude/bin/perri-queue-pane --json
```

Parse `.items[]`: each has `repo`, `number`, `title`, `author`, `bucket`,
`new_activity`, `url`, `ci_state`, `is_bot`.

Bucket values:
- `"requested"`, `"needs_review"`, `"changes_req"` — human-review PRs (unchanged)
- `"dependabot"` — bot-authored PRs; `is_bot == true` (daemon-sourced, no separate fetch needed)

**Do NOT run a separate `gh search prs --author app/dependabot` query.**
The daemon (`is_bot` field in `perri_queue_native.rs`) is the single source of truth
for what counts as a bot PR. Running a parallel search would re-introduce the two-source
divergence this integration was designed to close.

Closed/merged PRs are automatically excluded by the daemon (it checks the PR detail
`state` / `merged_at` fields independently of the GitHub search index). Do not filter
on those fields yourself.

Report a one-line summary by bucket before proceeding.

## Step 2 — CI gate + classify every PR

Check each PR's status (`gh pr view <n> --repo <r> --json statusCheckRollup,mergeable`).
Classify into exactly one class:

| Class | Criteria | Action |
|---|---|---|
| **dependabot-green** | `bucket == "dependabot"`, CI passing, mergeable | approve **+ merge** (batch) |
| **dependabot-flake** | `bucket == "dependabot"`, only failing checks are env-specific `iac-plan` (OpenTofu state-lock) | offer to rerun failed jobs; recheck |
| **dependabot-blocked** | `bucket == "dependabot"`, real failing checks (lint/build/test/eresolve) | diagnose briefly, report, defer — do not approve |
| **trivial** | passes the full trivial gate (below): every changed file in one named trivial category, no sensitive surface touched, inside that category's size treatment | approve **unread** (batch) — each PR with a basis line |
| **clean** | real changes, but review finds nothing worth a comment | approve (batch, after showing verdicts) |
| **comment** | approve, but with a note worth leaving | approve **with comment**, individual via submit-review |
| **discuss** | needs the user's call (request-changes candidate, design question) | surface only, no action |
| **skip** | non-dependabot PR with failing CI (except an approval-only check) | skip + report at end |

Note: the daemon already filters out dependabot PRs with hard Actions CI failures
(`dependabot-blocked`). If a `bucket == "dependabot"` PR appears in the queue,
it passed the daemon's CI gate — you still check for flaky `iac-plan` failures
specifically, but hard failures are pre-filtered.

### The trivial gate

`trivial` is the one class approved **without being read for logic**, so it is
gated rather than guessed. `perri.md` → `## Trivial PR Batch` is the authority and
this skill must not diverge from it; the gate in short, tested in this order:

1. **Homogeneity — disqualifies alone.** *Every* changed file belongs to the one
   claimed trivial category (machine-generated / hand-authored trivial / bulk
   mechanical). Not the dominant category, and never on the strength of the title.
   One out-of-category file demotes the PR — name the file.
2. **Sensitive surfaces — absolute.** Authentication, authorization, permission or
   policy gates, payments or billing, DB schema or migrations, CI/CD or deploy
   configuration, secrets or credentials, rate limiting or throttling, crypto or
   signature verification. **No category and no line count overrides this.** A
   one-line config-only flip of a permission gate default is not trivial.
3. **Size — only after 1 and 2 pass, and only ever subtractively.**
   Machine-generated diffs (lockfiles, resolved-dependency files) are size-exempt
   at any length, but **more than 30 changed lines outside the generated files**
   demotes. Hand-authored trivial diffs (docs, prose, comments, config values)
   have a ceiling of **200 changed lines**. Bulk mechanical diffs (formatter
   sweeps, codemods, mechanical renames) are size-exempt when **every sampled hunk
   shows the same transformation** — state the transformation and the number of
   hunks sampled, and demote the whole PR on any non-conforming hunk.

**Size never promotes. There is no line count small enough to make a PR trivial.**
Smallness is not a category: if you cannot name the trivial category a PR matches,
it is not trivial no matter how few lines it changes. Never justify a trivial
classification with "only N lines" or "small change".

**Every demotion here is a read, never a rejection.** Homogeneity, sensitivity and
size demotions all route to **`clean`** — never to `discuss`, never to `skip`. The
PR gets read and can still be batch-approved with the clean group, so state it as
"reading it as a clean candidate", not as blocked or deferred. Where the
classification is genuinely ambiguous, treat the PR as non-trivial and say the
classification was uncertain rather than giving an unqualified verdict.

These ceilings are unrelated to the `>1k lines → delegate the deep read` guidance
under "Per-PR analysis" below. That one decides *how* a read is performed once a
read is happening; these decide *whether* a read happens at all. Never state
either in terms of the other.

**CI gate rule:** never review on top of red CI except when the only red is the
approval check itself. List everything skipped at the end so nothing is silently dropped.

## Step 3 — Work the groups in order

Order: **dependabot-green → dependabot-flake → trivial → amber (changes_req + new_activity)
→ requested → needs_review (clean) → comment → discuss.**

For each group:

### dependabot-green
- Enumerate the PRs (number, repo, title).
- One batch approval request: "Approve **and merge** these N dependabot PRs: …?"
- On yes: `gh pr review --approve` then merge per repo convention:
  - **admin-portal** uses a merge queue → `gh pr merge <n> --repo <r> --auto`
  - **family-portal / payments** → `gh pr merge <n> --repo <r> --squash --auto`
- Refresh: `~/.claude/lib/perri-refresh.sh --clear`

### dependabot-flake
- Rerun failed `iac-plan` jobs (`gh run rerun <run-id> --failed --repo <r>`).
- Recheck after; promote to dependabot-green if it clears. Do not block the rest waiting.

### trivial / clean
- For **trivial**, present each PR with a one-line **basis line**: matched category,
  file count, changed-line count, sensitive-path clearance — plus the transformation
  and hunks sampled for bulk mechanical. E.g. `• operations #211 — bump axios 1.7.2
  → 1.7.9` / `[dep bump · 2 files · manifest +2/-2, lock +2,104/-1,880 · no sensitive
  paths]`. This is required, not a nicety: the user is authorizing an **unread**
  approval, and the basis line is the only thing that makes a misclassification
  visible to him before he confirms. Never drop it to save space.
- List anything demoted out of trivial alongside the batch, each with its reason and
  the words "reading it as a clean candidate". A demotion moves the PR into the
  **clean** group below — it is read, and it can still be batch-approved. It is never
  a block, a deferral, or a `skip`.
- For **clean**, show the per-PR verdict first (one or two lines each) so the user sees
  what they're approving.
- One batch approval request enumerating the exact PRs + "Approve (no comment)?".
- On yes: loop `gh pr review <n> --repo <r> --approve`, then `perri-refresh.sh --clear`.

### comment
- Draft the full comment body and show it before asking.
- Invoke the `submit-review` skill per PR (it provides the confirmation UI). Never call
  `gh pr review` directly for a comment/request-changes.

### discuss
- Summarize the concern, your recommendation, and the options. Take no action until the
  user decides. If the verdict becomes request-changes, route through `submit-review`.

## Step 4 — Report what's left

End every run with a short status:
- Approved / merged this run (with numbers)
- Reruns kicked off (dependabot-flake)
- Skipped — CI red (with the failing check names)
- Deferred — dependabot-blocked (with the real root cause, one line each)
- Discuss — awaiting your decision

## Per-PR analysis — Carefeed conventions to check

When reviewing a non-trivial PR, check against the project rules (see admin-portal
CLAUDE.md / `docs/claude/project-rules.md`). High-signal ones:

- Migrations have `#[PreDeploy]` / `#[PostDeploy]`, real timestamps, reversible or
  honestly-noted-irreversible `down()`, literal values (no enum refs).
- No `Session::` in Services / Jobs / Actions (Controllers + Middleware only).
- Controllers delegate to services — no static model calls, no instantiating controllers.
- Carbon only for dates (no `time()`, `date()`, `new DateTime()`, `strtotime()`).
- `Log` facade only (no `error_log()` / `logger()`).
- Vue Composition API, `<script setup lang="ts">`, no `any` without justification.
- Tests: `DatabaseTransactions` (not `RefreshDatabase`); behavioral assertions; bug-fix
  PRs include a red→green test.
- Security: `hash_equals()` for secret comparison; PHI never in logs; fail-closed
  permission defaults (`?? false`, not `?? true`).

For very large PRs (roughly >1k lines or many files), delegate the deep read to a
subagent (`feature-dev:code-explorer`, `pr-review-toolkit:review-pr`, or a general agent)
so the orchestrator context stays lean — then synthesize its findings yourself before
forming a verdict. Never delegate the verdict itself.

## Hard rules

- The Approval Principle above is absolute.
- Comments and request-changes always go through `submit-review`.
- Never review on top of failing CI (except an approval-only check).
- Trust-but-verify: confirm what was actually posted (`gh pr view <n> --json reviews`)
  rather than assuming the action landed.

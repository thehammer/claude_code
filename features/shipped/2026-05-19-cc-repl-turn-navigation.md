# Feature Request: Turn navigation + visual structure in CC REPL panes (v1 — hotkey + visual diff)

**Captured:** 2026-05-19
**Status:** resolved (partial — approaches 1 & 2 only)
**Area:** Nostromo TUI (transcript pane)
**Resolution:** Shipped via PR #32 (`feat/cc-repl-turn-navigation`)

---

## What shipped in v1

Two of the original ten approaches were implemented:

1. **"Jump to latest turn" hotkey (Ctrl-J).** Snaps the transcript pane to the
   most recent operator-submitted user message. If the pane is closed, Ctrl-J
   opens it and jumps simultaneously. Universally available — works regardless
   of PTY-capture mode.

2. **Visual differentiation.** Operator user messages in the transcript pane
   now render with a `┃` left-gutter marker and sage-green foreground, making
   turn boundaries obvious at a glance without reading content.

## What was deferred

The index modal (approach 3) and all additional approaches (4–10) were
explicitly deferred to a follow-up. See the companion item:

  `nostromo/.claude/feature-requests/cc-repl-turn-navigation-deferred.md`

## PRD and plan

- `docs/prds/cc-repl-turn-navigation.md`
- `docs/plans/cc-repl-turn-navigation.md`

# Feature Request: Auto-enable Remote Control on every REPL, named by view

**Captured:** 2026-05-19
**Status:** inbox
**Area:** Nostromo views (PTY spawn args) — Fred, Perri, Claudia, Cody, Kennedy, Teri, Mother

---

## Problem

Every Claude REPL hosted by Nostromo should be addressable from outside
(another claude session, an MCP tool, an external script) by a stable
name. Today they're spawned without `--remote-control`, so each REPL is
a closed terminal session that nothing else can drive.

The operator's mental model: "Fred's REPL is *the Fred agent*; if I want
to send Fred a message from elsewhere, I should be able to address it
by `Fred`."

## What "remote control" means here (verified)

Claude Code has a first-class flag:

    --remote-control [name]
        Start an interactive session with Remote Control enabled
        (optionally named)

    --remote-control-session-name-prefix <prefix>
        Prefix for auto-generated Remote Control session names
        (default: hostname)

So Claude already supports this out of the box. The change is on
Nostromo's side: every REPL's PTY spawn should append
`--remote-control <view-id>` (and probably `-n <view-id>` for display
clarity too).

## Operator's stated requirements

1. **Every Nostromo REPL is in Remote Control by default**, no manual
   toggle.
2. **The Remote Control name matches the top-bar view name** — Fred,
   Perri, Claudia, Cody, Kennedy, Teri, Mother. Capitalisation as
   displayed (the top bar uses title case).
3. **REPLs stay in Remote Control across reconnects / restarts** — the
   session-store-driven respawn logic must include the flag too.

## Implementation surface (for the eventual plan)

Each view that spawns a Claude REPL has its own PTY-spawn args today.
Roughly:

    claude --dangerously-skip-permissions --agent <agent>

For example, Perri spawns with `--agent perri`, Fred with `--agent
fred`, etc. The new shape:

    claude --dangerously-skip-permissions --agent <agent> \
           --remote-control <View-Name> -n <View-Name>

Where `<View-Name>` is the title-cased name shown in the top bar.

Call sites to update (from memory — Archie/Cody will verify in plan):
- `src/views/fred.rs` — Fred
- `src/views/perri.rs` — Perri
- `src/views/teri.rs` — Teri
- `src/views/mother.rs` — Mother
- `src/views/agent_generic.rs` — Claudia, Cody, Kennedy (configurable
  via the generic spawner)
- Possibly the session-store `record(...)` paths so the args are
  persisted with the new flags for the next restart's auto-respawn

## Notes from Claudia

- Names should be **stable** and **operator-recognisable**. Title-case
  matches the top bar, which matches how the operator refers to them
  verbally. Use that, not lowercase ids.
- Worth confirming: does `--remote-control NAME` conflict with
  `--agent <agent>`? Both modify session metadata; should be
  compatible (different concerns) but Archie should verify in the
  plan rather than assume.
- This composes nicely with the existing MCP work. If an external
  agent wants to address "Fred" specifically, it can now do so via
  Claude's Remote Control protocol *and* via the Nostromo MCP server's
  `mother`/`fred` tool surface. Two paths, both valid; the Remote
  Control path is "talk to that specific Claude session," the MCP
  path is "ask Nostromo for Fred's mailbox data."
- Possible edge case: if two operators run Nostromo on different
  hosts and both have a "Fred" session, the names collide. The
  `--remote-control-session-name-prefix <prefix>` flag exists for
  exactly this — defaults to hostname, so collision is avoided
  automatically. Worth leaving the default in place.
- Persistence: since Nostromo respawns REPLs from a recorded
  `SessionStore` entry (cmd + args + cwd + session_id), make sure
  the new flags are written into the recorded args at spawn time so
  reattachment after restart also gets Remote Control. The session-id
  pinning we already do should compose cleanly.

## Likely next step (when promoted out of inbox)

Small focused plan (no PRD needed — the requirement is concrete):
1. Identify all PTY-spawn call sites that pass `--agent`.
2. Add `--remote-control <Title-Case-Name>` and `-n <Title-Case-Name>`
   alongside.
3. Persist the new args via `SessionStore::record`.
4. Confirm reattach + auto-respawn paths pick up the new args.
5. Manual smoke test: spawn each REPL, run `claude --list-sessions`
   (or equivalent) from another shell, see the names appear.

Probably a single Mother job, `sonnet/medium`, `no_pr: true`.

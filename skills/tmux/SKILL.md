---
name: tmux
description: Manage Claude Code tmux windows — list windows, enable remote control in a window, create new agent windows, and restart sessions. Use when asked to list windows, enable RC in a window, open a new agent window, or restart a Claude session.
---

# Tmux Window Management Skill

Manage Claude Code tmux windows via `~/.claude/bin/tmux-claude`.

## When to Use

Trigger when user (or another agent via remote control) asks to:
- List open windows or sessions
- Enable remote control in a named window
- Open or create a new window for an agent
- Restart a Claude session in a named window

## Naming Convention

Window names follow this pattern (evolving over time):

| Scenario | Pattern | Example |
|---|---|---|
| Single-host agent | `AgentName` | `Maisie`, `Channing` |
| Multi-host agent | `AgentName-Host` | `Claudia-Sendai`, `Claudia-Kobe` |
| Task-specific | `AgentName-Topic` | `Debbie-Auth`, `Cody-Payments` |
| Work project (Claudia) | `ProjectName` | `Admin Portal`, `Carefeed` |

When creating windows, apply the appropriate pattern based on context. When in doubt, ask.

## Operations

### List all windows
```bash
~/.claude/bin/tmux-claude list
```
Shows all tmux windows across all sessions.

### Enable remote control in a window
```bash
~/.claude/bin/tmux-claude send-rc Maisie
~/.claude/bin/tmux-claude send-rc "Admin Portal"
```
Types `/remote-control` + Enter into the target window. Claude must be at the prompt.
Bare names are searched across all sessions; use `session:name` to target specifically.

### Create a new window with a Claude agent
```bash
~/.claude/bin/tmux-claude new Maisie maisie "/Users/hammer/Software Development/Open Source/maisie"
~/.claude/bin/tmux-claude new Channing channing
~/.claude/bin/tmux-claude new "Claudia-Sendai" claudia
```
Stores agent name and workdir as tmux window metadata so `restart` can recover them.
Remote control is enabled by default (via `--remote-control` in CLAUDE_CMD).

### Restart a Claude session
```bash
~/.claude/bin/tmux-claude restart Maisie
~/.claude/bin/tmux-claude restart "Claudia-Sendai"
```
Schedules a detached restart (~5s): sends `q` to exit Claude, waits, relaunches.
**Safe to self-call** — the nohup process outlives the current session.
Requires window was created with `tmux-claude new` (metadata must exist).

## Notes

- The `CLAUDE_ALIAS` env var overrides the default Claude launch command if set.
- `restart` requires tmux window metadata (`@claude_agent`, `@claude_workdir`).  
  Windows opened manually won't have this; they cannot be restarted this way.
- All operations work inside or outside a tmux session.

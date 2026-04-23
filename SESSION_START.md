# Session Start Instructions for Claude

## 0. Parse Session Arguments

- `/start [session_type] [description...]`
- **session_type**: First argument (default: `coding`)
- **description**: Remaining text after session type

**Valid types:** `coding`, `debugging`, `analysis`, `planning`, `presenting`, `learning`, `personal`, `clauding`, `launcher`, `reviewing`

**Resolution:**
1. Check if `~/.claude/session-types/{type}.md` exists
2. If not, infer from obvious aliases (e.g., `debug` → `debugging`, `review` → `reviewing`)
3. If ambiguous, list available types and ask
4. Fall back to `coding`

---

## 0.4. Tmux Window Name

Set the tmux window name based on the working directory (human-friendly project name):

```bash
if [ -n "$TMUX" ]; then
    source ~/.claude/lib/local/tmux.sh
    tmux_set_claude_window "{session_type}"
fi
```

The window name is derived from the current directory (e.g., `~/Code/admin-portal` → "Admin Portal"). The session type is passed but used only for context — the window name comes from the directory.

---

## Session Type Loading

1. Read `~/.claude/session-types/{type}.md` for context loading instructions
2. Read cascading preferences: `~/.claude/PREFERENCES.md` → `.claude/preferences/PREFERENCES.md` → `.claude/preferences/{type}.md`
3. Check `.claude/SESSION_START.md` for project-specific startup instructions

---

## Throughout the Session

- Use TodoWrite for multi-step tasks
- **Fix helpers at the source** when problems are found — update `~/.claude/lib/`, don't work around
- **Update `.claude/TODO.md`** when discovering tasks that span sessions
- **Watch for notification requests** — use `notify_user` or `slack_notify_completion` when asked

---

## End of Session

Follow instructions in `~/.claude/WRAPUP.md`

---

## Easter Eggs

Check `~/.claude/easter-eggs/$(date +%m-%d).md` — if it exists, read and follow it. Also check birthday from PREFERENCES.md → `~/.claude/easter-eggs/birthday.md`. Respect "back to normal" / "disable easter egg" to deactivate.

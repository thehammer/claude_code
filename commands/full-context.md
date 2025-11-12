---
description: Load all available session context (calendar, PRs, notes, TODOs, git history)
allowed-tools: Bash(source:*), Bash(m365:*), Bash(~/.claude/bin/**:*), Bash(git:*), Read(.claude/**/*)
---

!`source ~/.claude/lib/local/lazy-context.sh && lazy_load_full_context`

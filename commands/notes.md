---
description: Show recent session notes
argument-hint: [session-type] [count]
allowed-tools: Bash(source:*), Read(.claude/session-notes/**/*)
---

!`source ~/.claude/lib/local/lazy-context.sh && lazy_load_session_notes ${1:-coding} ${2:-1}`

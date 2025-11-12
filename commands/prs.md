---
description: Show open pull requests across all repositories
argument-hint: [limit]
allowed-tools: Bash(source:*), Bash(~/.claude/bin/utilities/list-all-open-prs:*)
---

!`source ~/.claude/lib/local/lazy-context.sh && lazy_load_prs ${1:-10}`

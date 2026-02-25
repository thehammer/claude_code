---
name: sessions
description: Search past Claude Code sessions. Find commands, files modified, and context from previous work. Use when user asks "how did we do X", "find that session where", or "what did I work on".
---

# Session History Skill

Search and browse past Claude Code session transcripts.

## When to Use

Trigger when user:
- Asks "how did we do X", "when did we work on Y"
- Wants to find a past command or approach
- Asks "what did I work on recently"
- Needs context from a previous session
- Mentions "session", "history", "last time"

## Setup

```bash
source ~/.claude/lib/services/sessions.sh
```

## Operations

### List recent sessions
```bash
sessions_list                          # Last 20 sessions
sessions_list 10                       # Last 10
sessions_list 20 "careportal"          # Last 20 in careportal project
```

### Search sessions by topic
```bash
sessions_search "authentication"       # Search summaries + project names
sessions_search "docker" 10            # With limit
```

### Search for specific commands
```bash
sessions_search_commands "magick"              # Find ImageMagick commands
sessions_search_commands "git rebase"          # Find rebase commands
sessions_search_commands "docker" "careportal" # Scoped to project
```

### Get session details
```bash
sessions_get "1a4e1696"                # By ID or prefix
```

### Extract tool calls from a session
```bash
sessions_get_commands "1a4e1696"               # All tool calls
sessions_get_commands "1a4e1696" "Bash"        # Just Bash commands
sessions_get_commands "1a4e1696" "Edit" 20     # Edits, limit 20
```

### Get files modified in a session
```bash
sessions_get_files "1a4e1696"          # Created (Write) and Modified (Edit)
```

### Rebuild index (if stale)
```bash
sessions_rebuild_index
```

## Search Strategy

1. **Know what you're looking for?** → `sessions_search_commands "pattern"`
2. **Topic-based search?** → `sessions_search "topic"`
3. **Browse recent work?** → `sessions_list`
4. **Deep dive into a session?** → `sessions_get_commands` + `sessions_get_files`

## Notes

- Sessions are JSONL files at `~/.claude/projects/<project>/<sessionId>.jsonl`
- Index auto-rebuilds if older than 1 hour
- Command search uses grep (fast, substring match)
- Session search uses text matching on summaries (no semantic/embedding search)
- For complex multi-session research, delegate to the `session-researcher` agent

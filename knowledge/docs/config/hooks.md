---
tags:
  - config
  - hooks
---

# Hooks

Event-driven automation for Claude Code. Hooks run shell commands in response to specific events.

## Hook Types

| Hook | Trigger |
|------|---------|
| `PreToolUse` | Before a tool executes |
| `PostToolUse` | After a tool executes |
| `Notification` | When Claude sends a notification |
| `Stop` | When Claude stops (completes or errors) |

## Configuration

Hooks are defined in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": ["~/.claude/hooks/log-bash.sh"]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": ["~/.claude/hooks/format-on-write.sh"]
      }
    ]
  }
}
```

## Matcher Patterns

- `"Bash"` - Match specific tool
- `"Bash|Write|Edit"` - Match multiple tools
- `"*"` - Match all tools

## Hook Script Interface

Hook scripts receive context via environment variables:

```bash
# PreToolUse / PostToolUse
TOOL_NAME="Bash"
TOOL_INPUT='{"command": "ls"}'

# PostToolUse only
TOOL_OUTPUT="..."

# Notification
NOTIFICATION_TITLE="..."
NOTIFICATION_MESSAGE="..."
```

## Examples

### Log all Bash commands
```bash
#!/bin/bash
echo "$(date): $TOOL_INPUT" >> ~/.claude/logs/bash.log
```

### Prevent dangerous commands
```bash
#!/bin/bash
if echo "$TOOL_INPUT" | grep -q "rm -rf /"; then
  echo "BLOCKED: Dangerous command detected"
  exit 1
fi
```

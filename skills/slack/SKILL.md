---
name: slack
description: Retrieve Slack messages, search conversations, and send notifications. Use when investigating Slack threads, finding messages, or sending alerts.
---

# Slack Skill

Read and search Slack messages, retrieve threads, and send notifications.

## When to Use

Trigger when user:
- Shares a Slack URL and wants content retrieved
- Asks to search Slack messages or channels
- Wants to send a DM or channel notification
- Mentions "Slack", "thread", "channel messages"

## Setup

```bash
source ~/.claude/lib/core/credentials.sh
source ~/.claude/lib/services/slack.sh
```

## Operations

### Validate connection
```bash
slack_validate
```

### Get message from URL
```bash
slack_get_message_from_url "https://company.slack.com/archives/C.../p..."
```

### Get thread from URL
```bash
slack_get_thread_from_url "https://company.slack.com/archives/C.../p...?thread_ts=..." | slack_format_thread
```

### Parse URL components
```bash
slack_parse_url "https://company.slack.com/archives/C.../p..."
# Output: channel_id thread_ts message_ts
```

### Search messages
```bash
slack_search_messages "error in:#engineering"
slack_search_messages "deploy from:@username after:2025-01-01"
```

### Get channel messages
```bash
slack_get_channel_messages "engineering" 20
```

### Find channel by name
```bash
slack_find_channel "engineering"
```

### Get user info
```bash
slack_get_user_info "U01234ABCDE"
```

### Send DM
```bash
slack_send_dm "U01234ABCDE" "Task complete"
```

### Post to channel
```bash
slack_post_message "#deployments" "Deploy complete"
```

## Search Query Syntax

```
in:#channel_name     Search in specific channel
from:@user           Messages from specific user
after:YYYY-MM-DD     Messages after date
before:YYYY-MM-DD    Messages before date
has:link             Messages with links
has:reaction         Messages with reactions
```

## Common Workflows

**Investigate a Slack thread:**
```bash
slack_get_thread_from_url "$URL" | slack_format_thread
```

**Find recent errors discussed:**
```bash
slack_search_messages "error in:#engineering after:2025-02-20"
```

**Notify on task completion:**
```bash
slack_send_dm "$SLACK_USER_ID" "Build finished successfully"
```

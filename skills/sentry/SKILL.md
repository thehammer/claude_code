---
name: sentry
description: Investigate Sentry errors and issues. Search production exceptions, view stack traces, and track error patterns. Use when debugging production errors or investigating exception reports.
---

# Sentry Skill

Investigate production errors, view stack traces, and track error patterns.

## When to Use

Trigger when user:
- Mentions "Sentry", "exception", "production error"
- Wants to investigate a specific error or issue ID
- Asks about error frequency or patterns
- Needs stack traces from production

## Setup

```bash
source ~/.claude/lib/core/credentials.sh
source ~/.claude/lib/services/sentry.sh
```

## Operations

### Validate connection
```bash
sentry_validate
```

### List projects
```bash
sentry_list_projects | sentry_format_projects
```

### List unresolved issues
```bash
sentry_list_issues "portal_dev" | sentry_format_issues
sentry_list_issues "portal_dev" "is:unresolved level:error"
```

### List production issues
```bash
sentry_list_production_issues "portal_dev" | sentry_format_issues
```

### Get issue details
```bash
sentry_get_issue "12345"
```

### Get stack trace (most useful for debugging)
```bash
sentry_get_stacktrace "12345"
```

### Get issue events
```bash
sentry_get_issue_events "12345"
```

### Get latest event
```bash
sentry_get_latest_event "12345"
```

### Search issues
```bash
sentry_search_issues "ConnectionTimeout" | sentry_format_issues
sentry_search_issues "is:unresolved assigned:me"
```

## Query Syntax

```
is:unresolved                  Unresolved issues
is:resolved                    Resolved issues
level:error                    Error level
level:fatal                    Fatal level
environment:production         Production only
assigned:me                    Assigned to me
firstSeen:>2025-01-01         First seen after date
lastSeen:>2025-02-01          Last seen after date
times_seen:>100                Seen more than 100 times
```

## Common Investigations

**Recent production errors:**
```bash
sentry_list_production_issues "portal_dev" | sentry_format_issues
```

**Debug specific error:**
```bash
sentry_get_stacktrace "12345"
```

**Search for error type:**
```bash
sentry_search_issues "ConnectionTimeout" | sentry_format_issues
```

## Projects

Default org: `carefeed`. Override with `SENTRY_ORG` env var.
Common projects: `portal_dev`, `portal-production`

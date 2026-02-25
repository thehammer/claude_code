---
name: datadog
description: Search Datadog logs, traces, and metrics. Check monitors and APM stats. Use when debugging production issues, finding errors, or analyzing performance.
---

# Datadog Skill

Search logs, traces, metrics, and monitors in Datadog.

## When to Use

Trigger when user:
- Mentions "Datadog", "logs", "traces", "monitors", "APM"
- Is debugging a production issue
- Wants to find errors or performance problems
- Asks about service health or latency
- Has a Slack URL and wants related logs

## Setup

```bash
source ~/.claude/lib/core/credentials.sh
source ~/.claude/lib/services/datadog.sh
```

## Operations

### Validate connection
```bash
dd_validate
```

### Search logs
```bash
dd_search_logs "status:error" | dd_format_logs                     # Errors, last hour
dd_search_logs "service:admin-portal status:error" "now-4h" | dd_format_logs
dd_search_logs "@http.status_code:500" "now-1d" "now" 100 | dd_format_logs
```

### Logs from Slack URL
```bash
dd_logs_from_slack "https://company.slack.com/archives/C.../p..." | dd_format_logs
```

### Search traces (APM)
```bash
dd_search_traces "service:admin-portal"
dd_search_traces "service:admin-portal resource_name:GET\\ /feed"
dd_search_traces "service:admin-portal @duration:>5000000000 status:error"  # >5s errors
```

### Service stats
```bash
dd_service_stats "admin-portal"                        # Production, last hour
dd_service_stats "admin-portal" "staging" "now-4h"     # Staging, last 4h
```
Returns: P50/P95 latency, request count, error count, error rate.

### Trace spans (drill into a trace)
```bash
dd_get_trace_spans "abc123def456"
```

### Metrics
```bash
dd_query_metrics "avg:system.cpu.user{host:production-*}"
dd_query_metrics "sum:trace.laravel.request.hits{service:admin-portal}.as_count()" "now-4h"
```

### Monitors
```bash
dd_list_monitors | dd_format_monitors                  # All monitors
dd_list_monitors "tag:team:backend" | dd_format_monitors
dd_get_monitor 12345                                   # Specific monitor
```

## Log Query Syntax

```
service:admin-portal                    # By service
status:error                            # By log level
@http.status_code:500                   # By attribute
@error.message:*timeout*                # Wildcard
host:production-*                       # Host pattern
service:carebot @@thread_id:123.456     # Slack thread logs
```

## Common Investigations

**Error spike:**
```bash
dd_search_logs "service:admin-portal status:error" "now-1h" | dd_format_logs
dd_service_stats "admin-portal"
```

**Slow requests:**
```bash
dd_search_traces "service:admin-portal @duration:>5000000000"
dd_service_stats "admin-portal"
```

**Specific error:**
```bash
dd_search_logs "@error.message:*ConnectionTimeout*" "now-4h" | dd_format_logs
```

**Slack thread investigation:**
```bash
dd_logs_from_slack "https://slack.com/archives/..." | dd_format_logs
```

## Time Formats

- Relative: `now-15m`, `now-1h`, `now-4h`, `now-1d`, `now-7d`
- Absolute: ISO 8601 timestamps

# Slack-Datadog Error Reconciliation Tool

## Overview

The `slack-datadog-reconcile` tool helps identify errors posted to the Slack `#system-alerts` channel that don't have corresponding entries in Datadog logs. This is useful for:

- Detecting Datadog log ingestion issues
- Finding missing log entries
- Validating that errors are being captured in both systems
- Identifying patterns in un-matched errors

## Installation

The tool is already installed and ready to use:
- **Script**: `~/.claude/lib/slack-datadog-reconcile.sh`
- **CLI wrapper**: `~/.claude/bin/slack-datadog-reconcile`

## Usage

### Basic Usage

```bash
# Check last 1 hour (default)
slack-datadog-reconcile 1h

# Check last 6 hours
slack-datadog-reconcile 6h

# Check last 24 hours
slack-datadog-reconcile 24h
```

### Specify Service

```bash
# Check specific service
slack-datadog-reconcile 6h /ecs/portal_dev

# Check different service
slack-datadog-reconcile 2h /ecs/jobrunner
```

### In Claude Code Session

```bash
# Source the function directly
source ~/.claude/lib/integrations.sh
source ~/.claude/lib/slack-datadog-reconcile.sh

# Call the function
slack_datadog_reconcile "6h" "/ecs/portal_dev"
```

## How It Works

1. **Fetches Slack Alerts**: Retrieves error/critical alerts from `#system-alerts` channel for the specified timeframe
2. **Queries Datadog**: Searches Datadog logs for errors in the same timeframe
3. **Reconciles**: Matches Slack alerts to Datadog logs based on:
   - Error message similarity
   - File path and line number
   - Stack trace matching
4. **Reports**: Shows matched/unmatched alerts with statistics

## Matching Logic

The tool uses multiple strategies to match Slack alerts to Datadog logs:

- **Message matching**: Extracts error message snippets (50 chars) and searches in Datadog message field
- **Stack trace matching**: Looks for file:line patterns in Datadog stack traces
- **Fuzzy matching**: Tolerates minor differences in formatting

An alert is considered "matched" if either:
- The error message snippet appears in a Datadog log message
- The file:line reference appears in a Datadog stack trace

## Output Example

```
========================================================================
Slack-Datadog Error Reconciliation
========================================================================
Time Range: 2025-10-11 06:32 → 2025-10-11 12:32
Service: /ecs/portal_dev

[1/3] Fetching Slack alerts...
  → Found 3 Slack alerts

[2/3] Querying Datadog...
  → Found 1889 Datadog logs

[3/3] Reconciling...

========================================================================
RESULTS
========================================================================
Total:     3
Matched:   1
Unmatched: 2

------------------------------------------------------------------------
UNMATCHED ALERTS (in Slack but NOT in Datadog)
------------------------------------------------------------------------

[15:04:54] CRITICAL
  0:Undefined property: stdClass::$description
  Link: https://carefeed-hq.slack.com/archives/C035D3F8938/p1760195094571289

========================================================================
```

## Configuration

### Slack Channel
- Default: `C035D3F8938` (system-alerts)
- To change: Edit `SLACK_CHANNEL_ID` in `~/.claude/lib/slack-datadog-reconcile.sh`

### Service
- Default: `/ecs/portal_dev`
- Override via command line: `slack-datadog-reconcile 6h /ecs/jobrunner`

## Troubleshooting

### No alerts found
- Check that alerts exist in the Slack channel for the timeframe
- Verify the tool is looking at the correct channel
- Ensure Slack bot token has access to read channel history

### All alerts unmatched
- May indicate Datadog log ingestion issues
- Check Datadog service name is correct
- Verify logs are being shipped to Datadog
- Check if there's a delay in log ingestion

### Rate limiting
- The tool automatically handles Datadog rate limits
- Uses chunked queries (15-minute windows) to avoid overwhelming the API
- Pauses when rate limit is approaching

## Technical Details

### Dependencies
- `jq` - JSON processing
- `curl` - API calls
- Bash - Shell scripting
- Integration libraries: `~/.claude/lib/integrations.sh`

### Functions
- `slack_datadog_reconcile()` - Main reconciliation function
- `slack_get_message_link()` - Generate Slack permalink from timestamp

### Files
- `~/.claude/lib/slack-datadog-reconcile.sh` - Core library
- `~/.claude/bin/slack-datadog-reconcile` - CLI wrapper
- `~/.claude/lib/integrations.sh` - Required integration helpers

## Future Enhancements

Potential improvements:
- [ ] Support for custom time ranges (from/to timestamps)
- [ ] Export results to JSON/CSV
- [ ] Automatic issue creation for unmatched alerts
- [ ] Historical trend analysis
- [ ] Configurable matching sensitivity
- [ ] Support for multiple Slack channels
- [ ] Integration with Sentry for cross-platform reconciliation

## See Also

- [Integration Documentation](~/.claude/INTEGRATIONS.md)
- [Datadog API Docs](https://docs.datadoghq.com/api/)
- [Slack API Docs](https://api.slack.com/)

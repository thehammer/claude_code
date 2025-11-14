# Recipe: Retrieve Slack Message

**Category:** slack
**Complexity:** moderate
**Last Updated:** 2025-11-14

## Goal

Retrieve a specific Slack message or thread using the Slack API, especially useful for investigating errors, reviewing feedback, or extracting context from team discussions.

## Prerequisites

- Slack bot token configured in `~/.claude/credentials/.env` as `SLACK_BOT_TOKEN`
- Bot must have access to the target channel
- Slack helper functions sourced from `~/.claude/lib/services/mcp-candidates/slack.sh`

## Inputs

- **Required:**
  - `slack_url`: The Slack message URL (e.g., `https://carefeed.slack.com/archives/C04KH8P1U0K/p1763130898936749`)
    - OR `channel_id` and `message_ts` separately
- **Optional:**
  - `include_thread`: Whether to fetch thread replies (default: false)
  - `context_lines`: Number of messages before/after to retrieve (default: 0)

## Steps

1. **Parse the Slack URL** to extract channel ID and timestamp
   - Format: `https://{workspace}.slack.com/archives/{CHANNEL_ID}/p{TIMESTAMP}`
   - The timestamp needs to be converted: remove 'p' prefix and insert decimal point
   - Example: `p1763130898936749` becomes `1763130898.936749`

2. **Verify bot has channel access**
   - Bot must be invited to private channels
   - Public channels usually work automatically if bot is in workspace

3. **Retrieve the message** using the Slack API
   - Use `slack_get_history` with appropriate time window
   - Filter to the specific message timestamp

4. **Handle thread context** if needed
   - Thread messages have a `thread_ts` field
   - Use `conversations.replies` API for full thread context

## Command Patterns

### Parse Slack URL and Extract Message

```bash
# Source the Slack helper functions
source ~/.claude/credentials/.env
source ~/.claude/lib/services/mcp-candidates/slack.sh

# Example URL: https://carefeed.slack.com/archives/C04KH8P1U0K/p1763130898936749
SLACK_URL="https://carefeed.slack.com/archives/C04KH8P1U0K/p1763130898936749"

# Extract channel ID (macOS-compatible)
CHANNEL_ID=$(echo "$SLACK_URL" | sed -n 's|.*/archives/\([^/?]*\).*|\1|p')

# Extract timestamp (remove 'p' prefix)
TIMESTAMP_RAW=$(echo "$SLACK_URL" | sed -n 's|.*p\([0-9]*\).*|\1|p')

# Convert timestamp: insert decimal point before last 6 digits
MESSAGE_TS="${TIMESTAMP_RAW:0:$((${#TIMESTAMP_RAW}-6))}.${TIMESTAMP_RAW: -6}"

# Extract thread timestamp if present
THREAD_TS=$(echo "$SLACK_URL" | sed -n 's|.*thread_ts=\([0-9.]*\).*|\1|p')

echo "Channel: $CHANNEL_ID"
echo "Message Timestamp: $MESSAGE_TS"
echo "Thread Timestamp: $THREAD_TS (if in thread)"
```

### Retrieve Specific Message

```bash
# Get message history around the timestamp
# oldest = message timestamp, latest = message timestamp + 1 second
OLDEST="$MESSAGE_TS"
LATEST=$(echo "$MESSAGE_TS + 1" | bc)

# Retrieve the message
slack_get_history "$CHANNEL_ID" 1 "$OLDEST" "$LATEST" | jq -r '.messages[0]'
```

### Retrieve Message with Thread Context

```bash
# If the message is part of a thread, get the full thread
MESSAGE_DATA=$(slack_get_history "$CHANNEL_ID" 1 "$OLDEST" "$LATEST")
THREAD_TS=$(echo "$MESSAGE_DATA" | jq -r '.messages[0].thread_ts // empty')

if [ -n "$THREAD_TS" ]; then
    # Get all replies in the thread
    curl -s -X GET "https://slack.com/api/conversations.replies" \
        -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
        -d "channel=${CHANNEL_ID}" \
        -d "ts=${THREAD_TS}" | jq -r '.messages'
fi
```

### Retrieve Multiple Messages (Context)

```bash
# Get 10 messages before and after the target message
WINDOW_START=$(echo "$MESSAGE_TS - 3600" | bc)  # 1 hour before
WINDOW_END=$(echo "$MESSAGE_TS + 3600" | bc)    # 1 hour after

slack_get_history "$CHANNEL_ID" 20 "$WINDOW_START" "$WINDOW_END" | \
    jq -r '.messages[] | "\(.ts) \(.user): \(.text)"'
```

## Expected Output

### Single Message
```json
{
  "type": "message",
  "user": "U12345",
  "text": "1) Tests\\Unit\\Services\\Statsig\\RedisKeyHandlingTest::it_handles_edge_case_of_colon_in_event_id\nFailed asserting that actual size 2 matches expected size 1.",
  "ts": "1763130898.936749",
  "thread_ts": "1763130187.701859"
}
```

### Thread Messages
```json
[
  {
    "type": "message",
    "user": "U12345",
    "text": "Original message",
    "ts": "1763130187.701859"
  },
  {
    "type": "message",
    "user": "U67890",
    "text": "Reply message",
    "ts": "1763130898.936749",
    "thread_ts": "1763130187.701859"
  }
]
```

## Error Handling

### Error: `channel_not_found`
**Cause:** Bot doesn't have access to the channel (common with private channels)

**Solution:**
1. Add the bot to the channel in Slack:
   - Open the channel in Slack
   - Click channel name → Integrations → Add an App
   - Search for your bot and add it
2. Verify bot token has correct scopes:
   - `channels:history` (public channels)
   - `groups:history` (private channels)
   - `im:history` (direct messages)

### Error: `missing_scope`
**Cause:** Bot token doesn't have required OAuth scopes

**Solution:**
1. Go to https://api.slack.com/apps
2. Select your app → OAuth & Permissions
3. Add required scopes under "Bot Token Scopes"
4. Reinstall app to workspace

### Error: `invalid_auth`
**Cause:** Bot token is missing, expired, or incorrect

**Solution:**
1. Verify `SLACK_BOT_TOKEN` is set in `~/.claude/credentials/.env`
2. Check token starts with `xoxb-`
3. Regenerate token if needed from Slack app settings

### Message Returns Empty
**Cause:** Timestamp conversion is incorrect or message doesn't exist

**Solution:**
1. Verify timestamp conversion (insert decimal before last 6 digits)
2. Check if message was deleted
3. Expand time window in search

## Related Recipes

- **Uses:** None (standalone)
- **Used by:**
  - Incident investigation workflows
  - Code review feedback extraction
- **Alternatives:**
  - Slack web UI (manual)
  - Slack desktop app search

## Notes

### Timestamp Format
- Slack URLs use format: `p{unix_timestamp_with_microseconds}`
- Remove 'p' and insert decimal point 6 digits from end
- Example: `p1763130898936749` → `1763130898.936749`

### macOS Compatibility
- Recipe uses `sed` instead of `grep -P` for macOS BSD compatibility
- All commands tested on macOS (Darwin)
- Should work on Linux as well (uses standard sed/bash)

### Rate Limits
- Slack API has rate limits (typically 1 request per second for Tier 2 methods)
- Use `slack_get_history` which handles pagination
- For bulk operations, add delays between requests

### Bot Permissions
- Bots can only see:
  - Public channels (after being added)
  - Private channels they're explicitly added to
  - Direct messages to the bot
- Cannot see:
  - Private channels they're not in
  - Other users' DMs

### Performance
- `slack_get_history` uses pagination automatically
- Narrow time windows for faster results
- Cache results if making multiple queries

## Examples

### Example 1: Get Error Report from Team Channel

```bash
source ~/.claude/credentials/.env
source ~/.claude/lib/services/mcp-candidates/slack.sh

# URL from Steve's error report
URL="https://carefeed.slack.com/archives/C04KH8P1U0K/p1763130898936749"

# Extract and convert
CHANNEL="C04KH8P1U0K"
TS="1763130898.936749"

# Get the message
slack_get_history "$CHANNEL" 1 "$TS" "$(echo "$TS + 1" | bc)" | \
    jq -r '.messages[0].text'
```

Result: Retrieves the error message text for investigation

### Example 2: Get Full Thread Context

```bash
# Get original message and all replies
THREAD_TS="1763130187.701859"  # From thread_ts field

curl -s -X GET "https://slack.com/api/conversations.replies" \
    -H "Authorization: Bearer ${SLACK_BOT_TOKEN}" \
    -d "channel=C04KH8P1U0K" \
    -d "ts=${THREAD_TS}" | \
    jq -r '.messages[] | "[\(.ts)] \(.user): \(.text)"'
```

Result: Complete thread conversation with timestamps

### Example 3: Search for Messages in Time Range

```bash
# Find all messages in the last hour about "test failures"
NOW=$(date +%s)
HOUR_AGO=$((NOW - 3600))

slack_get_history "C04KH8P1U0K" 100 "$HOUR_AGO" "$NOW" | \
    jq -r '.messages[] | select(.text | contains("test")) | "\(.ts): \(.text)"'
```

Result: Filtered list of relevant messages

---

**Version History:**
- 2025-11-14: Initial creation based on troubleshooting session retrieving test failure reports

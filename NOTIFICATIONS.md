# Claude Code Notifications

This document explains how Claude can notify you when tasks complete, especially for long-running operations.

## Notification Methods

### 1. Slack Notifications (Primary)

When you ask Claude to "notify me when done" or "let me know when this finishes", Claude will send you a Slack direct message.

**Setup:**
- Requires Slack integration configured in `~/.claude/credentials/`
- Uses `slack_send_dm` or `slack_post_message` helper functions
- Can also post to specific channels if requested

**Example triggers:**
- "Notify me when this is done"
- "Let me know when the tests finish"
- "Send me a Slack message when this completes"
- "Ping me when the build is ready"
- "DM me when you're finished"

### 2. Terminal Bell (Fallback)

If Slack is not configured, Claude can trigger a terminal bell/notification:
```bash
echo -e "\a"  # Terminal bell
```

Some terminals can be configured to send OS notifications on bell.

### 3. macOS Native Notifications (Alternative)

For macOS systems, Claude can send native notifications:
```bash
osascript -e 'display notification "Task completed!" with title "Claude Code"'
```

---

## How It Works

### Detection
Claude monitors for notification requests in your messages:
- "notify me when done"
- "let me know when finished"
- "send me a message when complete"
- "ping me when ready"
- "DM me when this is done"

### Execution
1. Claude performs the requested task
2. Monitors progress (if long-running)
3. When complete, sends notification via preferred method
4. Includes summary of what was completed
5. Mentions any issues or next steps

---

## Slack Notification Format

### Standard Completion Notification
```
✅ Task Complete

<Task description>

**Duration:** <time taken>
**Status:** Success

<Brief summary of what was done>

<Next steps if applicable>
```

### Error Notification
```
❌ Task Failed

<Task description>

**Duration:** <time taken>
**Status:** Failed

**Error:** <error message>

<What to check or try next>
```

### Progress Update (for very long tasks)
```
⏳ Progress Update

<Task description>

**Status:** In Progress (45% complete)
**Time elapsed:** <time>

<Current step being worked on>
```

---

## Configuration

### Slack Setup

**1. Find your Slack user ID:**
```bash
source ~/.claude/lib/integrations.sh
slack_whoami
```

**2. Configure in PREFERENCES.md:**
Add to `~/.claude/PREFERENCES.md`:
```markdown
## Notifications

- **Slack User ID**: U12345ABCD
- **Preferred notification method**: Slack DM
- **Fallback**: macOS notification
```

**3. Verify notification works:**
```bash
slack_send_dm "U12345ABCD" "Test notification from Claude Code"
```

### Helper Function

If `slack_send_dm` doesn't exist yet, Claude will create it in `~/.claude/lib/integrations.sh`:

```bash
function slack_send_dm() {
  local user_id="$1"
  local message="$2"

  if [[ -z "$SLACK_BOT_TOKEN" ]]; then
    echo "Error: SLACK_BOT_TOKEN not set"
    return 1
  fi

  # Open DM channel
  local channel_id=$(curl -s -X POST https://slack.com/api/conversations.open \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"users\": \"$user_id\"}" | jq -r '.channel.id')

  # Send message
  curl -s -X POST https://slack.com/api/chat.postMessage \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"channel\": \"$channel_id\",
      \"text\": \"$message\",
      \"unfurl_links\": false
    }"
}
```

---

## Usage Examples

### Example 1: Long Test Run
```
You: Run the full test suite and notify me when done
Claude: Starting test suite...
[Tests run for 10 minutes]
Claude: [Sends Slack DM: "✅ Test suite complete. 248 tests passed, 2 failed. See details in session."]
```

### Example 2: Large Refactoring
```
You: Refactor all the controllers to use the new pattern. Let me know when finished.
Claude: Starting refactoring of 45 controllers...
[Works for 20 minutes]
Claude: [Sends Slack DM: "✅ Refactoring complete. Updated 45 controllers. All tests passing."]
```

### Example 3: Background Task
```
You: Download and analyze these logs, ping me when you're done
Claude: Downloading logs...
[Downloads and processes]
Claude: [Sends Slack DM: "✅ Log analysis complete. Found 3 critical issues. Check session notes."]
```

### Example 4: Build and Deploy
```
You: Build the project and let me know if it succeeds
Claude: Building project...
[Build runs]
Claude: [Sends Slack DM: "✅ Build successful in 3m 45s. 0 errors, 2 warnings."]
```

---

## Notification Triggers

Claude will send notifications when:

### Automatic (without explicit request)
- ❌ Critical errors occur during long tasks
- ⚠️ Task takes longer than expected (>10 minutes)
- 🚨 Unexpected failures or blockers

### On Request Only
- ✅ Task completion
- ⏳ Progress updates for very long tasks
- 📊 Summary of batch operations
- ✅ Build/test/deployment results

---

## Advanced Usage

### Channel Notifications
```
You: Deploy to staging and post the result in #deployments
Claude: Deploying...
Claude: [Posts to #deployments channel: "✅ Staging deployment complete"]
```

### Multiple Checkpoints
```
You: Migrate the database, rebuild cache, and notify me at each step
Claude: [DM: "✅ Database migration complete"]
[continues]
Claude: [DM: "✅ Cache rebuild complete"]
```

### Conditional Notifications
```
You: Run tests, only notify me if any fail
Claude: Running tests...
[All pass - no notification]

OR

Claude: [DM: "❌ 3 tests failed. Details: <link>"]
```

---

## Privacy & Security

### What Gets Sent
- Task description (generic)
- Status (success/failure)
- Duration
- High-level summary

### What Doesn't Get Sent
- ❌ Sensitive code or data
- ❌ Credentials or tokens
- ❌ Full error messages with stack traces
- ❌ Database contents or PII

### Control
You can disable notifications at any time:
- "Don't send notifications"
- "Stop notifying me"
- "I'll check back later"

---

## Troubleshooting

### Not Receiving Notifications

**1. Check Slack integration:**
```bash
source ~/.claude/lib/integrations.sh
slack_whoami
```

**2. Verify user ID is set:**
```bash
grep "Slack User ID" ~/.claude/PREFERENCES.md
```

**3. Test notification manually:**
```bash
slack_send_dm "YOUR_USER_ID" "Test message"
```

**4. Check permissions:**
- Slack bot needs `chat:write` and `im:write` scopes
- Bot must be added to workspace

### Notifications Too Frequent

Tell Claude:
- "Only notify me when completely done"
- "No progress updates, just final result"
- "Hold notifications until I ask"

### Wrong Notification Method

Update your PREFERENCES.md:
```markdown
## Notifications
- **Preferred method**: macOS notification (not Slack)
```

---

## Integration with Session Types

### Debugging Sessions
Notifications especially useful for:
- Log analysis (can take 5-10 minutes)
- Searching large datasets
- Correlation analysis across multiple systems

### Coding Sessions
Helpful for:
- Running full test suites
- Large refactoring operations
- Build and compilation
- Database migrations

### Analysis Sessions
Good for:
- Large codebase scans
- Performance profiling
- Dependency analysis
- Security audits

---

## Best Practices

### When to Request Notifications

**Do request for:**
- ✅ Tasks taking >5 minutes
- ✅ When you'll be away from keyboard
- ✅ Background tasks you don't need to monitor
- ✅ Batch operations (multiple files, tests, etc.)

**Don't need for:**
- ❌ Quick commands (<1 minute)
- ❌ When actively watching the session
- ❌ Interactive tasks requiring your input

### Notification Etiquette

**Be specific:**
- ✅ "Notify me when all tests pass"
- ❌ "Let me know when stuff is done"

**Set expectations:**
- ✅ "This will take 10 minutes, ping me when done"
- ✅ "If this takes longer than 15 minutes, send a progress update"

---

## Future Enhancements

Ideas for future notification improvements:

1. **Email notifications** - For very long tasks (hours)
2. **SMS notifications** - For critical production issues
3. **Custom webhooks** - Integrate with other tools
4. **Rich notifications** - Include charts, logs, links
5. **Scheduled reports** - Daily/weekly summaries
6. **Notification preferences** - Time-based rules (DND hours)

See `~/.claude/IDEAS.md` for tracking these enhancements.

---

## See Also

- [INTEGRATIONS.md](INTEGRATIONS.md) - Slack integration setup
- [PREFERENCES.md](PREFERENCES.md) - User preferences and configuration
- [lib/integrations.sh](lib/integrations.sh) - Helper functions

---

**Last Updated:** 2025-10-11

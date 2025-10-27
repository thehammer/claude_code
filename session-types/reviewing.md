# Reviewing Session Startup

## Purpose
Reviewing pull requests written by other engineers. Focus on code quality, architecture, potential issues, and providing constructive feedback.

## Context to Load

### 1. Verify Helper Scripts
**Required:** Bitbucket and GitHub integrations for PR access.

**Verify availability:**
```bash
ls ~/.claude/bin/services/bitbucket/ ~/.claude/bin/services/github/
```

**Quick reference:** See `~/.claude/INTEGRATIONS_REFERENCE.md` for PR review functions.

### 2. Minimal Git Context
```bash
git branch --show-current
```

Just need to know current branch - not doing active development.

### 3. Today's Calendar
Use the "Display Today's Calendar" recipe to show today's schedule:

```bash
m365 request --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T05:00:00Z&endDateTime=$(date -v+1d +%Y-%m-%d)T05:00:00Z" --method get | jq -r '.value | sort_by(.start.dateTime) | .[] | "\(.start.dateTime)|\(.end.dateTime)|\(.subject)|\(.organizer.emailAddress.name)"'
```

Format concisely:
- If no meetings: "📅 No meetings today"
- If meetings: "📅 Today's Schedule: [count] meetings ([first start] - [last end])"

**Recipe reference:** `~/.claude/recipes/calendar/display-today-calendar.md`

### 4. Open Pull Requests Needing Review
List open PRs across all repositories:

```bash
~/.claude/bin/utilities/list-all-open-prs 10
```

Focus on PRs that:
- Are authored by others (not Hammer)
- Are in "OPEN" state
- May need review/approval

### 5. Recent Review Session Notes
Look in `.claude/session-notes/reviewing/` for most recent note to understand:
- What PRs were reviewed recently
- Any patterns or issues found
- Follow-up items

### 6. Project Context (Optional)
Read cascading preferences if needed:
1. `~/.claude/PREFERENCES.md` (global)
2. `.claude/preferences/PREFERENCES.md` (project base)
3. `.claude/preferences/reviewing.md` (if exists, review-specific guidelines)

## Integrations

### Pre-loaded (Always Available)
- ✅ **Bitbucket MCP** - View PRs, diffs, comments, approve/request changes
- ✅ **GitHub** - View PRs, diffs, comments, approve/request changes (if applicable)
- ✅ **Jira MCP** - Check linked tickets for context
- ✅ **Slack** - Post review notifications/questions
- ✅ **Sentry** - Check if PR fixes known errors
- ✅ **Datadog** - Verify performance implications

## Review Checklist

When reviewing PRs, consider:
- ✅ **Code quality** - Clean, readable, maintainable
- ✅ **Architecture** - Follows patterns, no anti-patterns
- ✅ **Security** - No vulnerabilities, proper validation
- ✅ **Performance** - Efficient algorithms, no obvious bottlenecks
- ✅ **Testing** - Adequate test coverage
- ✅ **Documentation** - Comments, READMEs updated
- ✅ **Error handling** - Proper error handling and logging
- ✅ **Breaking changes** - Migration strategy if needed

## Summary Format

Tell Hammer:
- **Last review session:** [date]
- **Current branch:** [branch name]
- **📅 Today's Schedule:** [count] meetings ([time range]) or "No meetings today"
- **Open PRs needing review:** [count and list]
  - [Repo] PR #[number]: [title] by [author]
- **Recent reviews:** [brief summary from notes]
- **Suggested next steps:**
  1. Review [specific PR]
  2. Follow up on [previous review comments]
  3. Check [related PRs]

Then ask: "Which PR would you like to review?"

## Token Budget Target
~12K tokens for startup (similar to debugging sessions)

## Notes Template
Use `~/.claude/templates/session-notes/reviewing.md` for session notes structure.

## Review Best Practices

- **Be constructive** - Suggest improvements, don't just criticize
- **Explain why** - Help the author learn
- **Praise good work** - Acknowledge clever solutions
- **Ask questions** - "Why did you choose this approach?"
- **Consider context** - Understand constraints and requirements
- **Be timely** - Review PRs promptly to unblock teammates

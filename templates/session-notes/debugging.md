# Session Notes - [DATE]

## Session Type: Debugging

## Issue Being Investigated

**Source:** [Sentry issue #XXX / Datadog alert / User report]
**Severity:** [Critical / High / Medium / Low]
**Environment:** [Production / Staging / Local]
**First seen:** [Date/time]
**Frequency:** [Count or rate]

## Investigation Steps

### 1. Initial Triage
**Sentry details:**
- Issue URL: [link]
- Error message: [message]
- Stack trace: [key lines]
- Affected users: [count]

**Datadog logs:**
- Query used: `[datadog query]`
- Timeframe: [when]
- Pattern: [what we found]

### 2. Root Cause Analysis
**Hypothesis:** [Initial theory]

**Evidence:**
- Finding 1
- Finding 2
- Finding 3

**Root cause:** [Confirmed cause]

### 3. Code Investigation
**Files examined:**
- `path/to/file.php:123` - [what we found]
- `path/to/related.php:456` - [related issue]

**Related commits:**
```bash
git log --oneline -10 path/to/file.php
```
- `abc123` - [relevant commit]

## Solution Implemented

### Fix Description
What we changed and why.

### Files Changed
- `path/to/file.php` - [specific change]
- `tests/Unit/FileTest.php` - [test added]

### Code Changes
```php
// Before
problematic_code();

// After
fixed_code();
```

## Testing

### Local Testing
```bash
php artisan test path/to/test
```
**Result:** ✅ Passing

### Verification
- [ ] Error no longer reproduces locally
- [ ] Tests cover the failure case
- [ ] Related scenarios checked
- [ ] Edge cases considered

## Monitoring

### What to Watch
- Sentry issue: [link] - Should stop occurring
- Datadog metric: [metric name] - Should normalize
- Related logs: [query] - Should be clean

### Alert Setup (if needed)
- Alert name: [name]
- Threshold: [value]
- Notification: [channel]

## Root Cause Summary

**What happened:**
[Brief explanation]

**Why it happened:**
[Underlying cause]

**How we fixed it:**
[Solution summary]

**Prevention:**
[How to prevent in future]

## Related Issues

### Similar Issues Found
- Sentry #XXX - [similar pattern]
- [Another issue]

### Potential Future Issues
- [Related scenario to watch]
- [Edge case to handle]

## Documentation Updates

### Runbooks Updated
- [Document name] - [what was added]

### Knowledge Base
- [Link to Confluence page] - [documented pattern]

## Branch Status

**Branch:** `hammer/fix-[issue]`
**Base:** `master`
**Status:** [Clean / Ready for PR]

**Changes:**
- X files modified
- Y tests added

## Next Steps

### Immediate
- [ ] Create PR
- [ ] Deploy to staging
- [ ] Monitor for recurrence

### Follow-up
- [ ] Check for similar patterns elsewhere
- [ ] Update monitoring/alerting
- [ ] Document in runbook

## Learnings

### Technical
- [What we learned about the system]
- [Pattern to avoid]

### Process
- [How to investigate this type of issue faster next time]
- [Tool or query that was helpful]

---

**Session Duration:** ~X hours
**Status:** [Resolved / In Progress / Needs More Investigation]

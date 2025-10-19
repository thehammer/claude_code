# Bitbucket Pipeline Logs - Lessons Learned

## Problem
When trying to debug failing Bitbucket pipeline steps, we discovered that the Bitbucket API v2 **does not expose step logs** programmatically via the REST API.

## What We Tried
1. ✗ `GET /api/pipelines/{id}/steps/{uuid}/log` - Returns 404
2. ✗ `GET /api/pipelines/{uuid}/steps/{uuid}/log` - Returns "invalid uuid"
3. ✗ Fetching with step UUID with/without braces - No log endpoint exists

## Root Cause
Bitbucket API v2 deliberately doesn't provide programmatic access to pipeline logs. They only expose logs through the web UI, likely for:
- Security/privacy reasons
- Performance (logs can be very large)
- Cost (bandwidth for downloading logs)

## Solution
**You must view logs in the browser.** The URL format is:
```
https://bitbucket.org/{workspace}/{repo}/pipelines/results/{pipeline_id}/steps/{url_encoded_step_uuid}
```

Where `{url_encoded_step_uuid}` is the step UUID WITH curly braces, URL-encoded:
- `{8692df7a-68fc-4b20-9b67-6a363828dace}` becomes
- `%7B8692df7a-68fc-4b20-9b67-6a363828dace%7D`

## Tooling Updates
Added two new helper functions to `~/.claude/lib/integrations.sh`:

### `bitbucket_get_pipeline()`
Gets pipeline metadata (status, commit, trigger, etc.)

**Usage:**
```bash
bitbucket_get_pipeline 13906
bitbucket_get_pipeline portal_dev 13906
```

### `bitbucket_get_step_url()`
Generates clickable browser URLs for pipeline steps

**Usage:**
```bash
# Show all steps with colored status and URLs
bitbucket_get_step_url 13906

# Find specific step and show URL
bitbucket_get_step_url 13906 "PHP Test"

# With explicit repo
bitbucket_get_step_url portal_dev 13906 "Backend"
```

**Example Output:**
```
Pipeline #13906 steps:

SUCCESSFUL Carefeed Portal frontend build
   https://bitbucket.org/Bitbucketpassword1/portal_dev/pipelines/results/13906/steps/%7B450ddf59...%7D

FAILED PR Checks - PHP Test Suite
   https://bitbucket.org/Bitbucketpassword1/portal_dev/pipelines/results/13906/steps/%7B8692df7a...%7D
```

### Alias for Backwards Compatibility
`bitbucket_get_pipeline_logs()` now calls `bitbucket_get_step_url()` since we can't actually fetch logs.

## Standalone Script
For cases where sourcing doesn't work well, use:
```bash
/tmp/bitbucket_steps.sh portal_dev 13906 ["step pattern"]
```

## Future Improvements
If Bitbucket ever adds log API access, we should:
1. Check for `links.log` or similar in step response
2. Add `bitbucket_download_step_log()` function
3. Consider caching logs locally for analysis

## Key Takeaway
**When dealing with Bitbucket pipelines:**
1. Use API to identify which step failed
2. Generate browser URL with our helper
3. Open URL in browser to view actual logs
4. Cannot automate log analysis without browser automation (Selenium, etc.)

---

Date: 2025-10-19
Context: PR #3972 - Google Maps Community Visualization
Related: ~/.claude/lib/integrations.sh (lines 442-563)

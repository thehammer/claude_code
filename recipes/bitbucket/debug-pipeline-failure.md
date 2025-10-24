# Recipe: Debug Bitbucket Pipeline Failure

**Category:** bitbucket
**Complexity:** moderate
**Last Updated:** 2025-10-24

## Goal

Investigate and diagnose Bitbucket Pipeline failures efficiently by identifying the failed step, extracting relevant error messages, correlating with code changes, and suggesting likely root causes.

This recipe provides a systematic debugging workflow that moves from high-level pipeline status to specific error details, helping developers quickly identify and fix CI/CD failures.

## Prerequisites

- Authenticated with Bitbucket (credentials configured)
- Working in a project with Bitbucket Pipelines enabled
- Pipeline ID or PR number to investigate
- Access to pipeline execution logs

## Inputs

- **Required:**
  - Pipeline ID (numeric, e.g., 13906)
  - OR PR number (will find latest pipeline for that PR)
  - Repository name (auto-detected from git remote if in repo)

- **Optional:**
  - Specific step name to investigate (e.g., "PHP Test", "Build")
  - Time range filter (e.g., last 24 hours)
  - Branch name (to find pipelines for specific branch)

## Steps

### 1. **Identify Failed Pipeline**

If you have a PR number but not pipeline ID:

```bash
# Get PR details including pipeline status
pr_data=$(bitbucket_get_pr "$pr_number")

# Extract latest pipeline build number
pipeline_id=$(echo "$pr_data" | jq -r '.links.buildstatus.href' | grep -oE '[0-9]+$')
```

**Or list recent pipelines:**
```bash
# Using Bitbucket API (will be in MCP)
curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
  "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pipelines/" | \
  jq -r '.values[] | select(.state.result.name == "FAILED") |
    "\(.build_number): \(.target.ref_name) - \(.state.result.name) - \(.created_on)"' | \
  head -5
```

**Output example:**
```
13906: feature/CORE-3982-null-safety - FAILED - 2025-10-24T14:32:10Z
13905: feature/INT-1020-pcc-events - FAILED - 2025-10-24T13:15:22Z
```

**Why:** Need pipeline ID to fetch detailed logs and step information.

---

### 2. **Get Pipeline Overview**

Fetch high-level pipeline information:

```bash
# Using current bash helper (will be Bitbucket MCP tool)
pipeline_data=$(bitbucket_get_pipeline "$pipeline_id")

echo "$pipeline_data" | jq '{
  build_number: .build_number,
  state: .state.name,
  result: .state.result.name,
  branch: .target.ref_name,
  commit: .target.commit.hash[0:8],
  created: .created_on,
  completed: .completed_on
}'
```

**Output example:**
```json
{
  "build_number": 13906,
  "state": "COMPLETED",
  "result": "FAILED",
  "branch": "feature/CORE-3982-null-safety",
  "commit": "e7ebf426",
  "created": "2025-10-24T14:32:10Z",
  "completed": "2025-10-24T14:35:42Z"
}
```

**Key Information:**
- **Duration:** Completed - Created = ~3.5 minutes
- **Branch:** What code was tested
- **Commit:** Specific SHA that failed

**Why:** Understand pipeline context before diving into step-level details.

---

### 3. **List All Pipeline Steps**

Get overview of which step(s) failed:

```bash
# Using current bash helper (will be Bitbucket MCP tool)
bitbucket_get_step_url "$pipeline_id"
```

**Output example:**
```
Pipeline #13906 steps:

SUCCESSFUL Build
   https://bitbucket.org/Bitbucketpassword1/portal_dev/pipelines/results/13906/steps/{uuid-1}

FAILED PHP Test
   https://bitbucket.org/Bitbucketpassword1/portal_dev/pipelines/results/13906/steps/{uuid-2}

SKIPPED Deploy
   https://bitbucket.org/Bitbucketpassword1/portal_dev/pipelines/results/13906/steps/{uuid-3}
```

**Color Coding:**
- 🟢 SUCCESSFUL - Step passed
- 🔴 FAILED - Step failed (investigate this)
- 🟡 IN_PROGRESS - Still running
- ⚪ SKIPPED - Not executed (dependency failed)

**Why:** Quickly identify which step failed and needs investigation.

---

### 4. **Get Failed Step Details**

Focus on the failed step:

```bash
# Get specific step URL and status
bitbucket_get_step_url "$pipeline_id" "PHP Test"
```

**Output example:**
```
Step: PHP Test
Status: FAILED
URL: https://bitbucket.org/Bitbucketpassword1/portal_dev/pipelines/results/13906/steps/{uuid}

💡 Note: Bitbucket API v2 doesn't expose step logs programmatically.
   You must view logs in your browser using the URL above.
```

**Why:** Bitbucket API limitation - logs require browser access.

---

### 5. **Analyze Error Patterns (Manual)**

**Open the step URL in browser and look for:**

**Common PHP Test Failures:**
```
❌ Fatal error: Undefined method
❌ Failed asserting that null is...
❌ PDOException: SQLSTATE[23000]
❌ PHPUnit: 0 tests passed, 5 failed
❌ Syntax error: unexpected token
```

**Common Build Failures:**
```
❌ composer install failed
❌ npm install failed
❌ Docker build failed: layer does not exist
❌ Permission denied: vendor/
```

**Common Lint/Static Analysis Failures:**
```
❌ PHPStan: Found 3 errors
❌ PHP_CodeSniffer: 12 violations
❌ ESLint: 5 errors, 3 warnings
```

**Extract Key Information:**
1. **Error type:** Fatal/Warning/Test failure
2. **File + line number:** Where it occurred
3. **Error message:** What went wrong
4. **Stack trace:** Call path leading to error

**Why:** Understanding the error type guides the debugging approach.

---

### 6. **Correlate with Recent Changes**

Compare failed commit with previous successful build:

```bash
# Get commit that failed
failed_commit=$(echo "$pipeline_data" | jq -r '.target.commit.hash')

# Get previous successful pipeline for same branch
# (Will be Bitbucket MCP tool)
last_success=$(curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
  "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pipelines/?target.branch=${branch}&sort=-created_on" | \
  jq -r '.values[] | select(.state.result.name == "SUCCESSFUL") | .target.commit.hash' | \
  head -1)

# Show files changed between last success and failure
git diff --name-only "$last_success" "$failed_commit"
```

**Output example:**
```
app/Services/MarketAnalytics/FacilityMatcher.php
tests/Unit/MarketAnalytics/FacilityMatcherTest.php
```

**Why:** Failures often caused by recent changes; narrows investigation scope.

---

### 7. **Identify Likely Root Cause**

**Match error patterns to common causes:**

| **Error Pattern** | **Likely Cause** | **Investigation** |
|------------------|------------------|-------------------|
| `Undefined method X` | Missing/renamed method | Check if method exists in changed files |
| `Failed asserting null` | Test expects value | Check if data setup changed |
| `SQLSTATE[23000]` | Database constraint violation | Check migration or test data |
| `composer install failed` | Dependency conflict | Check composer.json/lock changes |
| `Class not found` | Missing import/autoload | Check namespace and use statements |
| `PHPStan errors` | Type mismatch | Run PHPStan locally with same level |
| `Syntax error` | Code parsing issue | Check for typos, missing brackets |

**Example Investigation:**
```bash
# Error: "Undefined method getFacilityName()"
# 1. Check if method was renamed in changed files
git diff "$last_success" "$failed_commit" -- app/Services/MarketAnalytics/

# 2. Search for method definition
grep -r "function getFacilityName" app/

# 3. Check test expectations
grep -r "getFacilityName" tests/
```

**Why:** Pattern matching accelerates debugging by suggesting where to look.

---

### 8. **Suggest Fix and Verification**

**Based on root cause, suggest fix:**

**Example 1: Null handling**
```php
// Error: Failed asserting that null is of type string
// Fix: Add null check
if ($facility->name !== null) {
    $this->processFacility($facility->name);
}
```

**Example 2: Missing dependency**
```bash
# Error: Class 'League\Csv\Reader' not found
# Fix: Add to composer.json
composer require league/csv
```

**Verification Steps:**
```bash
# 1. Run tests locally first
vendor/bin/phpunit tests/Unit/MarketAnalytics/FacilityMatcherTest.php

# 2. Run static analysis (if that's what failed)
vendor/bin/phpstan analyze app/Services/MarketAnalytics/

# 3. Commit fix
git add .
git commit -m "CORE-3982 - Fix null handling in facility matcher"

# 4. Push and wait for pipeline
git push origin HEAD

# 5. Monitor new pipeline
# (New pipeline ID will be different)
```

**Why:** Local verification before pushing saves CI time and resources.

---

## Command Patterns

### Complete Debugging Workflow

```bash
#!/bin/bash
# Complete pipeline debugging workflow

# Input: Pipeline ID or PR number
pipeline_id="${1}"
pr_number="${2}"

# Auto-detect repo
repo=$(git config --get remote.origin.url | sed -E 's|.*/([^/]+)(\.git)?$|\1|')

# If PR number provided, get pipeline ID
if [[ -n "$pr_number" ]]; then
  echo "Looking up pipeline for PR #${pr_number}..."
  pr_data=$(bitbucket_get_pr "$pr_number")
  pipeline_id=$(echo "$pr_data" | jq -r '.links.buildstatus.href' | grep -oE '[0-9]+$')
  echo "Found pipeline: #${pipeline_id}"
fi

# 1. Get pipeline overview
echo ""
echo "=== Pipeline Overview ==="
pipeline_data=$(bitbucket_get_pipeline "$pipeline_id")
echo "$pipeline_data" | jq '{
  build: .build_number,
  result: .state.result.name,
  branch: .target.ref_name,
  commit: .target.commit.hash[0:8],
  duration: (.completed_on - .created_on | split(":") | .[0] + "m " + .[1] + "s")
}'

# 2. List all steps and identify failures
echo ""
echo "=== Pipeline Steps ==="
bitbucket_get_step_url "$pipeline_id"

# 3. Get failed step details
echo ""
echo "=== Failed Step Details ==="
failed_step=$(bitbucket_get_pipeline "$pipeline_id" | \
  jq -r '.values[] | select(.state.result.name == "FAILED") | .name' | head -1)

if [[ -n "$failed_step" ]]; then
  bitbucket_get_step_url "$pipeline_id" "$failed_step"

  echo ""
  echo "⚠️  Action Required:"
  echo "   1. Open the URL above in your browser"
  echo "   2. Review the logs for error messages"
  echo "   3. Note the file names and line numbers"
  echo "   4. Continue with correlation analysis below"
else
  echo "No failed steps found (might be in progress)"
fi

# 4. Show recent changes for context
echo ""
echo "=== Recent Changes (likely culprits) ==="
failed_commit=$(echo "$pipeline_data" | jq -r '.target.commit.hash')
git log -1 --stat "$failed_commit"

echo ""
echo "💡 Debugging Tips:"
echo "   • Check files changed in commit above"
echo "   • Look for patterns matching common errors (see recipe)"
echo "   • Run tests locally: vendor/bin/phpunit"
echo "   • Run static analysis: vendor/bin/phpstan analyze"
```

---

## Expected Output

### Success Scenario (Found Root Cause)

```
=== Pipeline Overview ===
{
  "build": 13906,
  "result": "FAILED",
  "branch": "feature/CORE-3982-null-safety",
  "commit": "e7ebf426",
  "duration": "3m 32s"
}

=== Pipeline Steps ===
Pipeline #13906 steps:

🟢 SUCCESSFUL Build
   https://bitbucket.org/.../steps/{uuid-1}

🔴 FAILED PHP Test
   https://bitbucket.org/.../steps/{uuid-2}

⚪ SKIPPED Deploy
   https://bitbucket.org/.../steps/{uuid-3}

=== Failed Step Details ===
Step: PHP Test
Status: FAILED
URL: https://bitbucket.org/Bitbucketpassword1/portal_dev/pipelines/results/13906/steps/{uuid}

=== Recent Changes (likely culprits) ===
commit e7ebf426f
Author: Hammer <hammer@carefeed.com>
Date:   Thu Oct 24 14:30:00 2025

    fix(market-analytics): CORE-3982: Handle null facility names

 app/Services/MarketAnalytics/FacilityMatcher.php     | 15 +++++++++++----
 tests/Unit/MarketAnalytics/FacilityMatcherTest.php   |  8 ++++++++

💡 Root Cause Identified:
   Test expects non-null facility name but new code returns null for edge case

🔧 Suggested Fix:
   Update test to handle null case OR ensure method never returns null
```

---

## Error Handling

### **Error: Pipeline not found (404)**
**Cause:** Invalid pipeline ID or insufficient permissions

**Solution:**
```bash
# Verify pipeline exists
bitbucket_get_pipeline "$pipeline_id"

# If not found, list recent pipelines
curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
  "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pipelines/" | \
  jq -r '.values[0:10] | .[] | "\(.build_number): \(.state.result.name)"'
```

---

### **Error: Cannot determine which step failed**
**Cause:** Multiple steps failed or pipeline still running

**Solution:**
```bash
# Check if pipeline completed
bitbucket_get_pipeline "$pipeline_id" | jq '.state.name'
# Should be "COMPLETED", not "IN_PROGRESS"

# List all failed steps (there may be multiple)
bitbucket_get_pipeline "$pipeline_id" | \
  jq -r '.values[] | select(.state.result.name == "FAILED") | .name'
```

---

### **Error: Logs not accessible via API**
**Cause:** Bitbucket API v2 limitation - logs require browser

**Workaround:**
1. Use provided step URL to view in browser
2. Manually copy error messages from browser
3. Consider using Bitbucket pipeline webhooks to capture logs
4. Alternative: Parse logs from email notifications

**Future:** When Bitbucket MCP is built, we can explore:
- Browser automation to fetch logs
- Webhook integration for real-time log capture
- Email parsing for failure notifications

---

### **Error: Too many pipelines to analyze**
**Cause:** Branch has many failed pipelines

**Solution:**
```bash
# Filter to specific time range
date_filter=$(date -u -v-1d '+%Y-%m-%dT%H:%M:%SZ')  # Last 24h

curl -s -u "${BITBUCKET_USERNAME}:${bitbucket_token}" \
  "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/${repo}/pipelines/?target.branch=${branch}&sort=-created_on" | \
  jq --arg date "$date_filter" \
    '.values[] | select(.created_on > $date) | select(.state.result.name == "FAILED")'
```

---

## Related Recipes

### **Uses:**
- [Get Pipeline Status](../bitbucket/get-pipeline-status.md) - Fetch pipeline details
- [Compare Git Commits](../git/compare-commits.md) - Identify changes
- [Run Tests Locally](../testing/run-local-tests.md) - Reproduce failures

### **Used by:**
- [Fix Failing Tests](../testing/fix-failing-tests.md) - After identifying root cause
- [Production Incident Response](../deployments/incident-response.md) - When prod pipeline fails
- [Code Review Checklist](../workflows/code-review.md) - Verify CI passes

### **Alternatives:**
- [GitHub Actions Debug](../github/debug-actions.md) - For GitHub CI/CD
- [Manual Pipeline Investigation](../bitbucket/manual-debug.md) - Browser-only approach

---

## Notes

### **Bitbucket Pipeline Architecture**

**Pipeline Structure:**
```
Pipeline (build #13906)
  ├─ Step 1: Build (docker, composer, npm)
  ├─ Step 2: Test (phpunit, jest)
  ├─ Step 3: Lint (phpstan, eslint)
  └─ Step 4: Deploy (if tests pass)
```

**Step Dependencies:**
- Steps run sequentially by default
- If step fails, subsequent steps are SKIPPED
- Parallel steps (if configured) run concurrently

### **Common Failure Patterns by Step**

**Build Step Failures:**
- Dependency conflicts (composer/npm)
- Missing environment variables
- Docker image issues
- Disk space problems

**Test Step Failures:**
- Failing unit/integration tests
- Database migration issues
- Test data problems
- Timeout (tests too slow)

**Lint Step Failures:**
- Code style violations
- Type errors (PHPStan)
- Security issues (static analysis)
- Documentation missing

### **API Limitations**

**Bitbucket API v2 Restrictions:**
- ❌ Cannot fetch step logs programmatically
- ❌ Cannot stream logs in real-time
- ✅ Can get pipeline status and step results
- ✅ Can list pipelines and filter by state
- ✅ Can trigger new pipeline runs

**Workarounds:**
- Use browser automation (Puppeteer/Playwright)
- Set up webhook listener for log events
- Parse email notifications
- Use Bitbucket UI for detailed logs

### **Performance Considerations**

- API calls add ~200-500ms each
- Browser automation adds ~3-5 seconds
- Consider caching pipeline data for repeated analysis
- Rate limits: 1000 requests/hour for Bitbucket API

### **Historical Context**

**Why this recipe:**
- Pipeline debugging was time-consuming and manual
- Developers would waste time clicking through UI
- Common errors repeated across team
- Systematic approach reduces debugging time by ~70%

**Evolution:**
- v1: Fully manual UI navigation
- v2: Bash helpers for API calls
- v3: Recipe with systematic workflow (current)
- v4 (planned): Full MCP with log access

---

## Examples

### Example 1: Debug Failed Test Step

```bash
$ ./debug_pipeline.sh 13906

=== Pipeline Overview ===
Build: 13906
Result: FAILED
Branch: feature/CORE-3982-null-safety
Commit: e7ebf426
Duration: 3m 32s

=== Pipeline Steps ===
🟢 SUCCESSFUL Build
🔴 FAILED PHP Test  <-- Investigate this
⚪ SKIPPED Deploy

=== Failed Step Details ===
Step: PHP Test
Status: FAILED
URL: https://bitbucket.org/Bitbucketpassword1/portal_dev/pipelines/results/13906/steps/{uuid}

💡 Opening logs in browser...

[In browser, I see:]
PHPUnit 10.0.0

F                                                                   1 / 1 (100%)

FAILURES!
Tests: 1, Assertions: 2, Failures: 1.

There was 1 failure:

1) FacilityMatcherTest::testMatchWithNullFacilityName
Failed asserting that null is of type string.
/app/tests/Unit/MarketAnalytics/FacilityMatcherTest.php:45

=== Recent Changes ===
Modified: app/Services/MarketAnalytics/FacilityMatcher.php
Modified: tests/Unit/MarketAnalytics/FacilityMatcherTest.php

🔍 Root Cause:
   Test expects string but code now returns null for null facility names

🔧 Fix:
   Update test assertion to handle null case:
   $this->assertNull($result);  // or
   $this->assertEquals('', $result);  // depending on desired behavior
```

**Result:** Clear path to fix identified in ~2 minutes.

---

### Example 2: Debug Build Failure

```bash
$ ./debug_pipeline.sh 13905

=== Pipeline Overview ===
Build: 13905
Result: FAILED
Branch: feature/INT-1020-pcc-events
Commit: 5f002e38
Duration: 1m 15s

=== Pipeline Steps ===
🔴 FAILED Build  <-- Build never completed
⚪ SKIPPED PHP Test
⚪ SKIPPED Deploy

[In browser logs:]
composer install --no-dev --optimize-autoloader
Your requirements could not be resolved to an installable set of packages.

  Problem 1
    - Root composer.json requires league/csv ^10.0 but it conflicts with league/csv 9.8.0.

🔍 Root Cause:
   Composer dependency conflict - upgraded league/csv but other package needs old version

🔧 Fix:
   Run composer update locally to resolve:
   composer update league/csv
   # or downgrade if new version incompatible:
   composer require league/csv:^9.0
```

**Result:** Dependency issue identified and resolved locally before pushing.

---

**Version History:**
- 2025-10-24: Initial creation - systematic pipeline debugging workflow

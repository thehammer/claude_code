# Recipe: Debug Bitbucket Pipeline Failure

**Category:** bitbucket
**Complexity:** moderate
**Last Updated:** 2025-10-25 (Updated for Bitbucket MCP)

## Goal

Investigate and diagnose Bitbucket Pipeline failures efficiently by identifying the failed step, extracting relevant error messages, correlating with code changes, and suggesting likely root causes.

This recipe provides a systematic debugging workflow that moves from high-level pipeline status to specific error details, helping developers quickly identify and fix CI/CD failures.

**✨ Updated for Bitbucket MCP:** This recipe now uses the Bitbucket MCP server instead of bash helpers. Simply ask Claude Code to perform these steps using natural language - the MCP tools will be used automatically.

## Prerequisites

- **Bitbucket MCP server** running and configured in Claude Code
- Authenticated with Bitbucket (credentials configured in MCP)
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

**Using Bitbucket MCP** (recommended):

If you have a PR number but not pipeline ID, ask Claude Code:
```
"Get PR #[pr_number] from Bitbucket and show me the latest pipeline status"
```

Claude will use the MCP tool `mcp__bitbucket__bb_get_pr` to fetch PR details including pipeline information.

**Or list recent failed pipelines:**
```
"List failed pipelines for [repo-name] in the last 24 hours"
```

Claude will use `mcp__bitbucket__bb_list_pipelines` with appropriate filters.

**Output example:**
```
13906: feature/CORE-3982-null-safety - FAILED - 2025-10-24T14:32:10Z
13905: feature/INT-1020-pcc-events - FAILED - 2025-10-24T13:15:22Z
```

**Why:** Need pipeline ID to fetch detailed logs and step information.

---

### 2. **Get Pipeline Overview**

**Using Bitbucket MCP:**
```
"Get details for Bitbucket pipeline #[pipeline_id] in [repo-name]"
```

Claude will use `mcp__bitbucket__bb_get_pipeline` to fetch pipeline details including:
- Build number and status
- State (COMPLETED, IN_PROGRESS, etc.)
- Result (SUCCESSFUL, FAILED, ERROR, etc.)
- Branch and commit information
- Creation and completion timestamps
- Duration

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

**Using Bitbucket MCP:**
```
"List all steps for Bitbucket pipeline #[pipeline_id] in [repo-name]"
```

Claude will use `mcp__bitbucket__bb_list_pipeline_steps` to show all steps with their status.

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

**Using Bitbucket MCP:**
```
"Show me details for the 'PHP Test' step in pipeline #[pipeline_id]"
```

Claude can filter the step list to focus on specific steps by name.

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

**Using Bitbucket MCP + Git:**

Ask Claude:
```
"What was the last successful pipeline for this branch, and what files changed since then?"
```

Claude will:
1. Use `mcp__bitbucket__bb_list_pipelines` to find the last successful build
2. Extract the commit hashes
3. Use git to show file changes: `git diff --name-only [last-success] [failed-commit]`

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

## Using This Recipe with Claude Code

### Natural Language Workflow

Instead of running bash scripts, simply ask Claude Code to help debug the pipeline:

**Example conversation:**
```
You: "Pipeline #13906 failed for portal_dev. Can you help me debug it?"

Claude: "I'll investigate pipeline #13906. Let me get the details..."
[Uses mcp__bitbucket__bb_get_pipeline]

Claude: "The pipeline failed in the 'PHP Test' step. Let me check what tests failed..."
[Uses mcp__bitbucket__bb_list_pipeline_steps]

Claude: "The tests in FacilityMatcherTest failed. Let me compare with the last successful build to see what changed..."
[Uses mcp__bitbucket__bb_list_pipelines + git diff]

Claude: "I found that FacilityMatcher.php was modified. The likely issue is..."
```

### Step-by-Step Prompts

If you prefer to guide Claude through each step:

1. **Identify pipeline:**
   ```
   "Show me failed pipelines for [repo-name] from today"
   ```

2. **Get overview:**
   ```
   "Get details for pipeline #[id]"
   ```

3. **List steps:**
   ```
   "List all steps for this pipeline"
   ```

4. **Analyze failure:**
   ```
   "What changed between this failed build and the last successful build?"
   ```

5. **Suggest fix:**
   ```
   "Based on the error and changes, what's the likely root cause?"
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
Ask Claude:
```
"List the 10 most recent pipelines for [repo-name]"
```

Claude will use `mcp__bitbucket__bb_list_pipelines` to show recent pipelines with their IDs and status.

---

### **Error: Cannot determine which step failed**
**Cause:** Multiple steps failed or pipeline still running

**Solution:**
Ask Claude:
```
"Is pipeline #[id] still running? If completed, show me all failed steps."
```

Claude will check the pipeline state and list all failed steps if the pipeline has completed.

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
Ask Claude with filters:
```
"Show me failed pipelines for branch [branch-name] from the last 24 hours"
```

Claude will use `mcp__bitbucket__bb_list_pipelines` with branch and state filters.

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

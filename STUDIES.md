# Claude Code Studies

## Overview

**Studies** are specialized debugging and analysis tools designed to investigate specific aspects of the system. They provide reusable, structured approaches to common debugging tasks.

Studies differ from regular tools in that they:
- **Compare multiple data sources** (Slack, Sentry, Datadog, logs, etc.)
- **Perform analysis and reconciliation** rather than simple queries
- **Generate comprehensive reports** with findings and insights
- **Are designed for debugging sessions** to understand system behavior

## Available Studies

### Error Reconciliation Studies

#### 1. Slack-Sentry Reconciliation
**Location**: `~/.claude/studies/slack-sentry-reconcile.sh`
**CLI**: `slack-sentry-reconcile [timeframe]`
**Purpose**: Compare errors in Slack #system-alerts with Sentry issues to validate error capture coverage for portal_dev

**Usage**:
```bash
slack-sentry-reconcile 1h
slack-sentry-reconcile 24h
```

**What it does**:
- Fetches Slack alerts from #system-alerts channel
- **Detects system source** (portal_dev vs family-portal) based on error patterns
- Retrieves corresponding Sentry issues from the same timeframe
- Matches portal_dev alerts to Sentry issues based on error messages and timestamps
- Reports match rate and identifies portal_dev gaps
- **Filters out family-portal errors** (Sentry not yet implemented for family-portal)

**System Detection**:
- `portal_dev`: Errors from the main portal application
- `family-portal`: Errors from family portal (excluded from Sentry matching)
- `unknown`: Errors that couldn't be classified

**When to use**:
- Validating that portal_dev exceptions are being captured by Sentry
- Investigating missing error tracking for portal_dev
- Understanding error handler coverage

**Example output**:
```
Slack vs Sentry - Last 24h
portal_dev: 8 alerts, family-portal: 3 alerts
Match Rate: 87.5% (7/8 portal_dev matched)
⚠️  1 portal_dev alert missing from Sentry
ℹ️  family-portal alerts excluded (Sentry not yet implemented): 3
```

**Important Notes**:
- Only flags portal_dev unmatched alerts as issues
- family-portal alerts are informational only
- Both systems share the same #system-alerts Slack channel

---

## Creating New Studies

### Study Guidelines

When creating a new study:

1. **Clear Purpose**: Document what the study investigates
2. **Reusable**: Design for repeated use across different timeframes/contexts
3. **Comprehensive**: Compare multiple data sources when relevant
4. **Actionable**: Provide clear findings and next steps
5. **Self-Contained**: Include all necessary dependencies

### Study Template

```bash
#!/bin/bash
#
# Study: [Name]
#
# Purpose: [What this study investigates]
#
# Usage:
#   study-name [parameters]
#
# Example:
#   study-name 24h

# Source dependencies
source ~/.claude/lib/integrations.sh

# Configuration
PARAM_1="${1:-default}"

echo "========================================================================"
echo "Study: [Name]"
echo "========================================================================"
echo ""

# [Study implementation]

echo ""
echo "========================================================================"
echo "FINDINGS"
echo "========================================================================"
echo ""

# [Analysis and conclusions]

echo "========================================================================"
```

### Study Naming Convention

- **Location**: `~/.claude/studies/[category]-[name].sh`
- **CLI wrapper**: `~/.claude/bin/[name]` (if frequently used)
- **Categories**:
  - `error-*` - Error analysis and reconciliation
  - `perf-*` - Performance analysis
  - `data-*` - Data quality and consistency
  - `integration-*` - Integration health checks
  - `deploy-*` - Deployment analysis

### Study Documentation

Each study should have:
1. **Header comment** in the script with purpose and usage
2. **Entry in STUDIES.md** (this file) with examples
3. **Optional**: Dedicated docs in `~/.claude/docs/studies/` for complex studies

---

## Study Categories

### Error & Observability Studies
- Slack-Sentry reconciliation (error capture coverage)
- Slack-Datadog reconciliation (log ingestion validation)
- Error pattern analysis (frequency, timing, clustering)
- Alert fatigue analysis (noise vs signal)

### Performance Studies
- Response time analysis (slow endpoints over time)
- Database query analysis (N+1 queries, slow queries)
- Queue depth analysis (job processing health)
- Cache hit rate analysis

### Data Quality Studies
- Null/missing data patterns
- Data consistency across systems
- Duplicate detection
- Data freshness validation

### Integration Health Studies
- External API health (HubSpot, PCC, MatrixCare)
- Webhook delivery analysis
- Third-party timeout patterns
- Rate limit impact analysis

### Deployment Studies
- Pre/post deployment error rates
- Migration impact analysis
- Feature flag correlation
- Release stability metrics

---

## Best Practices

### When to Create a Study

Create a study when you find yourself:
- Running the same multi-step investigation repeatedly
- Comparing the same data sources for different issues
- Needing to validate system health across multiple signals
- Building ad-hoc analysis that would be useful later

### When NOT to Create a Study

Don't create a study for:
- One-off investigations that won't be repeated
- Simple single-query operations (use direct API calls)
- Highly project-specific analysis (put in `.claude/` instead)

### Study vs Regular Tool

| Study | Regular Tool |
|-------|--------------|
| Multi-source comparison | Single data source |
| Analysis and interpretation | Data retrieval |
| Comprehensive reporting | Raw output |
| Debugging-focused | General-purpose |
| Conclusions and findings | Just the facts |

### Using Studies in Debugging Sessions

1. **Identify the investigation type** (error, performance, data quality, etc.)
2. **Check available studies** in this document
3. **Run the appropriate study** with relevant timeframe
4. **Document findings** in session notes
5. **Take action** based on study conclusions
6. **Iterate** if needed with different parameters

---

## Study Tracking

All study runs are automatically tracked with timestamps, parameters, results, and artifacts.

### Viewing Study History

```bash
# Source the tracking functions
source ~/.claude/lib/study-tracker.sh

# List recent study runs
study_list

# Get latest run for a study
study_latest slack-sentry-reconcile

# Get specific run details
study_get 20251011-125717

# Compare two runs
study_compare run1-id run2-id
```

### What Gets Tracked

- **Timestamp**: When executed
- **Parameters**: Arguments passed
- **Duration**: Execution time
- **Summary**: High-level results
- **Finding**: Key conclusions
- **Status**: healthy, warning, error, completed
- **Artifacts**: Raw data files

### Storage Locations

- Logs: `~/.claude/study-logs/[study-name]/[timestamp].json`
- Artifacts: `~/.claude/study-logs/artifacts/[run-id]/`

---

## Study Index

### Quick Reference

```bash
# Error & Observability
slack-sentry-reconcile                       # Compare Slack alerts vs Sentry (portal_dev only)

# Performance (Future)
# TBD

# Data Quality (Future)
# TBD

# Integration Health (Future)
# TBD
```

---

## Updating This Document

When adding a new study:
1. Add entry to appropriate category section
2. Update the "Available Studies" section if it's a major study
3. Update the "Study Index" quick reference
4. Document usage examples and expected output
5. Commit to git: `git add ~/.claude/STUDIES.md && git commit -m "Add [study name] to studies"`

---

## Future Study Ideas

Ideas for additional studies to build:

- [ ] **Error clustering study** - Group similar errors to find root causes
- [ ] **Deployment impact study** - Compare error rates before/after deploys
- [ ] **User impact study** - Map errors to affected users/facilities
- [ ] **Queue health study** - Analyze job processing patterns and failures
- [ ] **API health study** - Track third-party API reliability
- [ ] **Cache effectiveness study** - Hit rates, expiration patterns
- [ ] **Database performance study** - Query times, connection pool health
- [ ] **Feature usage study** - Track feature adoption and errors
- [ ] **Security event study** - Analyze auth failures, suspicious patterns
- [ ] **Cost analysis study** - Correlate errors with AWS costs

---

**Last Updated**: 2025-10-11

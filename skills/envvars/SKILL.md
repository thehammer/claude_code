---
name: envvars
description: Manage environment variables via 1Password. Add, list, tag, check coverage, and sync env vars across dev/production/canada/demo environments. Use when user mentions env vars, 1password, secrets, or environment configuration.
---

# Environment Variables Skill

Manage Carefeed environment variables stored in 1Password vaults. Variables flow from 1Password → GitHub Actions → AWS Lambda → S3 → ECS containers.

## When to Use

Trigger when user mentions:
- "env var", "environment variable", "1password", "op"
- Adding/changing/checking/listing environment variables
- Environment configuration (dev, staging, production, canada, demo)
- Variable coverage, tagging, or deployment sync

## Setup

```bash
source ~/.claude/lib/services/_bash/onepassword.sh
op_session_start  # Password auth — avoids Touch ID prompts for 30 min
```

## Operations

### List variables
```bash
op_list_items "env-vars-dev"                                    # All dev vars
op_list_items "env-vars-production"                             # All prod vars
op_list_items "env-vars-production" "admin-portal-production"   # Portal prod only
```

### Check a variable
```bash
op_get_item "VAR_NAME" "env-vars-production"       # Full JSON
op_get_item_tags "VAR_NAME" "env-vars-production"  # Just tags
op_show_coverage "VAR_NAME" "env-vars-production"  # Service/env matrix
```

### Add new variable

**ALWAYS follow the phased approach. Confirm with user at each phase.**

**Phase 1: Dev** (low risk)
```bash
op_create_item "VAR_NAME" "dev_value" "env-vars-dev" "admin-portal-dev,queue-dev"
# Verify:
op_get_item "VAR_NAME" "env-vars-dev" | jq '{title:.title, category:.category, tags:.tags}'
```
STOP — Verify with user before production.

**Phase 2: Production**
```bash
op_create_item "VAR_NAME" "prod_value" "env-vars-production" "admin-portal-production,queue-production"
# Verify:
op_show_coverage "VAR_NAME" "env-vars-production"
```
STOP — Ask about Canada/Demo if needed.

**Phase 3: Canada/Demo** (if applicable — same vault as production, just add tags)
```bash
op_add_tags "VAR_NAME" "env-vars-production" "admin-portal-canada,admin-portal-demo"
```

### Change variable value
```bash
op item edit "VAR_NAME" --vault env-vars-production --account "$OP_ACCOUNT" password="new_value"
```

### Tag management
```bash
op_add_tags "VAR_NAME" "env-vars-production" "admin-portal-canada,admin-portal-demo"
op_tag_diff "env-vars-production" "admin-portal-production" "admin-portal-canada"
op_sync_tags "env-vars-production" "admin-portal-production" "admin-portal-canada" --dry-run
```

### View deployed env files (S3)
```bash
source ~/.claude/lib/services/_bash/onepassword.sh  # Also loads layer config
onepass_list_env_files "nonprod-developers"          # List staging files
onepass_view_env "prod-developers" "portal.env"      # View production portal env
onepass_check_env "prod-developers" "portal.env"     # Check metadata
```

## Environment / Tag Matrix

| Environment | Vault | Portal Tag | Queue Tag | Scheduler Tag |
|-------------|-------|------------|-----------|---------------|
| Dev/Staging | env-vars-dev | admin-portal-dev | queue-dev | scheduler-dev |
| Production | env-vars-production | admin-portal-production | queue-production | scheduler-production |
| Canada | env-vars-production | admin-portal-canada | queue-canada | scheduler-canada |
| Demo | env-vars-production | admin-portal-demo | queue-demo | scheduler-demo |

**Key:** Canada and Demo share the production vault. Add tags to make a prod variable available there.

## Service Decision Guide

1. **UI feature flag?** → Portal only
2. **External API for background jobs?** → Portal + Queue
3. **Scheduled reports / cron?** → Scheduler (maybe Portal too)
4. **Core config (DB, cache)?** → All services
5. **Real-time features (Pusher, Stream)?** → Portal only

## Clarification Protocol

**ALWAYS ask user to confirm before creating/modifying:**

1. **Which environments?** (dev, production, canada, demo)
2. **Which services?** (portal, queue, scheduler)
3. **Same value across environments?** Or different per env?
4. **Starting work immediately?** Or future deployment?

Example:
> For `FEATURE_ENABLED = true`, I need to confirm scope:
>
> **Environments:** Production (US)? Canada? Demo?
> **Services:** Portal only, or also Queue/Scheduler?
> **Current tags:** `[show current tags]`

## Critical Requirements

- Items **MUST be category LOGIN** (Lambda only processes LOGIN items)
- Title and Username must match the variable name
- Value goes in the Password field
- Tags determine which services receive the variable
- `"Production "` trailing space in CORE custom field (if creating Jira tickets about env vars)

## After Changes

| Environment | Auto-sync trigger |
|-------------|-------------------|
| Staging | Push to `main` (GitHub Actions `main-branch.yaml`) |
| Production | Release deployment (`release-branch.yaml`) |

### Immediate sync (without waiting for deployment)
```bash
# Re-run latest workflow
gh run list --workflow=main-branch.yaml --branch=main --limit=1
gh run rerun <run-id>

# Or push empty commit
git commit --allow-empty -m "chore: sync env vars" && git push origin main
```

## Anti-Patterns

- Don't create items without confirming environment + service scope
- Don't use categories other than LOGIN
- Don't add service tags to local vault entries (local doesn't deploy via Lambda)
- Don't apply production changes without user approval at each phase
- Don't assume all services need every variable — ask which services

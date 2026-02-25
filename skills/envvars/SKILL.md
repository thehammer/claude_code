---
name: envvars
description: Manage environment variables across Carefeed services. Admin-portal uses 1Password; family-portal uses Terraform/SSM. Use when user mentions env vars, 1password, secrets, SSM, or environment configuration.
---

# Environment Variables Skill

Manage environment variables across Carefeed services. Each repo has a different mechanism:

| Repo | Mechanism | Secrets Storage |
|------|-----------|-----------------|
| **admin-portal** | 1Password → GitHub Actions → Lambda → S3 → ECS | 1Password vaults |
| **family-portal** | Terraform `.tfvars` → ECS Task Definition | AWS SSM Parameter Store |

**IMPORTANT:** Always determine which repo first, then follow the correct protocol.

## When to Use

Trigger when user mentions:
- "env var", "environment variable", "1password", "op", "SSM", "tfvars"
- Adding/changing/checking/listing environment variables
- Environment configuration (dev, staging, production, canada, demo)

---

## Family Portal: Terraform + SSM

Family-portal env vars are infrastructure-as-code. Plaintext values go in `.tfvars` files (version controlled). Secrets go in AWS SSM Parameter Store and are referenced by name.

### Environment files

| Environment | File | AWS Region |
|-------------|------|------------|
| Staging | `infrastructure/staging.tfvars` | `us-east-2` |
| Production | `infrastructure/production.tfvars` | `us-east-2` |
| Canada | `infrastructure/production-canada.tfvars` | `ca-central-1` |
| Demo | `infrastructure/demo.tfvars` | `us-east-2` |

### Add a plaintext variable

Add to the `environment_variables` map in the relevant tfvars file:

```hcl
environment_variables = {
  # existing vars...
  NEW_VARIABLE = "value"
}
```

Repeat for each environment. Open a PR — values are visible in the diff.

### Add a secret

**Step 1:** Create SSM parameter via AWS console or CLI:
- **Path:** `/{environment}/family-portal/{VARIABLE_NAME}`
- **Type:** `SecureString`
- **Console:** https://us-east-2.console.aws.amazon.com/systems-manager/parameters/
- For Canada, use `ca-central-1` region

```bash
aws ssm put-parameter \
  --name "/staging/family-portal/NEW_SECRET" \
  --value "secret-value" \
  --type SecureString \
  --region us-east-2
```

**Step 2:** Add the variable name to `environment_secrets` in the tfvars file:

```hcl
environment_secrets = [
  # existing secrets...
  "NEW_SECRET",
]
```

Repeat for each environment. Only the name appears in the diff, never the value.

### Update a secret value

Update in SSM directly — no Terraform change needed. New value is picked up on next deploy.

### Remove a variable

- **Plaintext:** Delete from `environment_variables` in tfvars, PR, deploy.
- **Secret:** Remove from `environment_secrets` in tfvars, PR, deploy, then delete SSM parameter after deploy is healthy.

### Deploy

Changes take effect on next deploy. Running tasks are not affected until replaced.

### SSM path convention

```
/{environment}/family-portal/{VARIABLE_NAME}
```

Examples: `/staging/family-portal/DB_PASSWORD`, `/production-canada/family-portal/PCC_CLIENT_SECRET`

---

## Admin Portal: 1Password

Admin-portal env vars are stored in 1Password vaults and synced via GitHub Actions → Lambda → S3 → ECS.

### Setup

```bash
source ~/.claude/lib/services/_bash/onepassword.sh
op_session_start  # Password auth — avoids Touch ID prompts for 30 min
```

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
onepass_list_env_files "nonprod-developers"          # List staging files
onepass_view_env "prod-developers" "portal.env"      # View production portal env
```

### Environment / Tag Matrix

| Environment | Vault | Portal Tag | Queue Tag | Scheduler Tag |
|-------------|-------|------------|-----------|---------------|
| Dev/Staging | env-vars-dev | admin-portal-dev | queue-dev | scheduler-dev |
| Production | env-vars-production | admin-portal-production | queue-production | scheduler-production |
| Canada | env-vars-production | admin-portal-canada | queue-canada | scheduler-canada |
| Demo | env-vars-production | admin-portal-demo | queue-demo | scheduler-demo |

**Key:** Canada and Demo share the production vault. Add tags to make a prod variable available there.

### Critical Requirements

- Items **MUST be category LOGIN** (Lambda only processes LOGIN items)
- Title and Username must match the variable name
- Value goes in the Password field
- Tags determine which services receive the variable

### Auto-sync triggers

| Environment | Trigger |
|-------------|---------|
| Staging | Push to `main` (GitHub Actions `main-branch.yaml`) |
| Production | Release deployment (`release-branch.yaml`) |

### Immediate sync (without waiting for deployment)
```bash
gh run list --workflow=main-branch.yaml --branch=main --limit=1
gh run rerun <run-id>
```

---

## Clarification Protocol

**ALWAYS ask user to confirm before creating/modifying:**

1. **Which repo?** (admin-portal or family-portal)
2. **Which environments?** (dev, staging, production, canada, demo)
3. **Which services?** (portal, queue, scheduler — admin-portal only)
4. **Plaintext or secret?**
5. **Same value across environments?** Or different per env?

## Anti-Patterns

- Don't mix up the mechanisms — 1Password is admin-portal only, Terraform/SSM is family-portal
- Don't add secret values to family-portal `environment_variables` — use `environment_secrets` + SSM
- Don't delete an SSM parameter before deploying the tfvars change that removes it
- Don't apply production changes without user approval at each phase
- Don't assume all services need every variable — ask which services
- For family-portal Canada: remember it uses `ca-central-1`, not `us-east-2`

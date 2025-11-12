# Recipe: Add Environment Variable to 1Password

**Category:** 1password
**Complexity:** moderate
**Last Updated:** 2025-10-30

## Goal

Add a new environment variable to 1Password across local, dev, and production environments with validation at each step.

This recipe guides you through the process of creating properly-formatted 1Password entries for environment variables used by Carefeed applications (portal_dev, family-portal, etc.), ensuring the Lambda deployment system can read them correctly.

## Prerequisites

- 1Password CLI (`op`) installed and authenticated
- Access to the following 1Password vaults:
  - `env-vars-local` (local development)
  - `env-vars-dev` (development/staging)
  - `env-vars-production` (production)
- Understanding of which services need the variable (portal, queue, scheduler)

## Inputs

**Required:**
- `VARIABLE_NAME`: The environment variable name (e.g., `STATSIG_LOGGING_ENABLED`)
- `VARIABLE_VALUE_LOCAL`: Value for local development
- `VARIABLE_VALUE_DEV`: Value for dev/staging environment
- `VARIABLE_VALUE_PROD`: Value for production environment

**Optional:**
- `TAGS_DEV`: Service tags for dev (default: `["admin-portal-dev", "queue-dev", "scheduler-dev"]`)
- `TAGS_PROD`: Service tags for production (default: `["admin-portal-production", "queue-production", "scheduler-production"]`)
- `DRY_RUN`: Set to `true` to validate without creating entries (default: `false`)

## Critical Requirements

⚠️ **MUST use category `LOGIN`** - The AWS Lambda function only processes entries with category `LOGIN`. All other categories (Secure Note, Password, API Credential) are ignored.

**Entry Format:**
```
Category: LOGIN  ← REQUIRED
Title:    VARIABLE_NAME
Username: VARIABLE_NAME
Password: variable_value
Tags:     service-tag-1, service-tag-2
```

## Steps

### Phase 1: Local Environment (Practice)

**Purpose:** Test the process in local environment first (no impact on running services).

1. **Validate inputs**
   ```bash
   # Confirm variable name is set
   echo "Variable: $VARIABLE_NAME"
   echo "Local value: $VARIABLE_VALUE_LOCAL"
   ```

2. **Create entry in env-vars-local vault**
   ```bash
   op item create \
     --category Login \
     --title "$VARIABLE_NAME" \
     --vault env-vars-local \
     username="$VARIABLE_NAME" \
     password="$VARIABLE_VALUE_LOCAL"
   ```

3. **Validate entry was created**
   ```bash
   # Retrieve the entry
   op item get "$VARIABLE_NAME" --vault env-vars-local --format json | jq '{
     title: .title,
     category: .category,
     username: (.fields[] | select(.id == "username") | .value),
     password: (.fields[] | select(.id == "password") | .value),
     tags: .tags
   }'
   ```

4. **User checkpoint: Verify local entry**
   - ✅ Category is `LOGIN`
   - ✅ Title matches variable name
   - ✅ Username matches variable name
   - ✅ Password contains correct value
   - ✅ No tags (local doesn't need tags)

   **🛑 STOP - Wait for user approval before proceeding to dev**

---

### Phase 2: Development Environment

**Purpose:** Add variable to staging/dev environment (low risk).

5. **Create entry in env-vars-dev vault**
   ```bash
   # Default tags for dev
   TAGS_DEV=${TAGS_DEV:-"admin-portal-dev,queue-dev,scheduler-dev"}

   op item create \
     --category Login \
     --title "$VARIABLE_NAME" \
     --vault env-vars-dev \
     --tags "$TAGS_DEV" \
     username="$VARIABLE_NAME" \
     password="$VARIABLE_VALUE_DEV"
   ```

6. **Validate entry was created**
   ```bash
   op item get "$VARIABLE_NAME" --vault env-vars-dev --format json | jq '{
     title: .title,
     category: .category,
     username: (.fields[] | select(.id == "username") | .value),
     password: (.fields[] | select(.id == "password") | .value),
     tags: .tags
   }'
   ```

7. **User checkpoint: Verify dev entry**
   - ✅ Category is `LOGIN`
   - ✅ Username and title match variable name
   - ✅ Password contains dev value
   - ✅ Tags are correct for intended services

   **🛑 STOP - Wait for user approval before proceeding to production**

---

### Phase 3: Production Environment

**Purpose:** Add variable to production (requires care).

8. **Create entry in env-vars-production vault**
   ```bash
   # Default tags for production
   TAGS_PROD=${TAGS_PROD:-"admin-portal-production,queue-production,scheduler-production"}

   op item create \
     --category Login \
     --title "$VARIABLE_NAME" \
     --vault env-vars-production \
     --tags "$TAGS_PROD" \
     username="$VARIABLE_NAME" \
     password="$VARIABLE_VALUE_PROD"
   ```

9. **Validate entry was created**
   ```bash
   op item get "$VARIABLE_NAME" --vault env-vars-production --format json | jq '{
     title: .title,
     category: .category,
     username: (.fields[] | select(.id == "username") | .value),
     password: (.fields[] | select(.id == "password") | .value),
     tags: .tags
   }'
   ```

10. **User checkpoint: Verify production entry**
    - ✅ Category is `LOGIN`
    - ✅ Username and title match variable name
    - ✅ Password contains production value (different from dev if needed)
    - ✅ Tags are correct for production services

---

### Phase 4: Summary & Next Steps

11. **Display summary**
    ```bash
    echo "✅ Environment variable '$VARIABLE_NAME' added to all vaults"
    echo ""
    echo "Local:      $VARIABLE_VALUE_LOCAL (no tags)"
    echo "Dev:        $VARIABLE_VALUE_DEV (tags: $TAGS_DEV)"
    echo "Production: $VARIABLE_VALUE_PROD (tags: $TAGS_PROD)"
    ```

12. **Document next steps**
    ```
    To deploy these variables to running services:

    For DEV:
    1. Trigger Lambda: tools/1password/admin-portal-dev-1pass.json
    2. Force ECS deployment for staging services

    For PRODUCTION:
    1. Trigger Lambda: tools/1password/admin-portal-production-1pass.json
    2. Force ECS deployment for production services

    See: .claude/ENVIRONMENT_VARIABLES.md for deployment instructions
    ```

## Command Patterns

### Check if variable already exists

```bash
# Local
op item get "$VARIABLE_NAME" --vault env-vars-local 2>&1

# Dev
op item get "$VARIABLE_NAME" --vault env-vars-dev 2>&1

# Production
op item get "$VARIABLE_NAME" --vault env-vars-production 2>&1
```

If the variable exists, you'll get details. If not, you'll get an error.

### Delete entry (if you need to start over)

```bash
# CAREFUL - This is destructive
op item delete "$VARIABLE_NAME" --vault env-vars-local
op item delete "$VARIABLE_NAME" --vault env-vars-dev
op item delete "$VARIABLE_NAME" --vault env-vars-production
```

### List all variables in a vault

```bash
op item list --vault env-vars-dev --format json | jq -r '.[].title' | sort
```

## Expected Output

### Successful creation

```json
{
  "title": "STATSIG_LOGGING_ENABLED",
  "category": "LOGIN",
  "username": "STATSIG_LOGGING_ENABLED",
  "password": "false",
  "tags": ["admin-portal-dev", "queue-dev", "scheduler-dev"]
}
```

### Indicators of success
- ✅ `category` is exactly `"LOGIN"` (uppercase)
- ✅ `username` matches `title`
- ✅ `password` contains the expected value
- ✅ `tags` array contains appropriate service tags (dev/prod only, not local)

## Error Handling

### "Item with title already exists"

**Cause:** Variable already exists in vault
**Solution:**
1. Check current value: `op item get "$VARIABLE_NAME" --vault VAULT_NAME`
2. Either update existing entry or use different variable name
3. To replace: Delete first, then recreate

### "Category must be one of..."

**Cause:** Invalid category name
**Solution:** Ensure `--category Login` (capital L, singular)

### "Vault not found"

**Cause:** Incorrect vault name or no access
**Solution:**
1. List available vaults: `op vault list`
2. Verify you have access to env-vars vaults
3. Check for typos in vault name

### "You are not currently signed in"

**Cause:** 1Password CLI not authenticated
**Solution:** Run `op signin` and authenticate

## Related Recipes

- **Used by:** Deployment recipes, environment setup workflows
- **See also:** `.claude/ENVIRONMENT_VARIABLES.md` for deployment to ECS

## Notes

### Why the LOGIN category?

The AWS Lambda function `1password-env-writer` specifically filters for entries with category `LOGIN`. This is intentional:
- Keeps environment variables separate from actual login credentials
- Provides consistent structure across all env vars
- Lambda code: `entries = [e for e in entries if e.category == 'LOGIN']`

### When to use tags

**Local environment:** No tags needed (not deployed via Lambda)

**Dev/Production:** Tags determine which ECS services receive the variable:
- `admin-portal-dev` / `admin-portal-production` - Main application
- `queue-dev` / `queue-production` - Background workers
- `scheduler-dev` / `scheduler-production` - Scheduled tasks

**Best practice:** Only tag services that actually need the variable (principle of least privilege)

### Different values for each environment

Common patterns:
- **Boolean flags:** `local=false`, `dev=false`, `prod=true` (enable in prod only)
- **API keys:** Different keys for each environment (never share prod keys)
- **URLs:** `local=localhost`, `dev=staging.example.com`, `prod=api.example.com`
- **Debug modes:** `local=true`, `dev=true`, `prod=false`

## Examples

### Example 1: Boolean Feature Flag

```bash
VARIABLE_NAME="STATSIG_LOGGING_ENABLED"
VARIABLE_VALUE_LOCAL="false"
VARIABLE_VALUE_DEV="false"
VARIABLE_VALUE_PROD="false"

# Create in local (practice)
op item create \
  --category Login \
  --title "$VARIABLE_NAME" \
  --vault env-vars-local \
  username="$VARIABLE_NAME" \
  password="$VARIABLE_VALUE_LOCAL"

# Verify
op item get "$VARIABLE_NAME" --vault env-vars-local

# Wait for approval, then create in dev...
```

**Result:** Variable created, defaults to disabled in all environments

### Example 2: API Key with Different Values

```bash
VARIABLE_NAME="STRIPE_SECRET_KEY"
VARIABLE_VALUE_LOCAL="sk_test_local123..."
VARIABLE_VALUE_DEV="sk_test_dev456..."
VARIABLE_VALUE_PROD="sk_live_prod789..."

# Only tag admin-portal (queue doesn't need Stripe)
TAGS_DEV="admin-portal-dev"
TAGS_PROD="admin-portal-production"

# Follow recipe steps...
```

**Result:** Separate API keys for each environment, limited to portal service only

---

**Version History:**
- 2025-10-30: Initial creation

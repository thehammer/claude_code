#!/bin/bash
# Carefeed Project Helper Functions

# Check if current directory is a Carefeed project
is_carefeed_project() {
    # Check for Carefeed-specific markers
    if [[ -f "composer.json" ]] && grep -q "carefeed" composer.json 2>/dev/null; then
        return 0
    fi

    # Check git remote URL
    if git remote get-url origin 2>/dev/null | grep -q "Bitbucketpassword1\|carefeed"; then
        return 0
    fi

    return 1
}

# Get Jira projects for current repo
get_jira_projects() {
    local repo_name=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)")

    case "$repo_name" in
        portal_dev|portal)
            echo "CORE INT PAYM APP PORTAL"
            ;;
        family-portal)
            echo "CORE APP"
            ;;
        *)
            echo "CORE"
            ;;
    esac
}

# Validate Jira key format
validate_jira_key() {
    local key="$1"
    if [[ "$key" =~ ^(CORE|INT|PAYM|APP|PORTAL)-[0-9]+$ ]]; then
        return 0
    fi
    return 1
}

# Extract Jira key from branch name or commit message
extract_jira_key() {
    local text="$1"
    # Match pattern: PROJECT-NUMBER
    if [[ "$text" =~ (CORE|INT|PAYM|APP|PORTAL)-[0-9]+ ]]; then
        echo "${BASH_REMATCH[0]}"
        return 0
    fi
    return 1
}

# Get current branch's Jira key
get_branch_jira_key() {
    local branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    extract_jira_key "$branch"
}

# Generate Carefeed branch name
carefeed_branch_name() {
    local type="$1"  # feature, bugfix, hotfix, chore
    local jira_key="$2"
    local description="$3"

    # Validate inputs
    if [[ -z "$type" ]] || [[ -z "$jira_key" ]] || [[ -z "$description" ]]; then
        echo "Error: Missing required arguments" >&2
        echo "Usage: carefeed_branch_name <type> <jira-key> <description>" >&2
        return 1
    fi

    if ! validate_jira_key "$jira_key"; then
        echo "Error: Invalid Jira key format: $jira_key" >&2
        echo "Expected format: PROJECT-NUMBER (e.g., CORE-1234)" >&2
        return 1
    fi

    # Sanitize description (lowercase, replace spaces/underscores with hyphens)
    local clean_desc=$(echo "$description" | tr '[:upper:]' '[:lower:]' | tr ' _' '-' | sed 's/[^a-z0-9-]//g' | sed 's/--*/-/g')

    echo "${type}/${jira_key}-${clean_desc}"
}

# Generate Carefeed commit message
carefeed_commit_message() {
    local jira_key="$1"
    local message="$2"

    if [[ -z "$jira_key" ]] || [[ -z "$message" ]]; then
        echo "Error: Missing required arguments" >&2
        echo "Usage: carefeed_commit_message <jira-key> <message>" >&2
        return 1
    fi

    if ! validate_jira_key "$jira_key"; then
        echo "Error: Invalid Jira key format: $jira_key" >&2
        return 1
    fi

    # Simple format: JIRA-KEY - message
    echo "${jira_key} - ${message}"
}

# Generate Carefeed PR description template
carefeed_pr_description() {
    local jira_key="$1"
    local summary="$2"

    if [[ -z "$jira_key" ]]; then
        # Try to extract from current branch
        jira_key=$(get_branch_jira_key)
    fi

    if [[ -z "$jira_key" ]] || ! validate_jira_key "$jira_key"; then
        echo "Error: Valid Jira key required" >&2
        return 1
    fi

    cat <<EOF
## Jira Ticket
[${jira_key}](https://carefeed.atlassian.net/browse/${jira_key})

## Summary
${summary:-[Brief overview of what this PR does]}

## Changes
* [List specific changes made]
*

## Testing
* [How changes were tested]
*

## Related
* [Related PRs/issues if applicable]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
}

# Get Jira ticket URL
jira_ticket_url() {
    local jira_key="$1"

    if ! validate_jira_key "$jira_key"; then
        echo "Error: Invalid Jira key format: $jira_key" >&2
        return 1
    fi

    echo "https://carefeed.atlassian.net/browse/${jira_key}"
}

# Get current active sprint for a project/team
get_current_sprint() {
    local project="${1:-CORE}"

    # Map project to team name
    local team
    case "$project" in
        CORE) team="Core" ;;
        INT) team="Integration" ;;
        PAYM) team="Payments" ;;
        APP) team="App" ;;
        *) team="Core" ;;
    esac

    # Current sprint: 2025.20 (Oct 1 - Oct 14, 2025)
    # TODO: This should query Jira API for actual current sprint
    echo "2025.20 - $team"
}

# Get Jira user email (Hammer's email)
get_jira_user_email() {
    echo "hammer.miller@carefeed.com"
}

# Infer Jira project from work description
infer_jira_project() {
    local description="$1"
    local desc_lower=$(echo "$description" | tr '[:upper:]' '[:lower:]')

    # Check for integration keywords
    if echo "$desc_lower" | grep -qE "(pcc|yardi|collain|matrixcare|integration|sync|import|export)"; then
        echo "INT"
        return 0
    fi

    # Check for payment keywords
    if echo "$desc_lower" | grep -qE "(payment|billing|invoice|stripe|charge|refund)"; then
        echo "PAYM"
        return 0
    fi

    # Check for app keywords
    if echo "$desc_lower" | grep -qE "(chat|mobile|app|stream)"; then
        echo "APP"
        return 0
    fi

    # Default to CORE for general features
    echo "CORE"
}

# Infer Jira issue type from work description
infer_jira_type() {
    local description="$1"
    local desc_lower=$(echo "$description" | tr '[:upper:]' '[:lower:]')

    # Check for bug keywords
    if echo "$desc_lower" | grep -qE "(bug|fix|error|broken|issue|problem|crash)"; then
        echo "Bug"
        return 0
    fi

    # Check for task keywords
    if echo "$desc_lower" | grep -qE "(refactor|cleanup|upgrade|migrate|update|improve)"; then
        echo "Task"
        return 0
    fi

    # Default to Story for feature work
    echo "Story"
}

# Infer Jira priority from work description
infer_jira_priority() {
    local description="$1"
    local desc_lower=$(echo "$description" | tr '[:upper:]' '[:lower:]')

    # Check for critical/urgent keywords
    if echo "$desc_lower" | grep -qE "(critical|urgent|production down|outage|security|data loss)"; then
        echo "P0"
        return 0
    fi

    # Check for high priority keywords
    if echo "$desc_lower" | grep -qE "(high priority|blocker|blocking|asap)"; then
        echo "P1"
        return 0
    fi

    # Check for low priority keywords
    if echo "$desc_lower" | grep -qE "(low priority|nice to have|someday|cleanup|refactor)"; then
        echo "P3"
        return 0
    fi

    # Default to medium priority
    echo "P2"
}

# Show Carefeed conventions help
show_carefeed_conventions() {
    cat <<'EOF'
Carefeed Git Conventions
========================

Branch Naming:
  {type}/{JIRA-KEY}-{description}

  Types: feature, bugfix, hotfix, chore

  Examples:
    feature/CORE-3476-rewrite-email-envelope
    bugfix/INT-1125-collain-sync-fixes
    hotfix/CORE-3310-contact-type-fix
    chore/PAYM-1175-package-upgrade

Commit Messages:
  {JIRA-KEY} - {short description}

  Or conventional commits:
  {type}({scope}): {JIRA-KEY}: {description}

  Examples:
    CORE-3476 - add CarefeedMail class
    feat(email): CORE-3476: add CarefeedMail class

Pull Requests:
  - Title includes Jira key
  - Description starts with Jira ticket link
  - Use template: carefeed_pr_description CORE-1234

Jira Projects:
  CORE  - Core platform features
  INT   - Integrations (PCC, Yardi, Collain, etc.)
  PAYM  - Payments functionality
  APP   - Chat app/mobile app
  PORTAL - Portal-specific items

Helper Functions:
  carefeed_branch_name feature CORE-1234 "add auth"
  carefeed_commit_message CORE-1234 "implement feature"
  carefeed_pr_description CORE-1234 "Summary text"
  get_branch_jira_key
  validate_jira_key CORE-1234
  jira_ticket_url CORE-1234
EOF
}

# Export functions
export -f is_carefeed_project
export -f get_jira_projects
export -f validate_jira_key
export -f extract_jira_key
export -f get_branch_jira_key
export -f carefeed_branch_name
export -f carefeed_commit_message
export -f carefeed_pr_description
export -f jira_ticket_url
export -f get_current_sprint
export -f get_jira_user_email
export -f infer_jira_project
export -f infer_jira_type
export -f infer_jira_priority
export -f show_carefeed_conventions

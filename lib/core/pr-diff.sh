#!/bin/bash
# PR Diff Helper - Get only the changes introduced by a PR branch
# Handles branches that have merged master into themselves

set -euo pipefail

# Get the actual PR commits (excluding merge commits from master)
# Usage: pr_get_commits <branch-name> [remote]
pr_get_commits() {
    local branch="${1:?Branch name required}"
    local remote="${2:-origin}"
    local base="${3:-master}"

    # Fetch the branch
    git fetch "$remote" "$branch" 2>/dev/null || true

    # Get commits on branch that aren't merge commits
    # Merge commits typically have "Merged in" in the message or multiple parents
    git log --oneline --no-merges "$remote/$base..$remote/$branch" 2>/dev/null | \
        grep -v "^[a-f0-9]* Merged in " || true
}

# Get the list of commit hashes for a PR's actual changes (non-merge only)
# Returns: space-separated list of commit hashes
# Usage: pr_get_commit_hashes <branch-name> [remote] [base]
pr_get_commit_hashes() {
    local branch="${1:?Branch name required}"
    local remote="${2:-origin}"
    local base="${3:-master}"

    # Get non-merge commit hashes only
    git log --format="%H" --no-merges "$remote/$base..$remote/$branch" 2>/dev/null | \
        while read -r hash; do
            # Double-check it's not a merge commit by message
            local msg
            msg=$(git log -1 --format="%s" "$hash" 2>/dev/null)
            if [[ ! "$msg" =~ ^Merged\ in\  ]]; then
                echo "$hash"
            fi
        done
}

# DEPRECATED: This approach is flawed for branches with merge commits
# Get the commit range for a PR's actual changes
# Returns: "first_commit^..last_commit" or empty if no commits
# Usage: pr_get_commit_range <branch-name> [remote] [base]
pr_get_commit_range() {
    local branch="${1:?Branch name required}"
    local remote="${2:-origin}"
    local base="${3:-master}"

    # Get non-merge commits
    local commits
    commits=$(pr_get_commits "$branch" "$remote" "$base")

    if [[ -z "$commits" ]]; then
        echo ""
        return 1
    fi

    # First commit is at the bottom, last at the top
    local first_commit last_commit
    last_commit=$(echo "$commits" | head -1 | cut -d' ' -f1)
    first_commit=$(echo "$commits" | tail -1 | cut -d' ' -f1)

    echo "${first_commit}^..${last_commit}"
}

# Show diff stats for a PR branch (only PR's own changes)
# Uses combined diff of individual commits to avoid merge pollution
# Usage: pr_diff_stat <branch-name> [remote] [base]
pr_diff_stat() {
    local branch="${1:?Branch name required}"
    local remote="${2:-origin}"
    local base="${3:-master}"

    # Fetch the branch
    git fetch "$remote" "$branch" 2>/dev/null || true

    # Get list of PR commit hashes
    local commits
    commits=$(pr_get_commit_hashes "$branch" "$remote" "$base")

    if [[ -z "$commits" ]]; then
        echo "No PR-specific commits found on branch $branch"
        return 1
    fi

    echo "# Commits in this PR:"
    pr_get_commits "$branch" "$remote" "$base"
    echo ""
    echo "# Files changed in this PR:"

    # List unique files touched by PR commits
    echo "$commits" | while read -r hash; do
        git diff-tree --no-commit-id --name-only -r "$hash" 2>/dev/null
    done | sort -u

    echo ""
    echo "# Summary:"
    local file_count
    file_count=$(echo "$commits" | while read -r hash; do
        git diff-tree --no-commit-id --name-only -r "$hash" 2>/dev/null
    done | sort -u | wc -l | tr -d ' ')
    local commit_count
    commit_count=$(echo "$commits" | wc -l | tr -d ' ')
    echo "$commit_count commits, $file_count files changed"
}

# Show full diff for a PR branch (only PR's own changes)
# Combines diffs from each individual commit to avoid merge pollution
# Usage: pr_diff <branch-name> [remote] [base]
pr_diff() {
    local branch="${1:?Branch name required}"
    local remote="${2:-origin}"
    local base="${3:-master}"

    # Fetch the branch
    git fetch "$remote" "$branch" 2>/dev/null || true

    # Get list of PR commit hashes (oldest first for logical diff order)
    # Use tail -r on macOS (tac not available)
    local commits
    commits=$(pr_get_commit_hashes "$branch" "$remote" "$base" | tail -r)

    if [[ -z "$commits" ]]; then
        echo "No PR-specific commits found on branch $branch"
        return 1
    fi

    # Show diff for each commit in chronological order
    echo "$commits" | while read -r hash; do
        local subject
        subject=$(git log -1 --format="%s" "$hash" 2>/dev/null)
        echo "# =============================================="
        echo "# Commit: ${hash:0:10} - $subject"
        echo "# =============================================="
        git show --format="" "$hash" 2>/dev/null
        echo ""
    done
}

# Show diff for specific files in a PR
# Usage: pr_diff_files <branch-name> <file-pattern...>
pr_diff_files() {
    local branch="${1:?Branch name required}"
    shift
    local files=("$@")

    local range
    range=$(pr_get_commit_range "$branch")

    if [[ -z "$range" ]]; then
        echo "No PR-specific commits found on branch $branch"
        return 1
    fi

    git diff "$range" -- "${files[@]}"
}

# Validate a PR review by comparing commit count and line changes
# Usage: pr_validate_scope <branch-name> [expected-commits]
pr_validate_scope() {
    local branch="${1:?Branch name required}"
    local expected_commits="${2:-}"

    echo "## PR Scope Validation: $branch"
    echo ""

    # Count actual PR commits
    local commit_count
    commit_count=$(pr_get_commits "$branch" | wc -l | tr -d ' ')

    echo "Commits in PR: $commit_count"

    if [[ -n "$expected_commits" && "$commit_count" != "$expected_commits" ]]; then
        echo "WARNING: Expected $expected_commits commits, found $commit_count"
    fi

    # Get line stats
    local range
    range=$(pr_get_commit_range "$branch")

    if [[ -n "$range" ]]; then
        local stats
        stats=$(git diff --shortstat "$range")
        echo "Changes: $stats"
    fi

    echo ""
    echo "Commits:"
    pr_get_commits "$branch"
}

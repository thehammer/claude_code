# /branch - Create branch with git worktree

Create a new branch with an isolated git worktree for parallel development.

## Usage

```
/branch <branch-name> [--no-deps]
```

## Arguments

- **branch-name** (required): Name for the new branch (e.g., `hammer/fix-auth-bug`, `feature/CORE-1234-new-feature`)
- **--no-deps**: Skip dependency installation (composer/npm/pip/bundle)

## Behavior

1. **Validate**: Ensure we're in a git repository
2. **Create worktree**: Use `~/.claude/lib/core/worktree.sh` functions
   - Worktree path: `{repo-parent}/{repo-name}-{sanitized-branch}/`
   - Branch slashes become dashes in directory name
3. **Create branch**: If branch doesn't exist, create it from current HEAD
4. **Install dependencies** (unless `--no-deps`):
   - **PHP**: Copy `vendor/` from main repo + `composer dump-autoload` (faster than fresh install)
   - **PHP**: Copy `.env` from main repo if missing
   - **Node**: Copy `node_modules/` from main repo (faster than fresh install)
   - **Python**: `pip install -r requirements.txt`
   - **Ruby**: `bundle install`
5. **Report**: Show path and next steps

## Example Output

```
✅ Worktree created for branch: hammer/fix-auth-bug

📁 Location: /Users/hammer/code/myproject-hammer-fix-auth-bug
📦 Dependencies: Installed (composer, npm)

Next steps:
  cd /Users/hammer/code/myproject-hammer-fix-auth-bug

Or open in new tmux pane:
  tmux new-window -c /Users/hammer/code/myproject-hammer-fix-auth-bug
```

## Implementation

```bash
#!/bin/bash
source ~/.claude/lib/core/worktree.sh

branch_name="$1"
skip_deps=false

# Check for --no-deps flag
for arg in "$@"; do
    if [[ "$arg" == "--no-deps" ]]; then
        skip_deps=true
    fi
done

# Validate
if [[ -z "$branch_name" ]]; then
    echo "Error: Branch name required"
    echo "Usage: /branch <branch-name> [--no-deps]"
    exit 1
fi

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Create worktree (creates branch if needed)
worktree_path=$(worktree_create "$branch_name" true)
if [[ $? -ne 0 ]]; then
    echo "Error: Failed to create worktree"
    exit 1
fi

echo "✅ Worktree created for branch: $branch_name"
echo ""
echo "📁 Location: $worktree_path"

# Install dependencies unless skipped
if [[ "$skip_deps" == "false" ]]; then
    echo "📦 Installing dependencies..."
    worktree_install_deps "$worktree_path"
fi

echo ""
echo "Next steps:"
echo "  cd $worktree_path"
echo ""
echo "Or open in new tmux pane:"
echo "  tmux new-window -c $worktree_path"
```

## Notes

- Worktrees share git history but have independent working directories
- Each worktree can be on a different branch simultaneously
- **Gitignored files** (vendor/, node_modules/, .env) are copied from main repo, not re-installed
- Use `git worktree list` to see all worktrees
- Use `git worktree remove <path>` to clean up when done
- Main repo stays clean on master/main for quick context switches

#!/usr/bin/env bash

# Lazy Context Loading Functions
# Purpose: Load session context progressively on-demand to reduce startup tokens
# Usage: Source this file and call functions as needed

#──────────────────────────────────────────────────────────────────────────────
# Environment flags to prevent duplicate loading
#──────────────────────────────────────────────────────────────────────────────

# Track what's been loaded in this session
export CONTEXT_CALENDAR_LOADED=${CONTEXT_CALENDAR_LOADED:-0}
export CONTEXT_PRS_LOADED=${CONTEXT_PRS_LOADED:-0}
export CONTEXT_NOTES_LOADED=${CONTEXT_NOTES_LOADED:-0}
export CONTEXT_TODOS_LOADED=${CONTEXT_TODOS_LOADED:-0}
export CONTEXT_GIT_HISTORY_LOADED=${CONTEXT_GIT_HISTORY_LOADED:-0}

#──────────────────────────────────────────────────────────────────────────────
# Summary Functions (Lightweight, always available)
#──────────────────────────────────────────────────────────────────────────────

context_summary() {
    # Provides quick summary of available context without loading full details
    # Returns counts/metadata only (~200 tokens vs 10K+)

    local in_git_repo=false
    git rev-parse --is-inside-work-tree &>/dev/null && in_git_repo=true

    echo "📊 Available Context:"
    echo ""

    # Calendar
    local meeting_count=0
    if command -v m365 &>/dev/null; then
        meeting_count=$(m365 request --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T05:00:00Z&endDateTime=$(date -v+1d +%Y-%m-%d)T05:00:00Z" --method get 2>/dev/null | jq -r '.value | length' 2>/dev/null || echo "0")
    fi

    if [ "$meeting_count" -gt 0 ]; then
        echo "  📅 Calendar: $meeting_count meetings today"
    else
        echo "  📅 Calendar: No meetings today"
    fi

    # Open PRs
    if [ -f ~/.claude/bin/utilities/list-all-open-prs ]; then
        local pr_count=$(~/.claude/bin/utilities/list-all-open-prs 100 2>/dev/null | grep -c "^#" || echo "0")
        echo "  🔀 Open PRs: $pr_count open"
    fi

    # Session notes
    local latest_notes=""
    if $in_git_repo && [ -d .claude/session-notes/coding ]; then
        latest_notes=$(ls -t .claude/session-notes/coding/*.md 2>/dev/null | head -1)
        if [ -n "$latest_notes" ]; then
            local note_date=$(basename "$latest_notes" .md)
            echo "  📝 Session notes: Last from $note_date"
        fi
    fi

    # TODOs
    local todo_count=0
    if [ -f .claude/TODO.md ]; then
        todo_count=$(grep -c "^- \[ \]" .claude/TODO.md 2>/dev/null || echo "0")
        echo "  ✅ TODOs: $todo_count pending items"
    elif [ -f .claude/todos/features.md ]; then
        todo_count=$(grep -c "^- \[ \]" .claude/todos/features.md 2>/dev/null || echo "0")
        echo "  ✅ TODOs: $todo_count features planned"
    fi

    # Git status
    if $in_git_repo; then
        local branch=$(git branch --show-current 2>/dev/null)
        local clean_status="clean"
        git diff-index --quiet HEAD -- 2>/dev/null || clean_status="uncommitted changes"
        echo "  🔀 Git: $branch ($clean_status)"
    fi

    echo ""
    echo "Use /calendar, /prs, /notes, /todos to load full details"
}

#──────────────────────────────────────────────────────────────────────────────
# Calendar Loading
#──────────────────────────────────────────────────────────────────────────────

lazy_load_calendar() {
    # Load today's calendar if not already loaded
    # Returns: 0 if loaded/already loaded, 1 if error

    if [ "$CONTEXT_CALENDAR_LOADED" = "1" ]; then
        echo "ℹ️  Calendar already loaded in this session"
        return 0
    fi

    if ! command -v m365 &>/dev/null; then
        echo "❌ m365 CLI not available"
        return 1
    fi

    # Load m365 helper if not already loaded
    if ! declare -f show_today_calendar &>/dev/null; then
        source ~/.claude/lib/core/loader.sh clauding
    fi

    show_today_calendar summary

    export CONTEXT_CALENDAR_LOADED=1
    return 0
}

#──────────────────────────────────────────────────────────────────────────────
# Open PRs Loading
#──────────────────────────────────────────────────────────────────────────────

lazy_load_prs() {
    # Load open pull requests if not already loaded
    # Args: $1 - limit (default: 10)
    # Returns: 0 if loaded, 1 if error

    local limit=${1:-10}

    if [ "$CONTEXT_PRS_LOADED" = "1" ]; then
        echo "ℹ️  PRs already loaded in this session"
        return 0
    fi

    if [ ! -f ~/.claude/bin/utilities/list-all-open-prs ]; then
        echo "❌ list-all-open-prs script not found"
        return 1
    fi

    echo "🔀 Loading open pull requests..."
    ~/.claude/bin/utilities/list-all-open-prs "$limit"

    export CONTEXT_PRS_LOADED=1
    return 0
}

#──────────────────────────────────────────────────────────────────────────────
# Session Notes Loading
#──────────────────────────────────────────────────────────────────────────────

lazy_load_session_notes() {
    # Load recent session notes
    # Args: $1 - session type (default: coding)
    #       $2 - count (default: 1 = most recent)
    # Returns: 0 if loaded, 1 if no notes found

    local session_type=${1:-coding}
    local count=${2:-1}

    if [ "$CONTEXT_NOTES_LOADED" = "1" ]; then
        echo "ℹ️  Session notes already loaded"
        return 0
    fi

    local notes_dir=".claude/session-notes/$session_type"

    if [ ! -d "$notes_dir" ]; then
        echo "❌ No session notes directory: $notes_dir"
        return 1
    fi

    local notes_files=$(ls -t "$notes_dir"/*.md 2>/dev/null | head -n "$count")

    if [ -z "$notes_files" ]; then
        echo "ℹ️  No session notes found in $notes_dir"
        return 1
    fi

    echo "📝 Recent $session_type session notes:"
    echo ""

    while IFS= read -r note_file; do
        local note_date=$(basename "$note_file" .md)
        echo "═══════════════════════════════════════"
        echo "Session: $note_date"
        echo "═══════════════════════════════════════"
        cat "$note_file"
        echo ""
    done <<< "$notes_files"

    export CONTEXT_NOTES_LOADED=1
    return 0
}

#──────────────────────────────────────────────────────────────────────────────
# TODOs Loading
#──────────────────────────────────────────────────────────────────────────────

lazy_load_todos() {
    # Load TODO items from project
    # Returns: 0 if loaded, 1 if no TODOs found

    if [ "$CONTEXT_TODOS_LOADED" = "1" ]; then
        echo "ℹ️  TODOs already loaded"
        return 0
    fi

    local found_todos=false

    echo "✅ TODO Items:"
    echo ""

    # Check main TODO.md
    if [ -f .claude/TODO.md ]; then
        echo "─── .claude/TODO.md ───"
        cat .claude/TODO.md
        echo ""
        found_todos=true
    fi

    # Check todos directory
    if [ -d .claude/todos ]; then
        for todo_file in .claude/todos/*.md; do
            if [ -f "$todo_file" ]; then
                echo "─── $(basename "$todo_file") ───"
                cat "$todo_file"
                echo ""
                found_todos=true
            fi
        done
    fi

    if ! $found_todos; then
        echo "ℹ️  No TODO files found in .claude/"
        return 1
    fi

    export CONTEXT_TODOS_LOADED=1
    return 0
}

#──────────────────────────────────────────────────────────────────────────────
# Git History Loading
#──────────────────────────────────────────────────────────────────────────────

lazy_load_git_history() {
    # Load git commit history
    # Args: $1 - count (default: 10)
    # Returns: 0 if loaded, 1 if not in git repo

    local count=${1:-10}

    if [ "$CONTEXT_GIT_HISTORY_LOADED" = "1" ]; then
        echo "ℹ️  Git history already loaded"
        return 0
    fi

    if ! git rev-parse --is-inside-work-tree &>/dev/null; then
        echo "❌ Not in a git repository"
        return 1
    fi

    echo "🔀 Recent Git History (last $count commits):"
    echo ""
    git log -"$count" --oneline --decorate --graph

    export CONTEXT_GIT_HISTORY_LOADED=1
    return 0
}

#──────────────────────────────────────────────────────────────────────────────
# Full Context Loading
#──────────────────────────────────────────────────────────────────────────────

lazy_load_full_context() {
    # Load all available context (equivalent to old behavior)
    # Use when user explicitly wants everything or troubleshooting

    echo "📊 Loading full session context..."
    echo ""

    lazy_load_calendar
    echo ""

    lazy_load_prs 10
    echo ""

    lazy_load_session_notes coding 1
    echo ""

    lazy_load_todos
    echo ""

    lazy_load_git_history 10
    echo ""

    echo "✅ Full context loaded"
}

#──────────────────────────────────────────────────────────────────────────────
# Reset Functions (for testing)
#──────────────────────────────────────────────────────────────────────────────

context_reset() {
    # Reset all context loaded flags
    # Useful for testing or forcing reload

    export CONTEXT_CALENDAR_LOADED=0
    export CONTEXT_PRS_LOADED=0
    export CONTEXT_NOTES_LOADED=0
    export CONTEXT_TODOS_LOADED=0
    export CONTEXT_GIT_HISTORY_LOADED=0

    echo "✅ Context flags reset"
}

#──────────────────────────────────────────────────────────────────────────────
# Help
#──────────────────────────────────────────────────────────────────────────────

lazy_context_help() {
    cat <<'EOF'
Lazy Context Loading Functions

Summary:
  context_summary              Show what context is available (lightweight)

Load Context:
  lazy_load_calendar          Load today's calendar
  lazy_load_prs [limit]       Load open PRs (default: 10)
  lazy_load_session_notes     Load recent session notes
  lazy_load_todos             Load TODO items
  lazy_load_git_history [n]   Load recent commits (default: 10)
  lazy_load_full_context      Load everything (old behavior)

Utility:
  context_reset               Reset loaded flags (force reload)
  lazy_context_help           Show this help

Flags (track what's loaded):
  CONTEXT_CALENDAR_LOADED
  CONTEXT_PRS_LOADED
  CONTEXT_NOTES_LOADED
  CONTEXT_TODOS_LOADED
  CONTEXT_GIT_HISTORY_LOADED
EOF
}

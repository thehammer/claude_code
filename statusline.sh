#!/usr/bin/env bash
# Claude Code statusline — fast, single-jq-call design
# Shows: model, repo:branch, context %, cost, duration, lines changed, vim mode, session type

# Read all of stdin (Claude Code closes the pipe after writing)
input=$(cat) 2>/dev/null
[ -z "$input" ] && input='{}'

# Single jq call — outputs tab-separated values
# Note: use "-" placeholder for nullable strings; bash read swallows empty tab fields
IFS=$'\t' read -r model cost duration_ms used_pct lines_added lines_removed vim_mode cwd <<< \
    "$(echo "$input" | jq -r '[
        (.model.display_name // "?"),
        (.cost.total_cost_usd // 0),
        (.cost.total_duration_ms // 0),
        (.context_window.used_percentage // 0 | floor),
        (.cost.total_lines_added // 0),
        (.cost.total_lines_removed // 0),
        (.vim.mode // "-"),
        (.workspace.current_dir // .cwd // "-")
    ] | join("\t")' 2>/dev/null)" || {
    model="?" cost=0 duration_ms=0 used_pct=0
    lines_added=0 lines_removed=0 vim_mode="-" cwd="-"
}

# Defaults for empty fields
: "${model:=?}" "${cost:=0}" "${duration_ms:=0}" "${used_pct:=0}"
: "${lines_added:=0}" "${lines_removed:=0}"
# Convert placeholders to empty
[ "$vim_mode" = "-" ] && vim_mode=""
[ "$cwd" = "-" ] && cwd=""

# --- Git info (repo name, branch, worktree detection) ---
repo="" branch="" is_worktree=0
if [ -n "$cwd" ] && cd "$cwd" 2>/dev/null; then
    _gd=$(git rev-parse --git-dir 2>/dev/null)
    _gc=$(git rev-parse --git-common-dir 2>/dev/null)
    if [ -n "$_gd" ] && [ -n "$_gc" ] && [ "$_gd" != "$_gc" ]; then
        # Worktree — get real repo name from common dir
        is_worktree=1
        repo=$(basename "$(cd "$_gc/.." 2>/dev/null && pwd)")
    else
        repo=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)" 2>/dev/null)
    fi
    branch=$(git branch --show-current 2>/dev/null)
fi

# --- Session type from tmux window name ---
session_type=""
if [ -n "$TMUX" ]; then
    session_type=$(tmux display-message -p '#W' 2>/dev/null)
    # Filter out default window names
    case "$session_type" in bash|zsh|fish|"") session_type="" ;; esac
fi

# --- Format duration (pure arithmetic, no subprocesses) ---
dur=""
if [ "$duration_ms" -gt 0 ] 2>/dev/null; then
    s=$((duration_ms / 1000))
    h=$((s / 3600)) m=$(( (s % 3600) / 60 ))
    if [ "$h" -gt 0 ]; then dur="${h}h${m}m"
    elif [ "$m" -gt 0 ]; then dur="${m}m"
    else dur="${s}s"; fi
else
    dur="0s"
fi

# --- Context bar (pure string building) ---
pct=${used_pct%.*}; : "${pct:=0}"
filled=$(( (pct * 10 + 50) / 100 ))
[ "$filled" -gt 10 ] && filled=10
_f="██████████" _e="░░░░░░░░░░"
bar="${_f:0:filled}${_e:0:10-filled}"

# Context color
if [ "$pct" -ge 75 ]; then   cc=196  # red
elif [ "$pct" -ge 50 ]; then cc=220  # yellow
else                          cc=114  # green
fi

# --- Build output (single printf per line) ---
# Colors
R='\033[0m'          # reset
D='\033[38;5;245m'   # dim gray (default text)
B='\033[48;5;233m'   # dark bg
W='\033[38;5;255m'   # white
MB='\033[48;5;31m'   # model badge bg (blue)
S=''               # powerline separator
SF='\033[38;5;31m'   # separator fg (match model bg)
BF='\033[38;5;233m'  # separator fg (match metrics bg)

# Repo/branch segment
rb=""
if [ -n "$repo" ]; then
    rb=" \033[38;5;75m${repo}${D}"
    if [ -n "$branch" ]; then
        rb="${rb}:\033[38;5;114m${branch}${D}"
    fi
    if [ "$is_worktree" -eq 1 ]; then
        rb="${rb} \033[38;5;220m◆${D}"
    fi
    rb="${rb} │"
fi

# Lines changed
lc=""
if [ "${lines_added:-0}" -gt 0 ] 2>/dev/null || [ "${lines_removed:-0}" -gt 0 ] 2>/dev/null; then
    lc=" │ \033[38;5;114m+${lines_added} \033[38;5;203m-${lines_removed}${D}"
fi

# Vim mode
vm=""
if [ -n "${vim_mode:-}" ]; then
    if [ "$vim_mode" = "NORMAL" ]; then
        vm=" │ \033[38;5;114m${vim_mode}${D}"
    else
        vm=" │ \033[38;5;220m${vim_mode}${D}"
    fi
fi

# Session type
st=""
if [ -n "$session_type" ]; then
    st=" │ \033[38;5;141m${session_type}${D}"
fi

# Cost
cost_fmt=$(printf '$%.2f' "$cost")

# Single line output
printf "${MB}${W} ${model} ${SF}${B}${S}${D}${rb} ${bar} \033[38;5;${cc}m${pct}%%${D} │ ${cost_fmt} │ ${dur}${lc}${vm}${st} ${BF}\033[49m${S}${R}\n"

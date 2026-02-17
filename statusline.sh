#!/usr/bin/env bash
# Claude Code statusline - powerline style matching shell prompt
# Colors match ~/.zshrc promptline theme

set -euo pipefail

# Read JSON from stdin
input=$(cat)

# --- Extract data from JSON ---
model=$(echo "$input" | jq -r '.model.display_name // "?"')
cwd=$(echo "$input" | jq -r '.workspace.current_dir // "~"')
cost=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
duration_ms=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // 0')
lines_added=$(echo "$input" | jq -r '.cost.total_lines_added // 0')
lines_removed=$(echo "$input" | jq -r '.cost.total_lines_removed // 0')
vim_mode=$(echo "$input" | jq -r '.vim.mode // empty')

# --- Hostname (short) ---
hostname=$(hostname -s 2>/dev/null || hostname)

# --- Path (truncated to last 3 segments) ---
path="${cwd/#$HOME/\~}"
IFS='/' read -ra parts <<< "${path#\~}"
total=${#parts[@]}
if [ "$total" -gt 3 ]; then
    path="⋯"
    for p in "${parts[@]: -3}"; do
        [ -n "$p" ] && path="${path}  ${p}"
    done
else
    first="${path:0:1}"
    rest="${path#\~}"
    path="$first"
    IFS='/' read -ra parts <<< "$rest"
    for p in "${parts[@]}"; do
        [ -n "$p" ] && path="${path}  ${p}"
    done
fi

# --- Git branch ---
branch=$(git -C "$cwd" symbolic-ref --quiet HEAD 2>/dev/null || git -C "$cwd" rev-parse --short HEAD 2>/dev/null || true)
branch="${branch##*/}"

# --- Format duration ---
if [ "$duration_ms" -gt 0 ]; then
    total_sec=$((duration_ms / 1000))
    hours=$((total_sec / 3600))
    mins=$(( (total_sec % 3600) / 60 ))
    if [ "$hours" -gt 0 ]; then
        duration="${hours}h${mins}m"
    elif [ "$mins" -gt 0 ]; then
        duration="${mins}m"
    else
        duration="${total_sec}s"
    fi
else
    duration="0s"
fi

# --- Format cost ---
cost_fmt=$(printf '$%.2f' "$cost")

# --- Context bar ---
# Round percentage to integer
used_int=${used_pct%.*}
[ -z "$used_int" ] && used_int=0

bar_width=10
filled=$(( (used_int * bar_width + 50) / 100 ))
[ "$filled" -gt "$bar_width" ] && filled=$bar_width
empty=$((bar_width - filled))
bar=""
for ((i=0; i<filled; i++)); do bar+="█"; done
for ((i=0; i<empty; i++)); do bar+="░"; done

# Color for context: green < 50%, yellow 50-75%, red > 75%
if [ "$used_int" -ge 75 ]; then
    ctx_fg="38;5;196"   # red
elif [ "$used_int" -ge 50 ]; then
    ctx_fg="38;5;220"   # yellow
else
    ctx_fg="38;5;114"   # green
fi

# --- Lines changed ---
lines_info=""
if [ "$lines_added" -gt 0 ] || [ "$lines_removed" -gt 0 ]; then
    lines_info="+${lines_added} -${lines_removed}"
fi

# --- Powerline characters ---
sep=""       # right-pointing triangle
alt_sep=""  # right-pointing thin separator

# --- Colors (matching promptline theme) ---
# Section A: hostname - blue bg
a_fg="\033[38;5;255m"; a_bg="\033[48;5;31m"; a_sep_fg="\033[38;5;31m"
# Section B: user - dark gray bg
b_fg="\033[38;5;254m"; b_bg="\033[48;5;237m"; b_sep_fg="\033[38;5;237m"
# Section C: path - darker gray bg
c_fg="\033[38;5;254m"; c_bg="\033[48;5;234m"; c_sep_fg="\033[38;5;234m"
# Section Y: branch - dark gray bg (same as B)
y_fg="\033[38;5;254m"; y_bg="\033[48;5;237m"; y_sep_fg="\033[38;5;237m"
# Section M: metrics line - subtle dark bg
m_fg="\033[38;5;245m"; m_bg="\033[48;5;233m"; m_sep_fg="\033[38;5;233m"
# Model badge
mod_fg="\033[38;5;255m"; mod_bg="\033[48;5;31m"; mod_sep_fg="\033[38;5;31m"

reset="\033[0m"
reset_bg="\033[49m"

# ===== LINE 1: Location (matches shell prompt) =====
line1=""

# Hostname
line1+="${a_bg}${a_fg} ${hostname} ${a_sep_fg}"

# User
line1+="${b_bg}${sep}${b_fg} $(whoami) ${b_sep_fg}"

# Path
line1+="${c_bg}${sep}${c_fg} ${path} ${c_sep_fg}"

# Branch (if in git repo)
if [ -n "$branch" ]; then
    line1+="${y_bg}${sep}${y_fg}  ${branch} ${y_sep_fg}"
fi

# Close line 1
line1+="${reset_bg}${sep}${reset}"

# ===== LINE 2: Metrics =====
line2=""

# Model badge
line2+="${mod_bg}${mod_fg} ${model} ${mod_sep_fg}"

# Metrics section
line2+="${m_bg}${sep}${m_fg} "

# Context bar with color
line2+="${bar} \033[${ctx_fg}m${used_int}%%${m_fg}"

# Separator
line2+=" │ "

# Cost
line2+="${cost_fmt}"

# Duration
line2+=" │ ${duration}"

# Lines changed
if [ -n "$lines_info" ]; then
    line2+=" │ ${lines_info}"
fi

# Vim mode
if [ -n "$vim_mode" ]; then
    if [ "$vim_mode" = "NORMAL" ]; then
        line2+=" │ \033[38;5;114m${vim_mode}${m_fg}"
    else
        line2+=" │ \033[38;5;220m${vim_mode}${m_fg}"
    fi
fi

# Close line 2
line2+=" ${m_sep_fg}${reset_bg}${sep}${reset}"

# Output both lines
printf "${line1}\n"
printf "${line2}\n"

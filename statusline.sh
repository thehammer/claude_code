#!/usr/bin/env bash
# Claude Code statusline — fast, single-jq-call design
# Shows: model, repo:branch, open PRs, context %, cost, duration, lines changed, vim mode, version

# Claude Code version (cached per-session via env var to avoid subprocess on every render)
if [ -z "${_CC_VERSION:-}" ]; then
    export _CC_VERSION=$(claude --version 2>/dev/null | awk '{print $1}')
fi
cc_ver="${_CC_VERSION:-?}"

# Read all of stdin (Claude Code closes the pipe after writing)
input=$(cat) 2>/dev/null
[ -z "$input" ] && input='{}'

# Single jq call — outputs tab-separated values
# Note: use "-" placeholder for nullable strings; bash read swallows empty tab fields
IFS=$'\t' read -r model cost duration_ms used_pct lines_added lines_removed vim_mode cwd term_width \
    rl_5h_pct rl_5h_resets rl_7d_pct rl_7d_resets <<< \
    "$(echo "$input" | jq -r '[
        (.model.display_name // "?"),
        (.cost.total_cost_usd // 0),
        (.cost.total_duration_ms // 0),
        (.context_window.used_percentage // 0 | floor),
        (.cost.total_lines_added // 0),
        (.cost.total_lines_removed // 0),
        (.vim.mode // "-"),
        (.workspace.current_dir // .cwd // "-"),
        (.terminal.width // 0),
        (.rate_limits.five_hour.used_percentage // -1 | floor),
        (.rate_limits.five_hour.resets_at // 0),
        (.rate_limits.seven_day.used_percentage // -1 | floor),
        (.rate_limits.seven_day.resets_at // 0)
    ] | join("\t")' 2>/dev/null)" || {
    model="?" cost=0 duration_ms=0 used_pct=0
    lines_added=0 lines_removed=0 vim_mode="-" cwd="-" term_width=0
    rl_5h_pct=-1 rl_5h_resets=0 rl_7d_pct=-1 rl_7d_resets=0
}

# Defaults for empty fields
: "${model:=?}" "${cost:=0}" "${duration_ms:=0}" "${used_pct:=0}"
: "${lines_added:=0}" "${lines_removed:=0}" "${term_width:=0}"
: "${rl_5h_pct:=-1}" "${rl_5h_resets:=0}" "${rl_7d_pct:=-1}" "${rl_7d_resets:=0}"
# Convert placeholders to empty
[ "$vim_mode" = "-" ] && vim_mode=""
[ "$cwd" = "-" ] && cwd=""

# Claude Code's statusline JSON does not include terminal dimensions, so we
# have to derive the width ourselves. The statusline runs in a non-TTY
# subprocess piped from the parent — `stty size` fails and `tput cols` falls
# back to terminfo's hardcoded 80, neither of which is useful. tmux exposes
# the real pane width via `display -p`, which is what most of this user's
# environments will resolve to. Fall through to $COLUMNS / 120 only if
# nothing else works.
if [ "$term_width" -lt 1 ] 2>/dev/null; then
    if [ -n "${TMUX:-}" ]; then
        term_width=$(tmux display -p '#{pane_width}' 2>/dev/null)
    fi
    if [ -z "$term_width" ] || [ "$term_width" -lt 1 ] 2>/dev/null; then
        term_width="${COLUMNS:-120}"
    fi
fi

# Reserve a few columns of headroom — Claude Code shows a "…" ellipsis at
# the right edge when our line is even slightly longer than the usable
# width, so it must keep some columns for its own UI. This margin also
# absorbs tiny miscounts from ambiguous-width characters (▶ ⏸ ◆ are
# East-Asian "ambiguous" and may render as 2 cols in some emoji-presenting
# fonts even though our heuristic counts them as 1).
[ "$term_width" -gt 8 ] && term_width=$(( term_width - 4 ))

# --- Session type (from IDE registry, keyed by tmux pane) ---
sess_type="" sess_emoji=""
if [ -n "${TMUX_PANE:-}" ]; then
    _pane_num="${TMUX_PANE#%}"
    _sess_file="$HOME/.claude/ide/sessions/tmux-${_pane_num}.json"
    if [ -f "$_sess_file" ]; then
        sess_type=$(jq -r '.type // ""' "$_sess_file" 2>/dev/null)
        case "$sess_type" in
            coding)     sess_emoji="💻" ;;
            debugging)  sess_emoji="🐛" ;;
            analysis)   sess_emoji="🔍" ;;
            planning)   sess_emoji="📋" ;;
            presenting) sess_emoji="📊" ;;
            learning)   sess_emoji="📚" ;;
            personal)   sess_emoji="🏠" ;;
            clauding)   sess_emoji="🔧" ;;
            launcher)   sess_emoji="🚀" ;;
            reviewing)  sess_emoji="👀" ;;
        esac
    fi
fi

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

# --- Open PRs (file-cached, background refresh, per-repo) ---
# Display moved to tmux status row 1 (tmux-status-info). We still refresh the
# per-repo cache here so tmux-status-info can sum them without knowing the CWD.
if [ -n "$repo" ]; then
    _pr_cache="/tmp/.claude-statusline-prs-${repo}"
    _pr_max_age=60
    _pr_stale=1
    if [ -f "$_pr_cache" ]; then
        _pr_age=$(( $(date +%s) - $(stat -f %m "$_pr_cache" 2>/dev/null || echo 0) ))
        [ "$_pr_age" -lt "$_pr_max_age" ] && _pr_stale=0
    fi
    if [ "$_pr_stale" -eq 1 ]; then
        _remote=$(git remote get-url origin 2>/dev/null)
        if [ -n "$_remote" ]; then
            _nwo=$(echo "$_remote" | sed -E 's#.*[:/]([^/]+/[^/.]+)(\.git)?$#\1#')
            ( gh pr list --repo "$_nwo" --state open --author @me --json number --jq 'length' > "$_pr_cache" 2>/dev/null ) &
        fi
    fi
fi

# --- Mother: capture rate limits for quota gate ---
# Jira, Sentry, email, calendar, Mother queue display, and PR count have all
# moved to tmux status row 1 (tmux-status-info). We still source segment.sh
# here to call mother_capture_rate_limits — it persists the rolling quota state
# so Mother's dispatch gate has a signal. Without this call the gate is a no-op.
_mother_segment=""
for _mp in \
    "$HOME/Code/mother/plugins/mother/statusline/segment.sh" \
    "$HOME/.claude/plugins/marketplaces/thehammer-mother/plugins/mother/statusline/segment.sh"
do
    [ -f "$_mp" ] && { _mother_segment="$_mp"; break; }
done
if [ -n "$_mother_segment" ]; then
    # shellcheck source=/dev/null
    source "$_mother_segment"
    mother_capture_rate_limits "$input"
fi

# Keep budget-posture.json fresh for Mother and Claudia. Fire-and-forget;
# Bishop's flock + mtime idempotency handles overlapping renders.
command -v bishop >/dev/null 2>&1 && bishop --refresh &

# --- Project-specific statusline extension ---
# Look for tools/statusline.sh in the project root (resolves through worktrees)
proj_seg=""
if [ -n "$cwd" ]; then
    _proj_root=""
    if [ "$is_worktree" -eq 1 ] && [ -n "${_gc:-}" ]; then
        _proj_root=$(cd "$_gc/.." 2>/dev/null && pwd)
    elif [ -n "$cwd" ]; then
        _proj_root=$(cd "$cwd" && git rev-parse --show-toplevel 2>/dev/null)
    fi
    if [ -n "$_proj_root" ]; then
        for _sl_path in "tools/statusline.sh" ".claude/statusline.sh"; do
            _proj_sl="${_proj_root}/${_sl_path}"
            if [ -x "$_proj_sl" ]; then
                proj_seg=$("$_proj_sl" 2>/dev/null)
                break
            fi
        done
    fi
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

# --- Plan rate-limit cache for the tmux status bar ---
# Rate-limit info is rendered by the tmux statusline (which has its own
# refresh tick), not here. We just keep a fresh cache around so the tmux
# helper can build a live countdown without waiting for a Claude Code
# render. Hidden values (older Claude Code versions) skip the write.
if [ "${rl_5h_pct:-(-1)}" -ge 0 ] 2>/dev/null && [ "${rl_7d_pct:-(-1)}" -ge 0 ] 2>/dev/null; then
    printf '%d:%d:%d:%d\n' "$rl_5h_pct" "$rl_5h_resets" "$rl_7d_pct" "$rl_7d_resets" \
        > /tmp/.claude-rate-limits 2>/dev/null
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

# Close repo group with separator
if [ -n "$rb" ]; then
    rb="${rb} │"
fi

# Version
vr=" │ \033[38;5;245mv${cc_ver}${D}"

# Cost
cost_fmt=$(printf '$%.2f' "$cost")

# Session type segment (emoji after model badge)
st=""
if [ -n "$sess_emoji" ]; then
    st=" ${sess_emoji}"
fi

# --- Split into left and right halves; pad with spaces so the right half
#     hugs the right edge of the terminal. The token meter and everything
#     after it lives on the right. ---
left_str="${MB}${W} ${model} ${SF}${B}${S}${D}${st}${rb}"
right_str="${bar} \033[38;5;${cc}m${pct}%%${D} │ ${cost_fmt} │ ${dur}${proj_seg}${lc}${vm}${vr} ${BF}\033[49m${S}${R}"

# Visible-width helper: strip ANSI CSI sequences, count codepoints, then add
# 1 for each known wide emoji (which renders as 2 columns but is 1 codepoint).
visible_width() {
    local s stripped n extras
    stripped=$(printf '%b' "$1" | sed -E $'s/\x1b\\[[0-9;]*[a-zA-Z]//g')
    # Collapse %% → % since the source has it doubled for printf-format
    # safety but the rendered output is a single %.  Without this, each
    # %% pair would over-count by 1 column.
    stripped="${stripped//%%/%}"
    n=${#stripped}
    extras=$(printf '%s' "$stripped" | grep -oE '[💻🐛🔍📋📊📚🏠🔧🚀👀]' 2>/dev/null | wc -l | tr -d ' ')
    echo $((n + ${extras:-0}))
}

vw_l=$(visible_width "$left_str")
vw_r=$(visible_width "$right_str")
pad=$(( term_width - vw_l - vw_r ))
[ "$pad" -lt 1 ] && pad=1
spaces=$(printf "%${pad}s" "")

printf "${left_str}${spaces}${right_str}\n"

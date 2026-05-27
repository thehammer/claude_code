#!/usr/bin/env bash
# lib/fred/format.sh — Shared formatting helpers for the Fred TUI dashboard.
# Source this file; do not execute directly (except --selftest).
#
# Usage:
#   source ~/.claude/lib/fred/format.sh
#
# Environment:
#   FRED_HOME   — override root (default: ~/.claude)
#   FRED_PLAIN  — set to 1 for ASCII-only / no ANSI output

# ==============================================================================
# Paths
# ==============================================================================

FRED_HOME="${FRED_HOME:-$HOME/.claude}"
FRED_STATE="${FRED_STATE:-$FRED_HOME/state/fred}"

# ==============================================================================
# Color and glyph constants
# Populated once at source time; honor FRED_PLAIN=1 for ASCII fallback.
# ==============================================================================

if [[ "${FRED_PLAIN:-0}" == "1" ]]; then
  # ASCII-only mode — no ANSI escapes, no emoji
  FRED_C_SAGE=""
  FRED_C_AMBER=""
  FRED_C_RED=""
  FRED_C_DIM=""
  FRED_C_BOLD=""
  FRED_C_RESET=""
  FRED_C_ACCENT=""

  FRED_G_UNREAD="*"
  FRED_G_HALF="o"
  FRED_G_READ="."
  FRED_G_DECLINED="x"
  FRED_G_CAL="[cal]"
  FRED_G_STAR="[*]"
  FRED_G_TROLLEY="[!]"
else
  # 256-color escapes
  FRED_C_SAGE=$'\e[38;5;108m'
  FRED_C_AMBER=$'\e[38;5;220m'
  FRED_C_RED=$'\e[38;5;203m'
  FRED_C_DIM=$'\e[2m'
  FRED_C_BOLD=$'\e[1m'
  FRED_C_RESET=$'\e[0m'
  FRED_C_ACCENT=$'\e[38;5;81m'

  FRED_G_UNREAD="●"
  FRED_G_HALF="◐"
  FRED_G_READ="○"
  FRED_G_DECLINED="✕"
  FRED_G_CAL="📅"
  FRED_G_STAR="🌟"
  FRED_G_TROLLEY="🚋"
fi

export FRED_HOME FRED_STATE
export FRED_C_SAGE FRED_C_AMBER FRED_C_RED FRED_C_DIM FRED_C_BOLD FRED_C_RESET FRED_C_ACCENT
export FRED_G_UNREAD FRED_G_HALF FRED_G_READ FRED_G_DECLINED FRED_G_CAL FRED_G_STAR FRED_G_TROLLEY

# ==============================================================================
# Time helpers
# ==============================================================================

# fred_relative_time <iso8601-utc>
# Given an ISO 8601 UTC timestamp (e.g. 2026-05-06T14:30:00Z), output a
# compact human-readable string relative to the current local day:
#   - Same local calendar day  → "9:42a" / "2:15p"
#   - Within last 6 days       → 3-letter weekday "Mon"
#   - Older                    → "Apr 28"
fred_relative_time() {
  local iso="${1:-}"
  if [[ -z "$iso" ]]; then
    echo "?"
    return
  fi

  # Strip sub-second precision / Z suffix, normalise to YYYY-MM-DDTHH:MM:SS
  local clean
  clean=$(echo "$iso" | sed 's/\.[0-9]*//' | sed 's/Z$//' | sed 's/+00:00$//')

  # BSD date: parse UTC then convert to local epoch
  local epoch
  epoch=$(date -j -f '%Y-%m-%dT%H:%M:%S' "${clean}" '+%s' 2>/dev/null) || {
    # Fallback: strip trailing fractional/tz more aggressively
    clean=$(echo "$iso" | sed 's/T.*//' )
    epoch=$(date -j -f '%Y-%m-%d' "${clean}" '+%s' 2>/dev/null) || { echo "?"; return; }
  }

  # The timestamp from Graph is UTC; BSD date -j without -u treats it as local.
  # Correct by offsetting: re-parse with UTC flag.
  local utc_epoch
  utc_epoch=$(TZ=UTC date -j -f '%Y-%m-%dT%H:%M:%S' "${clean}" '+%s' 2>/dev/null) || utc_epoch=$epoch

  local now_epoch
  now_epoch=$(date +%s)

  # Local midnight of today (seconds since epoch)
  local today_date
  today_date=$(date +%Y-%m-%d)
  local today_midnight
  today_midnight=$(date -j -f '%Y-%m-%d' "$today_date" '+%s')

  # Use local timezone for date bucketing — TZ="" means UTC in POSIX, so omit it
  local msg_date
  msg_date=$(date -r "$utc_epoch" '+%Y-%m-%d' 2>/dev/null) \
    || msg_date=$(date -j -f '%s' "$utc_epoch" '+%Y-%m-%d' 2>/dev/null) \
    || msg_date=""

  local msg_midnight
  msg_midnight=$(date -j -f '%Y-%m-%d' "${msg_date:-$today_date}" '+%s' 2>/dev/null) || msg_midnight=$today_midnight

  local diff_days=$(( (today_midnight - msg_midnight) / 86400 ))

  if [[ $diff_days -eq 0 ]]; then
    # Same day — display in local time (no TZ override = system local tz)
    local hhmm
    hhmm=$(date -r "$utc_epoch" '+%I:%M%p' 2>/dev/null) \
      || hhmm=$(date -j -f '%s' "$utc_epoch" '+%I:%M%p' 2>/dev/null) \
      || hhmm="?"
    # Strip leading zero from hour; convert AM/PM to lowercase a/p
    hhmm=$(echo "$hhmm" | tr '[:upper:]' '[:lower:]' | sed 's/^0//' | sed 's/am$/a/' | sed 's/pm$/p/')
    echo "$hhmm"
  elif [[ $diff_days -ge 1 && $diff_days -le 6 ]]; then
    # Within last week — 3-letter weekday
    date -r "$utc_epoch" '+%a' 2>/dev/null \
      || date -j -f '%s' "$utc_epoch" '+%a' 2>/dev/null \
      || echo "?"
  else
    # Older — "Apr 28"
    date -r "$utc_epoch" '+%b %-d' 2>/dev/null \
      || date -j -f '%s' "$utc_epoch" '+%b %-d' 2>/dev/null \
      || echo "?"
  fi
}

# fred_truncate <str> <width>
# Truncate string to at most <width> printable columns; append "…" if cut.
# ASCII-safe: counts bytes, not grapheme clusters — good enough for our use.
fred_truncate() {
  local str="$1"
  local width="${2:-40}"

  # Strip ANSI escapes before measuring length
  local plain
  plain=$(printf '%s' "$str" | sed $'s/\e\[[0-9;]*m//g')

  if [[ ${#plain} -le $width ]]; then
    printf '%s' "$str"
  else
    # Cut to width-1 and append ellipsis
    printf '%s' "${plain:0:$((width - 1))}…"
  fi
}

# fred_term_cols
# Echo the current terminal width — prefers tmux pane width when available,
# because tput reports the full terminal size, not the pane size, in split
# layouts. Falls back to tput then a sane default of 80.
fred_term_cols() {
  local cols
  if [[ -n "${TMUX_PANE:-}" ]]; then
    cols=$(tmux display-message -t "$TMUX_PANE" -p '#{pane_width}' 2>/dev/null)
  fi
  if [[ -z "${cols:-}" ]]; then
    cols=$(tput cols 2>/dev/null) || cols=80
  fi
  echo "${cols:-80}"
}

# fred_term_lines
# Echo the current terminal height — prefers tmux pane height when available,
# because tput reports the full terminal size, not the pane size, in split
# layouts. Falls back to tput then a sane default of 24.
fred_term_lines() {
  local lines
  if [[ -n "${TMUX_PANE:-}" ]]; then
    lines=$(tmux display-message -t "$TMUX_PANE" -p '#{pane_height}' 2>/dev/null)
  fi
  if [[ -z "${lines:-}" ]]; then
    lines=$(tput lines 2>/dev/null) || lines=24
  fi
  echo "${lines:-24}"
}

# fred_now_epoch
# Current UNIX timestamp.
fred_now_epoch() {
  date +%s
}

# fred_file_age <path>
# Seconds since mtime of <path>. If the file is missing, return 999999.
fred_file_age() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo 999999
    return
  fi
  local mtime now
  mtime=$(stat -f '%m' "$path" 2>/dev/null) || { echo 999999; return; }
  now=$(date +%s)
  echo $(( now - mtime ))
}

# ==============================================================================
# Greeting helper
# ==============================================================================

# fred_pick_greeting
# Read lib/fred/greetings.txt, select the section matching current local hour,
# and pick the entry for today (rotates by day-of-year).
fred_pick_greeting() {
  local greetings_file="$FRED_HOME/lib/fred/greetings.txt"
  if [[ ! -f "$greetings_file" ]]; then
    echo "Hello, neighbor."
    return
  fi

  local hour
  hour=$(date +%H)
  hour=$((10#$hour))

  # Map hour to section name
  local section
  if   [[ $hour -ge  5 && $hour -lt 11 ]]; then section="morning"
  elif [[ $hour -ge 11 && $hour -lt 14 ]]; then section="midday"
  elif [[ $hour -ge 14 && $hour -lt 18 ]]; then section="afternoon"
  elif [[ $hour -ge 18 && $hour -lt 22 ]]; then section="evening"
  else section="night"
  fi

  # Collect lines in the matching section
  local -a lines=()
  local in_section=0
  while IFS= read -r line; do
    if [[ "$line" == "## $section" ]]; then
      in_section=1
      continue
    fi
    if [[ "$line" == "## "* ]]; then
      in_section=0
      continue
    fi
    if [[ $in_section -eq 1 && -n "$line" ]]; then
      lines+=("$line")
    fi
  done < "$greetings_file"

  local count=${#lines[@]}
  if [[ $count -eq 0 ]]; then
    echo "Hello, neighbor."
    return
  fi

  local yday
  yday=$(date +%j)
  local idx=$(( 10#$yday % count ))
  echo "${lines[$idx]}"
}

# fred_clear_screen
# Homes the cursor and clears to end of screen — overwrites in place without
# pushing content into the tmux scrollback buffer.
# (Avoid \e[2J which scrolls old content into scrollback on every redraw.)
# In FRED_PLAIN=1 mode, emits nothing (no ANSI).
fred_clear_screen() {
  if [[ "${FRED_PLAIN:-0}" != "1" ]]; then
    printf '\e[H\e[J'
  fi
}

export -f fred_relative_time
export -f fred_truncate
export -f fred_term_cols
export -f fred_term_lines
export -f fred_now_epoch
export -f fred_file_age
export -f fred_pick_greeting
export -f fred_clear_screen

# ==============================================================================
# Self-test (bash lib/fred/format.sh --selftest)
# ==============================================================================

if [[ "${1:-}" == "--selftest" ]]; then
  set -euo pipefail

  failures=0

  assert_eq() {
    local label="$1" got="$2" want="$3"
    if [[ "$got" == "$want" ]]; then
      echo "  ✓ $label"
    else
      echo "  ✗ $label: got='$got' want='$want'"
      failures=$(( failures + 1 ))
    fi
  }

  echo "=== fred_truncate ==="
  assert_eq "short passthrough"  "$(fred_truncate 'hello' 10)"   "hello"
  assert_eq "exact width"        "$(fred_truncate 'hello' 5)"    "hello"
  assert_eq "truncate to 4+…"   "$(fred_truncate 'hello world' 5)" "hell…"
  assert_eq "width 1"           "$(fred_truncate 'abc' 1)"       "…"

  echo "=== fred_relative_time ==="
  # Today's date at noon UTC
  today_noon=$(date -u '+%Y-%m-%dT12:00:00Z')
  result=$(fred_relative_time "$today_noon")
  # Should contain 'a' or 'p' (am/pm marker) and digits — just check it's non-empty and not "?"
  if [[ "$result" != "?" && ${#result} -ge 3 ]]; then
    echo "  ✓ today noon → '$result'"
  else
    echo "  ✗ today noon: unexpected '$result'"
    failures=$(( failures + 1 ))
  fi

  # A date clearly > 6 days ago — should be "Month Day" format
  old_iso="2020-01-15T10:00:00Z"
  old_result=$(fred_relative_time "$old_iso")
  if [[ "$old_result" == "Jan 15" ]]; then
    echo "  ✓ old date → '$old_result'"
  else
    echo "  ✗ old date: got='$old_result' want='Jan 15'"
    failures=$(( failures + 1 ))
  fi

  # Empty input should return "?"
  assert_eq "empty input" "$(fred_relative_time '')" "?"

  echo "=== fred_file_age ==="
  tmp=$(mktemp)
  age=$(fred_file_age "$tmp")
  rm -f "$tmp"
  if [[ $age -le 2 ]]; then
    echo "  ✓ fresh file age=$age"
  else
    echo "  ✗ fresh file age=$age (expected ≤2)"
    failures=$(( failures + 1 ))
  fi
  missing_age=$(fred_file_age "/tmp/fred-selftest-does-not-exist-$$")
  assert_eq "missing file" "$missing_age" "999999"

  echo ""
  if [[ $failures -eq 0 ]]; then
    echo "All tests passed."
    exit 0
  else
    echo "$failures test(s) FAILED."
    exit 1
  fi
fi

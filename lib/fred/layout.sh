#!/usr/bin/env bash
# lib/fred/layout.sh — tmux session/window/pane setup for the Fred dashboard.
# Sourced by bin/fred. Not executed directly.
#
# Exports:
#   fred_session_exists   — returns 0 if a fred tmux session exists
#   fred_create_session   — creates the fred session with 3 panes
#   fred_apply_sweater    — reads .sweater and updates tmux border color

FRED_HOME="${FRED_HOME:-$HOME/.claude}"
FRED_STATE="${FRED_STATE:-$FRED_HOME/state/fred}"

# ------------------------------------------------------------------------------
# fred_session_exists
# Returns 0 if the fred tmux session already exists.
# ------------------------------------------------------------------------------
fred_session_exists() {
  tmux has-session -t fred 2>/dev/null
}

# ------------------------------------------------------------------------------
# fred_create_session
# Create the fred tmux session with three panes:
#   - mailbox pane (top-left or top-stacked)
#   - calendar pane (top-right or middle-stacked)
#   - REPL pane (bottom, running claude --agent fred)
#
# Layout decision:
#   cols >= 160: side-by-side info panes (top 35%) + REPL (bottom 65%)
#   cols  < 160: stacked — mailbox (15%), calendar (20%), REPL (remainder)
# ------------------------------------------------------------------------------
fred_create_session() {
  local term_cols term_lines
  term_cols=$(tput cols 2>/dev/null) || term_cols=80
  term_lines=$(tput lines 2>/dev/null) || term_lines=40

  if [[ $term_cols -ge 160 ]]; then
    # Wide layout: top strip (35%) split L/R, REPL below
    local top_pct=35
    local top_lines=$(( term_lines * top_pct / 100 ))
    [[ $top_lines -lt 8 ]] && top_lines=8

    # 1. Create session; the first window starts the REPL
    tmux new-session -d -s fred -n main \
      -x "$term_cols" -y "$term_lines" \
      "exec claude --agent fred"

    # REPL is pane 0. Split off top portion (mailbox+calendar strip).
    # Split horizontally: new pane above (percentage of total height)
    tmux split-window -t "fred:main.0" -v -b -l "$top_lines" \
      "exec $FRED_HOME/bin/fred-mailbox-pane"
    # Pane 0 is now the top strip (mailbox); pane 1 is REPL.
    # Split the mailbox pane vertically 50/50 to add calendar on the right.
    tmux split-window -t "fred:main.0" -h \
      "exec $FRED_HOME/bin/fred-calendar-pane"
    # Now: pane 0 = mailbox (left top), pane 1 = calendar (right top), pane 2 = REPL

    local mailbox_idx=0
    local calendar_idx=1
    local repl_idx=2
  else
    # Narrow/stacked layout
    local mailbox_lines=$(( term_lines * 15 / 100 ))
    local calendar_lines=$(( term_lines * 20 / 100 ))
    [[ $mailbox_lines  -lt 5 ]]  && mailbox_lines=5
    [[ $calendar_lines -lt 6 ]]  && calendar_lines=6

    # 1. Create session starting with REPL at the bottom
    tmux new-session -d -s fred -n main \
      -x "$term_cols" -y "$term_lines" \
      "exec claude --agent fred"

    # Split off calendar strip above REPL
    tmux split-window -t "fred:main.0" -v -b -l "$calendar_lines" \
      "exec $FRED_HOME/bin/fred-calendar-pane"
    # Split off mailbox strip above calendar
    tmux split-window -t "fred:main.0" -v -b -l "$mailbox_lines" \
      "exec $FRED_HOME/bin/fred-mailbox-pane"
    # Pane 0 = mailbox, pane 1 = calendar, pane 2 = REPL

    local mailbox_idx=0
    local calendar_idx=1
    local repl_idx=2
  fi

  # ── Pane titles ──
  tmux select-pane -t "fred:main.${mailbox_idx}"  -T '📬 mailbox'
  tmux select-pane -t "fred:main.${calendar_idx}" -T '📅 today'
  tmux select-pane -t "fred:main.${repl_idx}"     -T '💬 fred'

  # ── Pane border styling ──
  tmux set -t fred pane-border-status      top
  tmux set -t fred pane-border-format      ' #{pane_title} '
  tmux set -t fred pane-active-border-style 'fg=colour108'
  tmux set -t fred pane-border-style        'fg=colour108'

  # Focus the REPL pane so the user lands there
  tmux select-pane -t "fred:main.${repl_idx}"
}

# ------------------------------------------------------------------------------
# fred_apply_sweater
# Read $FRED_STATE/.sweater and update the active tmux border color.
# Called by bin/fred-calendar-pane after each render.
# ------------------------------------------------------------------------------
fred_apply_sweater() {
  local sweater_file="$FRED_STATE/.sweater"
  [[ -f "$sweater_file" ]] || return 0
  local color
  color=$(cat "$sweater_file" 2>/dev/null | tr -d '[:space:]')
  # Validate: only accept known colour values
  case "$color" in
    colour108|colour220|colour203) ;;
    *) return 0 ;;
  esac
  tmux set -t fred pane-active-border-style "fg=${color}" 2>/dev/null || true
}

export -f fred_session_exists
export -f fred_create_session
export -f fred_apply_sweater

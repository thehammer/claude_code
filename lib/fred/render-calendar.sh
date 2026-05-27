#!/usr/bin/env bash
# lib/fred/render-calendar.sh — Sourceable; defines fred_render_calendar.
#
# Usage:
#   source ~/.claude/lib/fred/render-calendar.sh
#   fred_render_calendar
#
# Renders the calendar pane to stdout (full clear+redraw).
# Falls back to stale cache if Graph API is unreachable; never crashes.
# Side-effect: writes sweater color to $FRED_STATE/.sweater for layout.sh.

# Source dependencies
if [[ -z "${FRED_FORMAT_LOADED:-}" ]]; then
  # shellcheck disable=SC1090
  source "$(dirname "${BASH_SOURCE[0]}")/format.sh"
  FRED_FORMAT_LOADED=1
fi

if [[ -z "${FRED_CALENDAR_LOADED:-}" ]]; then
  # shellcheck disable=SC1090
  source "$FRED_HOME/lib/services/calendar.sh" 2>/dev/null || true
  FRED_CALENDAR_LOADED=1
fi

# ------------------------------------------------------------------------------
# _fred_event_epoch <dateTime-string>
# Convert a Graph API dateTime (UTC, format: 2026-05-06T14:30:00.0000000)
# to a UNIX epoch. Returns empty string on failure.
# ------------------------------------------------------------------------------
_fred_event_epoch() {
  local dt="$1"
  # Strip sub-second precision
  local clean
  clean=$(echo "$dt" | sed 's/\.[0-9]*//')
  TZ=UTC date -j -f '%Y-%m-%dT%H:%M:%S' "$clean" '+%s' 2>/dev/null \
    || date -j -f '%Y-%m-%dT%H:%M:%S' "$clean" '+%s' 2>/dev/null \
    || echo ""
}

# ------------------------------------------------------------------------------
# _fred_event_hhmm <epoch>
# Format epoch as local h:mma (e.g. "9:30a", "2:15p").
# ------------------------------------------------------------------------------
_fred_event_hhmm() {
  local epoch="$1"
  [[ -z "$epoch" ]] && echo "?" && return
  local hhmm
  hhmm=$(date -j -r "$epoch" '+%I:%M%p' 2>/dev/null | tr '[:upper:]' '[:lower:]' | sed 's/^0//')
  echo "${hhmm:-?}"
}

# ------------------------------------------------------------------------------
# _fred_response_glyph <response>
# Map Graph API responseStatus.response to a display glyph.
# ------------------------------------------------------------------------------
_fred_response_glyph() {
  local resp="$1"
  case "$resp" in
    organizer|accepted) echo "${FRED_G_UNREAD}" ;;  # ●
    tentativelyAccepted) echo "${FRED_G_HALF}" ;;   # ◐
    declined)           echo "${FRED_G_DECLINED}" ;; # ✕
    *)                  echo "${FRED_G_READ}" ;;     # ○ (notResponded / unknown)
  esac
}

# ------------------------------------------------------------------------------
# _fred_sweater_color <events_json> <now_epoch>
# Compute and write sweater color to $FRED_STATE/.sweater.
# Logic: count events whose [start,end] overlaps [now, now+2h].
#   0 overlapping              → sage   (colour108)
#   1-2, no time overlap       → sage   (colour108)
#   contiguous back-to-back    → amber  (colour220)
#   any actual overlap         → red    (colour203)
# ------------------------------------------------------------------------------
_fred_sweater_color() {
  local events_json="$1"
  local now="$2"
  local window_end=$(( now + 7200 ))

  mkdir -p "$FRED_STATE"

  # Collect overlapping events: those where start < window_end AND end > now
  local overlapping
  overlapping=$(echo "$events_json" | jq --argjson now "$now" --argjson wend "$window_end" '
    [.value[] |
      select(
        (.start.dateTime | gsub("\\.[0-9]+$"; "") | strptime("%Y-%m-%dT%H:%M:%S") | mktime) < $wend
        and
        (.end.dateTime   | gsub("\\.[0-9]+$"; "") | strptime("%Y-%m-%dT%H:%M:%S") | mktime) > $now
      )
    ] | length
  ' 2>/dev/null) || overlapping=0

  local color="colour108"  # sage default

  if [[ $overlapping -ge 2 ]]; then
    # Check if any two events actually overlap (start of one < end of previous)
    local has_overlap
    has_overlap=$(echo "$events_json" | jq --argjson now "$now" --argjson wend "$window_end" '
      [.value[] |
        select(
          (.start.dateTime | gsub("\\.[0-9]+$"; "") | strptime("%Y-%m-%dT%H:%M:%S") | mktime) < $wend
          and
          (.end.dateTime   | gsub("\\.[0-9]+$"; "") | strptime("%Y-%m-%dT%H:%M:%S") | mktime) > $now
        )
      ] |
      sort_by(.start.dateTime) |
      to_entries |
      map(select(.key > 0) |
        .value.start.dateTime |
        gsub("\\.[0-9]+$"; "") |
        strptime("%Y-%m-%dT%H:%M:%S") |
        mktime
      ) as $starts |
      to_entries |
      map(select(.key < (length - 1)) |
        .value.end.dateTime |
        gsub("\\.[0-9]+$"; "") |
        strptime("%Y-%m-%dT%H:%M:%S") |
        mktime
      ) as $ends |
      # overlap exists if any start < its predecessor end
      ($starts | length) > 0 and
      reduce range($starts | length) as $i (false;
        . or ($starts[$i] < $ends[$i])
      )
    ' 2>/dev/null) || has_overlap=false

    if [[ "$has_overlap" == "true" ]]; then
      color="colour203"  # red
    else
      color="colour220"  # amber (back-to-back)
    fi
  fi

  echo "$color" > "$FRED_STATE/.sweater"
}

# ------------------------------------------------------------------------------
# fred_render_calendar
# Full clear+redraw of calendar pane.
# ------------------------------------------------------------------------------
fred_render_calendar() {
  # Ensure state dir exists (first-run safety)
  mkdir -p "$FRED_STATE" 2>/dev/null || true

  local cols lines
  cols=$(fred_term_cols)
  lines=$(fred_term_lines)

  local today
  today=$(date +%Y-%m-%d)
  local cache="$FRED_STATE/.calendar.cache.json"
  local stale=0

  # Attempt fresh fetch
  local json=""
  if json=$(get_calendar_for_date "$today" 2>/dev/null) \
     && [[ -n "$json" ]] \
     && printf '%s\n' "$json" | jq -e '.value' >/dev/null 2>&1; then
    printf '%s\n' "$json" > "$cache"
  elif [[ -f "$cache" ]]; then
    json=$(cat "$cache")
    stale=1
  else
    # No data — minimal placeholder
    fred_clear_screen
    local display_date
    display_date=$(date '+%a %b %-d')
    printf '%sToday · %s%s\n' "${FRED_C_BOLD}" "$display_date" "${FRED_C_RESET}"
    printf '\n'
    printf '%s↻ syncing…%s\n' "${FRED_C_DIM}" "${FRED_C_RESET}"
    echo "colour108" > "$FRED_STATE/.sweater" 2>/dev/null || true
    return 0
  fi

  local now
  now=$(fred_now_epoch)

  # Compute sweater color (side-effect: writes .sweater)
  _fred_sweater_color "$json" "$now" 2>/dev/null || true

  # ── Clear screen ──
  fred_clear_screen

  # ── Header ──
  local display_date
  display_date=$(date '+%a %b %-d')
  printf '%sToday · %s%s\n' "${FRED_C_BOLD}" "$display_date" "${FRED_C_RESET}"
  printf '\n'

  # Column layout: [glyph(1)] [space(1)] [time(6)] [space(1)] [subject(…)]
  local glyph_col=1
  local time_col=6
  local fixed=$(( glyph_col + 1 + time_col + 1 ))
  local subject_col=$(( cols - fixed ))
  [[ $subject_col -lt 8 ]] && subject_col=8

  local max_events=$(( lines - 5 ))
  [[ $max_events -lt 3 ]] && max_events=3

  local event_count=0
  local shown_now_marker=0
  local next_subject="" next_start_epoch=0

  # Sort events by start time, output as jq compact objects
  while IFS= read -r evt_json; do
    [[ $event_count -ge $max_events ]] && break

    local start_dt end_dt response subject_raw
    start_dt=$(printf '%s\n' "$evt_json"   | jq -r '.start.dateTime // ""')
    end_dt=$(printf '%s\n' "$evt_json"     | jq -r '.end.dateTime // ""')
    response=$(printf '%s\n' "$evt_json"   | jq -r '.responseStatus.response // "notResponded"')
    subject_raw=$(printf '%s\n' "$evt_json"| jq -r '.subject // "(no subject)"')

    local start_epoch end_epoch
    start_epoch=$(_fred_event_epoch "$start_dt")
    end_epoch=$(_fred_event_epoch "$end_dt")

    [[ -z "$start_epoch" ]] && continue

    # Track next upcoming event for footer
    if [[ $start_epoch -gt $now ]] && \
       ( [[ $next_start_epoch -eq 0 ]] || [[ $start_epoch -lt $next_start_epoch ]] ); then
      next_start_epoch=$start_epoch
      next_subject="$subject_raw"
    fi

    # "Now" separator — insert before the first event that spans now
    if [[ $shown_now_marker -eq 0 ]] \
       && [[ -n "$start_epoch" ]] && [[ -n "$end_epoch" ]] \
       && [[ $start_epoch -le $now ]] && [[ $end_epoch -gt $now ]]; then
      printf '%s── Now ─%s\n' "${FRED_C_ACCENT}" "${FRED_C_RESET}"
      shown_now_marker=1
      event_count=$(( event_count + 1 ))
    fi

    [[ $event_count -ge $max_events ]] && break

    local glyph time_str subject_t
    glyph=$(_fred_response_glyph "$response")
    time_str=$(_fred_event_hhmm "$start_epoch")
    subject_t=$(fred_truncate "$subject_raw" "$subject_col")

    # Style: dim if past, bold+accent if happening now
    local style_open="" style_close=""
    if [[ -n "$end_epoch" ]] && [[ $end_epoch -le $now ]]; then
      style_open="${FRED_C_DIM}"
      style_close="${FRED_C_RESET}"
    elif [[ -n "$end_epoch" ]] && [[ $start_epoch -le $now ]] && [[ $end_epoch -gt $now ]]; then
      style_open="${FRED_C_BOLD}${FRED_C_ACCENT}"
      style_close="${FRED_C_RESET}"
    fi

    printf '%s%s %-*s %-*s%s\n' \
      "$style_open" \
      "$glyph" \
      "$time_col"    "$time_str" \
      "$subject_col" "$subject_t" \
      "$style_close"

    event_count=$(( event_count + 1 ))
  done < <(printf '%s\n' "$json" | jq -c '.value | sort_by(.start.dateTime) | .[]?' 2>/dev/null)

  # Fill remaining rows
  local header_rows=2
  local used=$(( header_rows + event_count ))
  local fill=$(( lines - used - 1 ))
  local i
  for (( i=0; i<fill; i++ )); do printf '\n'; done

  # ── Footer: next event countdown or stale indicator ──
  # No trailing \n on the status line — printing \n on the last terminal row
  # scrolls everything up and loses content into the scrollback buffer.
  local footer=""
  if [[ $stale -eq 1 ]]; then
    footer="${FRED_C_DIM}↻ syncing… (calendar)${FRED_C_RESET}"
  elif [[ $next_start_epoch -gt 0 ]]; then
    local mins_away=$(( (next_start_epoch - now) / 60 ))
    local countdown
    if [[ $mins_away -ge 60 ]]; then
      local h=$(( mins_away / 60 ))
      local m=$(( mins_away % 60 ))
      countdown="${h}h ${m}m"
    else
      countdown="${mins_away}m"
    fi
    local next_trunc
    next_trunc=$(fred_truncate "$next_subject" 30)
    footer="${FRED_C_DIM}next: ${next_trunc} in ${countdown}${FRED_C_RESET}"
  else
    footer="${FRED_C_DIM}nothing else today${FRED_C_RESET}"
  fi

  printf '%s' "$footer"
}

export FRED_FORMAT_LOADED FRED_CALENDAR_LOADED

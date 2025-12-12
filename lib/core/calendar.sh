#!/bin/bash
# Calendar Helper Functions for Microsoft 365
#
# Provides functions to fetch and display calendar events with proper timezone conversion

# ==============================================================================
# Timezone Conversion
# ==============================================================================

utc_to_central_time() {
    # Convert UTC datetime string to Central Time (UTC-5 for CDT, UTC-6 for CST)
    # Input format: 2025-10-24T14:45:00.0000000
    # Output format: 9:45 AM

    local utc_datetime="$1"

    # Extract hour and minute
    local utc_hour=$(echo "$utc_datetime" | cut -d'T' -f2 | cut -d':' -f1)
    local minute=$(echo "$utc_datetime" | cut -d'T' -f2 | cut -d':' -f2)

    # Remove leading zeros
    utc_hour=$((10#$utc_hour))
    minute=$((10#$minute))

    # Convert to Central Time (CDT = UTC-5, CST = UTC-6)
    # TODO: Automatically detect DST vs Standard Time
    # For now, using CDT (UTC-5)
    local ct_hour=$((utc_hour - 5))

    # Handle day rollover
    if [ $ct_hour -lt 0 ]; then
        ct_hour=$((ct_hour + 24))
    fi

    # Convert to 12-hour format with AM/PM
    local period="AM"
    local display_hour=$ct_hour

    if [ $ct_hour -eq 0 ]; then
        display_hour=12
    elif [ $ct_hour -ge 12 ]; then
        period="PM"
        if [ $ct_hour -gt 12 ]; then
            display_hour=$((ct_hour - 12))
        fi
    fi

    # Format minute with leading zero if needed
    printf "%d:%02d %s" "$display_hour" "$minute" "$period"
}

# ==============================================================================
# Calendar Fetching
# ==============================================================================

get_calendar_for_date() {
    # Fetch calendar events for a specific date
    # Usage: get_calendar_for_date YYYY-MM-DD
    # Returns: JSON array of calendar events

    local date="$1"

    if [ -z "$date" ]; then
        echo "Error: Date required (format: YYYY-MM-DD)" >&2
        return 1
    fi

    # Calculate next day for end range
    local next_day=$(date -j -v+1d -f "%Y-%m-%d" "$date" "+%Y-%m-%d" 2>/dev/null)

    if [ -z "$next_day" ]; then
        echo "Error: Invalid date format. Use YYYY-MM-DD" >&2
        return 1
    fi

    # Fetch calendar data (using 5am UTC as start to catch late-night CT events)
    # Select only the fields we need to avoid parsing large HTML bodies
    m365 request \
        --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${date}T05:00:00Z&endDateTime=${next_day}T05:00:00Z&\$select=subject,start,end,organizer,location,responseStatus" \
        --method get
}

# ==============================================================================
# Calendar Display
# ==============================================================================

display_calendar() {
    # Display calendar events for a specific date in human-readable format
    # Usage: display_calendar YYYY-MM-DD [format]
    # Formats: simple (default), detailed, summary

    local date="$1"
    local format="${2:-simple}"

    if [ -z "$date" ]; then
        echo "Error: Date required (format: YYYY-MM-DD)" >&2
        return 1
    fi

    # Fetch calendar data
    local calendar_json=$(get_calendar_for_date "$date")

    if [ $? -ne 0 ]; then
        echo "Error fetching calendar data" >&2
        return 1
    fi

    # Count events
    local event_count=$(echo "$calendar_json" | jq '.value | length')

    if [ "$event_count" -eq 0 ]; then
        echo "No calendar events scheduled for $date"
        return 0
    fi

    # Format date for display
    local display_date=$(date -j -f "%Y-%m-%d" "$date" "+%A, %B %d, %Y" 2>/dev/null)

    case "$format" in
        simple)
            echo "Your Calendar - $display_date"
            echo ""

            # Extract and format events
            echo "$calendar_json" | jq -r '.value | sort_by(.start.dateTime) | to_entries[] |
                "\(.key)|\(.value.start.dateTime)|\(.value.end.dateTime)|\(.value.subject)|\(.value.organizer.emailAddress.name)"' | \
            while IFS='|' read -r index start_time end_time subject organizer; do
                local num=$((index + 1))
                local start_formatted=$(utc_to_central_time "$start_time")
                local end_formatted=$(utc_to_central_time "$end_time")

                echo "$num. $start_formatted - $end_formatted: $subject"
                echo "   Organizer: $organizer"
                echo ""
            done

            echo "Total: $event_count meetings"
            ;;

        summary)
            # Brief one-line format
            echo "$event_count meetings on $display_date:"
            echo "$calendar_json" | jq -r '.value | sort_by(.start.dateTime) | .[] |
                "\(.start.dateTime)|\(.subject)"' | \
            while IFS='|' read -r start_time subject; do
                local time_formatted=$(utc_to_central_time "$start_time")
                echo "  $time_formatted - $subject"
            done
            ;;

        *)
            echo "Error: Unknown format '$format'. Use: simple, summary" >&2
            return 1
            ;;
    esac
}

# ==============================================================================
# Convenience Functions
# ==============================================================================

show_today_calendar() {
    # Show calendar for today
    local today=$(date +%Y-%m-%d)
    display_calendar "$today" "${1:-simple}"
}

show_yesterday_calendar() {
    # Show calendar for yesterday
    local yesterday=$(date -v-1d +%Y-%m-%d)
    display_calendar "$yesterday" "${1:-simple}"
}

show_tomorrow_calendar() {
    # Show calendar for tomorrow
    local tomorrow=$(date -v+1d +%Y-%m-%d)
    display_calendar "$tomorrow" "${1:-simple}"
}

# ==============================================================================
# Export Functions
# ==============================================================================

export -f utc_to_central_time
export -f get_calendar_for_date
export -f display_calendar
export -f show_today_calendar
export -f show_yesterday_calendar
export -f show_tomorrow_calendar

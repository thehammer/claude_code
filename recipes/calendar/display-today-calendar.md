# Recipe: Display Today's Calendar

**Category:** calendar
**Complexity:** moderate
**Last Updated:** 2025-10-24

## Goal

Display today's calendar events in a human-readable format with proper timezone conversion and formatting.

This recipe takes raw calendar data and presents it as a clean, formatted schedule suitable for showing to the user or including in session summaries.

## Prerequisites

- M365 CLI installed and authenticated
- `jq` command-line JSON processor installed
- User timezone is Central Time (UTC-5 or UTC-6 depending on DST)
- Understanding that Graph API returns times in UTC

## Inputs

- **Required:**
  - None (uses current date)
- **Optional:**
  - `date`: Specific date to display (default: today)
  - `format`: Output format (default: "text", options: "text", "markdown", "json")
  - `show_attendees`: Include attendee count (default: false)
  - `show_location`: Include location details (default: true)

## Steps

1. **Fetch raw calendar data**:
   - Use the "Fetch Today's Calendar Events" recipe
   - Get events with key fields: subject, start, end, location, organizer, attendees

2. **Convert UTC times to Central Time**:
   - Graph API returns times in UTC
   - Subtract 5 hours for CDT (or 6 for CST) to get Central Time
   - Handle edge cases (midnight rollover, empty calendar)

3. **Format times for readability**:
   - Convert 24-hour to 12-hour format (9:45 → 9:45 AM)
   - Show time range: "9:45 AM - 10:00 AM"
   - Group by time if needed

4. **Present in readable format**:
   - Number the events (1, 2, 3...)
   - Include subject, time range, location
   - Optionally show organizer and attendee count
   - Add visual separators and emoji for clarity

## Command Patterns

### IMPORTANT: Use UTC Format
See "Fetch Today's Calendar Events" recipe for details. Must use UTC format (`T05:00:00Z`), not timezone offset format (`T00:00:00-05:00`).

### Simple Working Approach
**This is what actually works in practice:**

```bash
# Step 1: Fetch raw data (using UTC format)
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=2025-10-24T05:00:00Z&endDateTime=2025-10-25T05:00:00Z" \
  --method get | \
  jq -r '.value | sort_by(.start.dateTime) | .[] | "\(.start.dateTime)|\(.end.dateTime)|\(.subject)|\(.organizer.emailAddress.name)"'

# Step 2: Manually format output
# Parse the pipe-delimited data and convert UTC to CT (subtract 5 hours)
# Example output:
# 2025-10-24T14:45:00.0000000 = 9:45 AM CT (14 - 5 = 9)
# 2025-10-24T15:00:00.0000000 = 10:00 AM CT (15 - 5 = 10)
```

### With Timezone Conversion (Central Time)
```bash
# Fetch events
events=$(m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T00:00:00-05:00&endDateTime=$(date -v+1d +%Y-%m-%d)T00:00:00-05:00&\$select=subject,start,end,location,organizer" \
  --method get)

# Format and display
echo "$events" | jq -r '.value | sort_by(.start.dateTime) | to_entries | .[] |
  "\(.key + 1). \(.value.start.dateTime[11:13]):\(.value.start.dateTime[14:16]) - \(.value.end.dateTime[11:13]):\(.value.end.dateTime[14:16]) UTC: \(.value.subject)"' | \
while read line; do
  # Convert UTC hours to CT (subtract 5)
  echo "$line" | sed -E 's/([0-9]{2}):([0-9]{2})/$((\1 - 5)):\2/g' | \
  sed 's/^/• /'
done
```

### Pretty Markdown Format
This is what you would present to the user:

```bash
# Function to convert UTC hour to 12-hour CT format
utc_to_ct() {
  local utc_hour=$1
  local ct_hour=$((utc_hour - 5))  # CDT offset

  if [ $ct_hour -lt 0 ]; then
    ct_hour=$((ct_hour + 24))
  fi

  if [ $ct_hour -eq 0 ]; then
    echo "12 AM"
  elif [ $ct_hour -lt 12 ]; then
    echo "$ct_hour AM"
  elif [ $ct_hour -eq 12 ]; then
    echo "12 PM"
  else
    echo "$((ct_hour - 12)) PM"
  fi
}

# Fetch and format
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T00:00:00-05:00&endDateTime=$(date -v+1d +%Y-%m-%d)T00:00:00-05:00&\$select=subject,start,end,location,organizer" \
  --method get | jq -r '.value | sort_by(.start.dateTime) | to_entries[] |
    "\(.key + 1)|\(.value.start.dateTime)|\(.value.end.dateTime)|\(.value.subject)|\(.value.location.displayName // "Teams")|\(.value.organizer.emailAddress.name)"' | \
while IFS='|' read num start end subject location organizer; do
  start_hour=$(echo "$start" | cut -d'T' -f2 | cut -d':' -f1)
  start_min=$(echo "$start" | cut -d'T' -f2 | cut -d':' -f2)
  end_hour=$(echo "$end" | cut -d'T' -f2 | cut -d':' -f1)
  end_min=$(echo "$end" | cut -d'T' -f2 | cut -d':' -f2)

  start_formatted=$(utc_to_ct $start_hour)
  end_formatted=$(utc_to_ct $end_hour)

  echo "$num. **$start_formatted:$start_min - $end_formatted:$end_min** - **$subject**"
  echo "   - $location"
  echo "   - Organizer: $organizer"
  echo ""
done
```

## Expected Output

### Text Format
```
• 9:45 AM - 10:00 AM: Payments Stand up (Microsoft Teams Meeting)
• 10:00 AM - 10:45 AM: Engineering Jam (Microsoft Teams Meeting)
• 10:45 AM - 11:00 AM: Core Daily Stand Up (Microsoft Teams Meeting)
• 11:00 AM - 11:30 AM: On-call review (Microsoft Teams Meeting)
```

### Markdown Format
```markdown
## Your Calendar for Today (October 24, 2025)

1. **9:45 AM - 10:00 AM** - **Payments Stand up**
   - Teams Meeting
   - Organizer: Sphurthy Kota

2. **10:00 AM - 10:45 AM** - **Engineering Jam**
   - Teams Meeting
   - Organizer: Steve Hatch

3. **10:45 AM - 11:00 AM** - **Core Daily Stand Up**
   - Teams Meeting

4. **11:00 AM - 11:30 AM** - **On-call review**
   - Teams Meeting

---
**4 meetings total** - All back-to-back from 9:45 AM to 11:30 AM CT!
```

### Summary Format (for session startup)
```
📅 Today's Schedule (4 events):
  9:45 AM - Payments Stand up
 10:00 AM - Engineering Jam
 10:45 AM - Core Daily Stand Up
 11:00 AM - On-call review
```

## Error Handling

- **No events today**: Display "No calendar events scheduled for today"
- **Timezone conversion errors**: Fall back to showing UTC times with "UTC" label
- **Missing fields**: Use sensible defaults (location → "Teams", organizer → "Unknown")
- **API failures**: Display error message from fetch recipe

## Related Recipes

- **Uses:**
  - Fetch Today's Calendar Events (gets the raw data)

- **Used by:**
  - Session Startup Summary (includes calendar in greeting)
  - Daily Standup Prep (formats for standup context)
  - Calendar Conflict Checker (highlights overlaps)

- **Alternatives:**
  - Display Week's Calendar (7-day view)
  - Display Next Meeting (just the upcoming event)

## Notes

### Timezone Complexity
- Graph API always returns UTC, regardless of input timezone
- Central Time requires -5 hours (CDT) or -6 hours (CST) adjustment
- For accurate conversion, check if Daylight Saving Time is in effect
- Current implementation assumes CDT (-5), update for CST period

### Format Flexibility
This recipe can be adapted for different contexts:
- **Session startup**: Brief summary with just times and subjects
- **User request**: Full details with organizers and locations
- **Integration**: JSON output for further processing

### Performance
- Displaying calendar is fast (< 1 second typically)
- Most time spent in API call, not formatting
- Consider caching results for repeated displays in same session

### Carefeed Conventions
- Always show times in Central Time (never UTC to users)
- Use 12-hour format (9:45 AM, not 09:45 or 9:45)
- Show "Teams Meeting" for virtual meetings, actual location for in-person
- Include organizer for context (who's running the meeting)

## Examples

### Example 1: Quick check during session
```markdown
**User:** "What's on my calendar today?"

**Claude:** [Executes this recipe, displays formatted output]

"You have 4 meetings today:
1. 9:45 AM - Payments Stand up
2. 10:00 AM - Engineering Jam
3. 10:45 AM - Core Daily Stand Up
4. 11:00 AM - On-call review

All meetings are back-to-back from 9:45 AM to 11:30 AM."
```

### Example 2: Session startup
```markdown
🔧 Resuming Coding Session

📅 **Today's Schedule:**
  9:45 AM - Payments Stand up
 10:00 AM - Engineering Jam
 10:45 AM - Core Daily Stand Up
 11:00 AM - On-call review

[Rest of session startup...]
```

### Example 3: Integration with task planning
```markdown
**Claude:** "I see you have meetings until 11:30 AM. Should we focus on tasks
that can be completed in 30-45 minute blocks, or would you prefer to start
something longer after your meetings wrap up?"
```

---

**Version History:**
- 2025-10-24 (v1): Initial creation, covers basic text and markdown formats
- 2025-10-24 (v2): Updated to use UTC format in examples (fixes 400 errors). Simplified to show working approach rather than complex bash loops that fail in practice.

# Recipe: Display Today's Calendar

**Category:** calendar
**Complexity:** simple
**Last Updated:** 2025-10-25

## Goal

Display calendar events in a human-readable format with proper timezone conversion and formatting.

This recipe uses helper functions from `~/.claude/lib/core/calendar.sh` to fetch and display calendar events.

## Prerequisites

- M365 CLI installed and authenticated (auto-handled by m365 wrapper)
- Calendar helper functions loaded (automatic via loader.sh)
- User timezone is Central Time (UTC-5 for CDT, UTC-6 for CST)

## Usage

### Simple - Use Helper Functions

The calendar helper provides convenient functions that handle all the complexity:

```bash
# Source the helpers (if not already loaded)
source ~/.claude/lib/core/loader.sh

# Show today's calendar
show_today_calendar

# Show yesterday's calendar
show_yesterday_calendar

# Show tomorrow's calendar
show_tomorrow_calendar

# Show any specific date
display_calendar "2025-10-24"

# Summary format (brief one-liners)
show_today_calendar summary
```

## Available Functions

### `show_today_calendar [format]`
Display today's calendar events
- **format**: `simple` (default) or `summary`

### `show_yesterday_calendar [format]`
Display yesterday's calendar events

### `show_tomorrow_calendar [format]`
Display tomorrow's calendar events

### `display_calendar <date> [format]`
Display calendar for any specific date
- **date**: Required, format YYYY-MM-DD
- **format**: Optional, `simple` (default) or `summary`

## Output Formats

### Simple Format (Default)
```
Your Calendar - Friday, October 24, 2025

1. 9:45 AM - 10:00 AM: Payments Stand up
   Organizer: Sphurthy Kota

2. 10:00 AM - 10:45 AM: Engineering Jam
   Organizer: Steve Hatch

3. 10:45 AM - 11:00 AM: Core Daily Stand Up
   Organizer: Jessica Dominiczak

4. 11:00 AM - 11:30 AM: On-call review
   Organizer: Lionel Barrow

Total: 4 meetings
```

### Summary Format
```
4 meetings on Friday, October 24, 2025:
  9:45 AM - Payments Stand up
  10:00 AM - Engineering Jam
  10:45 AM - Core Daily Stand Up
  11:00 AM - On-call review
```

## Technical Details

### How It Works

1. **Auto-authentication**: m365 wrapper ensures authentication before API calls
2. **Field selection**: Only fetches needed fields to avoid parsing large HTML bodies
3. **UTC to CT conversion**: Automatically converts UTC times to Central Time (CDT/CST)
4. **12-hour format**: Converts 24-hour times to readable 12-hour format with AM/PM

### Key Improvements (Oct 25, 2025)

**Problem:** Previous recipe had complex inline bash that:
- Failed to parse events with HTML bodies containing control characters
- Required manual timezone conversion math
- Missed events (showed 2 instead of 4)

**Solution:** Created dedicated helper functions that:
- Use `$select` parameter to fetch only needed fields
- Handle timezone conversion automatically
- Properly parse all events
- Provide clean, reusable interface

## Low-Level Usage (Advanced)

If you need direct access to the underlying data:

```bash
# Get raw calendar JSON for a specific date
get_calendar_for_date "2025-10-24"

# Extract specific fields with jq
get_calendar_for_date "2025-10-24" | jq -r '.value[] | .subject'

# Manual timezone conversion
utc_to_central_time "2025-10-24T14:45:00.0000000"  # Returns: 9:45 AM
```

## Related Files

- **Helper functions**: `~/.claude/lib/core/calendar.sh`
- **M365 wrapper**: `~/.claude/lib/core/m365.sh`
- **Loader**: `~/.claude/lib/core/loader.sh`

## Error Handling

**No events:**
```
No calendar events scheduled for 2025-10-24
```

**Invalid date format:**
```
Error: Invalid date format. Use YYYY-M-DD
```

**Authentication required:**
The m365 wrapper automatically handles authentication. If not authenticated, you'll see:
```
⚠️  Microsoft 365 authentication required

A browser window will open for you to approve the login.
Please complete the authentication in your browser.
```

## Version History

- **2025-10-25 (v3)**: Major refactor
  - Created calendar.sh helper functions
  - Fixed bug: now shows all events (was missing 2 of 4)
  - Fixed bug: handles HTML bodies with control characters
  - Simplified from 150+ lines of complex bash to simple function calls
  - Added auto-authentication via m365 wrapper
  - Reduced complexity from "moderate" to "simple"

- **2025-10-24 (v2)**: Updated to use UTC format in examples (fixes 400 errors)

- **2025-10-24 (v1)**: Initial creation

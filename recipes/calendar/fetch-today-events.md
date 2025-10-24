# Recipe: Fetch Today's Calendar Events

**Category:** calendar
**Complexity:** simple
**Last Updated:** 2025-10-24

## Goal

Retrieve all calendar events for the current day from Microsoft 365 calendar.

This recipe provides raw event data suitable for further processing, analysis, or display. It returns the complete event objects including times, attendees, locations, and meeting details.

## Prerequisites

- M365 CLI installed (`m365 --version` works)
- Authenticated to Microsoft 365 (`m365 status` shows logged in)
- User's primary timezone is Central Time (UTC-5)
- Access to Microsoft Graph API calendar endpoints

## Inputs

- **Required:**
  - `date`: The date to query (default: today)
- **Optional:**
  - `timezone_offset`: UTC offset for the user's timezone (default: -05:00 for Central Time)
  - `select_fields`: Comma-separated list of fields to return (default: all fields)

## Steps

1. **Determine the date range**:
   - For "today", use midnight to midnight in the user's timezone
   - This ensures we get a complete 24-hour day, not UTC midnight

2. **Format dates for Microsoft Graph API**:
   - Use ISO 8601 format with timezone offset: `YYYY-MM-DDT00:00:00-05:00`
   - Start time: Today at 00:00:00 (midnight)
   - End time: Tomorrow at 00:00:00 (next midnight)

3. **Use calendarView endpoint**:
   - The `/me/calendar/calendarView` endpoint expands recurring events
   - This returns individual occurrences, not series masters
   - Requires both startDateTime and endDateTime parameters

4. **Execute query via M365 CLI**:
   - Use `m365 request` command for direct Graph API access
   - Method: GET
   - Returns JSON with `.value` array containing event objects

## Command Patterns

### IMPORTANT: Timezone Format Issue

**Graph API has inconsistent timezone handling:**
- ❌ **ISO 8601 with offset doesn't work**: `2025-10-24T00:00:00-05:00` returns 400 error
- ✅ **UTC format works reliably**: `2025-10-24T05:00:00Z` (midnight CT = 5am UTC)

**For Central Time queries:**
- Midnight CT = 05:00:00Z (CDT, UTC-5)
- Midnight CT = 06:00:00Z (CST, UTC-6)
- Always convert to UTC before making the request!

### Basic Query (All Fields) - WORKING
```bash
# For today (Oct 24, 2025) in Central Time
# Midnight CT = 5am UTC, next midnight = 5am UTC next day
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=2025-10-24T05:00:00Z&endDateTime=2025-10-25T05:00:00Z" \
  --method get
```

### With Field Selection (Faster)
```bash
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=2025-10-24T05:00:00Z&endDateTime=2025-10-25T05:00:00Z&\$select=subject,start,end,location,organizer" \
  --method get
```

### Dynamic (Today's Events) - CORRECTED
```bash
# Calculate UTC times for midnight CT
# CDT: Add 5 hours to CT to get UTC
# CST: Add 6 hours to CT to get UTC

TODAY=$(date +%Y-%m-%d)
TOMORROW=$(date -v+1d +%Y-%m-%d)

# For Central Daylight Time (CDT, UTC-5)
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${TODAY}T05:00:00Z&endDateTime=${TOMORROW}T05:00:00Z" \
  --method get

# For Central Standard Time (CST, UTC-6) - use T06:00:00Z instead
```

### Explanation
- `startDateTime`: Start of the date range in UTC (Z suffix = UTC/Zulu time)
- `endDateTime`: End of the date range in UTC (exclusive)
- `$select`: OData query parameter to limit fields returned (note: escape $ in bash)
- **Critical**: Must use UTC format (Z), not timezone offset format (-05:00)
- **Remember**: Output times are ALSO in UTC and need conversion for display

## Expected Output

JSON response with this structure:

```json
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users('...')/calendar/calendarView",
  "value": [
    {
      "subject": "Meeting Title",
      "start": {
        "dateTime": "2025-10-24T14:45:00.0000000",
        "timeZone": "UTC"
      },
      "end": {
        "dateTime": "2025-10-24T15:00:00.0000000",
        "timeZone": "UTC"
      },
      "location": {
        "displayName": "Microsoft Teams Meeting"
      },
      "organizer": {
        "emailAddress": {
          "name": "John Doe",
          "address": "john@example.com"
        }
      },
      "attendees": [...]
    }
  ]
}
```

**Success indicators:**
- HTTP 200 status (no error message)
- `.value` is an array (may be empty if no events)
- Times are returned in UTC (note: input is CT, output is UTC!)

## Error Handling

Common failures and solutions:

- **"Request failed with status code 400"**: Most likely timezone format issue
  - ❌ Problem: Used ISO 8601 with offset like `2025-10-24T00:00:00-05:00`
  - ✅ Solution: Use UTC format instead: `2025-10-24T05:00:00Z`
  - Graph API inconsistently handles timezone offsets - always use UTC (Z)

- **"Command 'request' was not found"**: M365 CLI not installed or not in PATH
  - Solution: Install with `npm install -g @pnp/cli-microsoft365`

- **"Error: Not logged in"**: No active M365 session
  - Solution: Run `m365 login` and authenticate

- **"Access denied"**: Insufficient calendar permissions
  - Solution: Check app permissions, may need admin consent for `Calendars.Read`

- **Empty `.value` array but events exist**: Date range doesn't match your timezone
  - Solution: Verify UTC conversion is correct
  - CDT (summer): Midnight CT = 05:00:00Z
  - CST (winter): Midnight CT = 06:00:00Z

- **Times don't match expected**: Remember output times are ALWAYS in UTC!
  - Solution: Use the "Display Today's Calendar" recipe to convert times
  - UTC times need -5 hours (CDT) or -6 hours (CST) to get Central Time

## Related Recipes

- **Used by:**
  - Display Today's Calendar (formats and converts timezones)
  - Check Calendar Conflicts (analyzes gaps between meetings)
  - Export Calendar to CSV (converts to tabular format)

- **Alternatives:**
  - Fetch Week's Events (similar but 7-day range)
  - Fetch Events by Date Range (arbitrary start/end dates)

## Notes

### Timezone Handling
- **Input timezone**: Use user's local timezone offset (-05:00 for CT)
- **Output timezone**: Microsoft Graph ALWAYS returns times in UTC
- **Conversion needed**: Yes, for display purposes

### Recurring Events
- The `calendarView` endpoint automatically expands recurring events
- Each occurrence appears as a separate event in the results
- Use `seriesMasterId` field to identify which series an occurrence belongs to

### Performance
- Limiting fields with `$select` significantly reduces response size
- For display purposes, you typically only need: subject, start, end, location
- Full event objects include lots of metadata (body HTML, attachments, etc.)

### Carefeed Conventions
- Always use Central Time for queries (even though output is UTC)
- Prefer `calendarView` over `events` endpoint (handles recurring meetings)
- Cache results for 5 minutes if querying repeatedly in same session

## Examples

### Example 1: Get today's events (raw JSON)
```bash
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T00:00:00-05:00&endDateTime=$(date -v+1d +%Y-%m-%d)T00:00:00-05:00" \
  --method get
```
Result: Returns all events for current calendar day in JSON format

### Example 2: Count today's meetings
```bash
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T00:00:00-05:00&endDateTime=$(date -v+1d +%Y-%m-%d)T00:00:00-05:00" \
  --method get | jq '.value | length'
```
Result: Returns number like `4` (four events today)

### Example 3: Get just meeting titles
```bash
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=$(date +%Y-%m-%d)T00:00:00-05:00&endDateTime=$(date -v+1d +%Y-%m-%d)T00:00:00-05:00&\$select=subject" \
  --method get | jq -r '.value[].subject'
```
Result:
```
Payments Stand up
Engineering Jam
Core Daily Stand Up
On-call review
```

---

**Version History:**
- 2025-10-24 (v1): Initial creation during M365 calendar integration exploration
- 2025-10-24 (v2): **CRITICAL FIX** - Corrected timezone format. Graph API requires UTC format (`T05:00:00Z`), not ISO 8601 with offset (`T00:00:00-05:00`). Updated all examples and error handling to reflect working format.

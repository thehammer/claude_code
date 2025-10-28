# Recipe: Read Confluence Page

**Category:** confluence
**Complexity:** simple
**Last Updated:** 2025-10-28

## Goal

Fetch and read the full content of a Confluence page using its page ID or URL.

Use this when you need to read documentation, design docs, or team knowledge stored in Confluence.

## Prerequisites

- Confluence credentials configured in `~/.claude/credentials/.env`:
  - `ATLASSIAN_EMAIL` - Your Atlassian account email
  - `ATLASSIAN_API_TOKEN` - API token from Atlassian account
- `jq` installed for JSON parsing
- `curl` for API requests

## Inputs

- **Required:**
  - `page_id`: Confluence page ID (numeric, e.g., `818872333`)
    - Can be extracted from URL: `.../pages/{PAGE_ID}/...`
  - OR `page_url`: Full Confluence page URL

- **Optional:**
  - `format`: Output format - `html`, `storage`, or `plain` (default: `storage`)

## Steps

1. **Extract Page ID from URL (if needed)**
   - Confluence URLs follow pattern: `https://carefeed.atlassian.net/wiki/spaces/{SPACE}/pages/{PAGE_ID}/{TITLE}`
   - Extract the numeric ID after `/pages/`

2. **Load Credentials**
   - Source credentials file to access API tokens

3. **Fetch Page Content**
   - Call Confluence REST API `/content/{id}` endpoint
   - Use `expand` parameter to get page body
   - Available expansions:
     - `body.storage` - HTML storage format (what's stored in DB)
     - `body.view` - Rendered HTML view
     - `version` - Page version info
     - `space` - Space information

4. **Parse and Display**
   - Extract content from JSON response
   - Display in requested format

## Command Patterns

### Get Page with Storage Format (HTML)

```bash
# Load credentials
source ~/.claude/lib/core/credentials.sh

# Fetch page
PAGE_ID="818872333"
curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
  "https://carefeed.atlassian.net/wiki/rest/api/content/${PAGE_ID}?expand=body.storage,version,space" \
  | jq -r '.'
```

### Extract Just the HTML Content

```bash
source ~/.claude/lib/core/credentials.sh

PAGE_ID="818872333"
curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
  "https://carefeed.atlassian.net/wiki/rest/api/content/${PAGE_ID}?expand=body.storage" \
  | jq -r '.body.storage.value'
```

### Get Page Metadata

```bash
source ~/.claude/lib/core/credentials.sh

PAGE_ID="818872333"
curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
  "https://carefeed.atlassian.net/wiki/rest/api/content/${PAGE_ID}?expand=version,space" \
  | jq '{
      id: .id,
      title: .title,
      space: .space.name,
      version: .version.number,
      lastModified: .version.when,
      lastModifiedBy: .version.by.displayName
    }'
```

### Extract Page ID from URL

```bash
# From full URL
URL="https://carefeed.atlassian.net/wiki/spaces/Engineering/pages/818872333/Splitting+Authentication+vs.+Application+User+Models"
PAGE_ID=$(echo "$URL" | grep -oE '/pages/[0-9]+/' | grep -oE '[0-9]+')
echo "Page ID: $PAGE_ID"
```

## Expected Output

### Successful Response
```json
{
  "id": "818872333",
  "type": "page",
  "title": "Splitting Authentication vs. Application User Models",
  "space": {
    "key": "Engineering",
    "name": "Engineering"
  },
  "body": {
    "storage": {
      "value": "<p>Content here...</p>",
      "representation": "storage"
    }
  },
  "version": {
    "number": 5,
    "when": "2025-10-28T10:00:00.000Z",
    "by": {
      "displayName": "Hammer"
    }
  }
}
```

## Error Handling

- **401 Unauthorized**:
  - Check `ATLASSIAN_EMAIL` and `ATLASSIAN_API_TOKEN` in credentials
  - Verify token hasn't expired
  - Regenerate token at: https://id.atlassian.com/manage-profile/security/api-tokens

- **404 Not Found**:
  - Verify page ID is correct
  - Check if page has been deleted or moved
  - Verify you have permission to view the page

- **403 Forbidden**:
  - You don't have permission to view this page
  - Ask page owner to grant access

- **Empty response**:
  - Check if credentials file exists: `ls ~/.claude/credentials/.env`
  - Verify credentials loaded: `echo $ATLASSIAN_EMAIL`

## Related Recipes

- **Uses:** Credential loading from `~/.claude/lib/core/credentials.sh`
- **Alternatives:**
  - Search pages: Use `confluence_search()` helper
  - Web browser: Open URL directly if you just need to read once

## Notes

### Confluence Storage Format vs View Format

- **storage**: Raw HTML as stored in database, includes Confluence macros
  - Use for: Parsing structure, extracting specific elements
  - Contains: `<ac:structured-macro>` tags for Confluence features

- **view**: Rendered HTML ready for display
  - Use for: Human-readable output, displaying content
  - Macros are rendered (e.g., code blocks, info panels)

### Content Types

Confluence supports different content types:
- `page` - Standard wiki page
- `blogpost` - Blog post
- `comment` - Comment on page/post

### Page IDs vs Title

Always use page ID, not title, because:
- Titles can change, IDs are permanent
- Titles may contain special characters
- Multiple pages can have same title in different spaces

## Examples

### Example 1: Read Design Doc

```bash
source ~/.claude/lib/core/credentials.sh

# Get page ID from URL
URL="https://carefeed.atlassian.net/wiki/spaces/Engineering/pages/818872333/Splitting+Authentication+vs.+Application+User+Models"
PAGE_ID=$(echo "$URL" | grep -oE '/pages/[0-9]+/' | grep -oE '[0-9]+')

# Fetch full content
curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
  "https://carefeed.atlassian.net/wiki/rest/api/content/${PAGE_ID}?expand=body.storage,version" \
  | jq -r '.body.storage.value' > /tmp/confluence_page.html

# View in browser or parse with tools
cat /tmp/confluence_page.html
```

Result: HTML content saved to `/tmp/confluence_page.html` for reading/parsing

### Example 2: Get Page Summary

```bash
source ~/.claude/lib/core/credentials.sh

PAGE_ID="818872333"
curl -s -u "${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}" \
  "https://carefeed.atlassian.net/wiki/rest/api/content/${PAGE_ID}?expand=version,space" \
  | jq -r '"Title: \(.title)\nSpace: \(.space.name)\nVersion: \(.version.number)\nLast Updated: \(.version.when)\nBy: \(.version.by.displayName)"'
```

Result:
```
Title: Splitting Authentication vs. Application User Models
Space: Engineering
Version: 5
Last Updated: 2025-10-28T10:00:00.000Z
By: Hammer
```

---

**Version History:**
- 2025-10-28: Initial creation

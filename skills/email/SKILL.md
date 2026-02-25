---
name: email
description: Draft or send emails via Microsoft 365 Graph API. Creates drafts by default (safe). Use when user asks to email, draft, or message someone via Outlook.
---

# Email Skill

Draft or send emails using the m365 CLI and Microsoft Graph API.

## When to Use This Skill

Automatically trigger when the user:

- Asks to **email someone**: "Email Colin about...", "Send an email to..."
- Asks to **draft an email**: "Draft an email to...", "Write an email..."
- Mentions **Outlook**: "Put that in an Outlook draft"
- Wants to **follow up**: "Send a follow-up to..."

## Arguments

The `/email` command accepts natural language:
```
/email [recipients] [about topic]
/email draft to colin.smith@carefeed.com about the deployment
/email send to lionel.barrow@carefeed.com about the support case
```

If no arguments, ask the user for recipients and topic.

## Prerequisites

Requires `m365` CLI installed and authenticated:
```bash
m365 status
```

If not logged in, tell the user to run `m365 login`.

## Default Behavior: DRAFT (not send)

**IMPORTANT**: Always create a **draft** by default. Only send immediately if:
- User explicitly says "send" (not "draft", "write", "compose", "email")
- User confirms sending after reviewing the draft

## Creating a Draft

Use the Graph API via `m365 request` to create a message in the Drafts folder:

```bash
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/messages" \
  --method post \
  --body @/dev/stdin \
  --content-type "application/json" <<'JSONEOF'
{
  "subject": "Subject line here",
  "body": {
    "contentType": "HTML",
    "content": "<p>Email body here</p>"
  },
  "toRecipients": [
    {"emailAddress": {"address": "recipient@carefeed.com"}}
  ]
}
JSONEOF
```

The response will have `"isDraft": true` confirming it's in the Drafts folder.

## Sending an Email

Use the `m365 outlook mail send` command:

```bash
m365 outlook mail send \
  --subject "Subject line" \
  --to "recipient1@carefeed.com,recipient2@carefeed.com" \
  --bodyContents "Email body" \
  --bodyContentType HTML
```

## Adding Attachments

The Graph API supports adding attachments to drafts after creation:

```bash
# Get the message ID from the draft creation response
MESSAGE_ID="AAMk..."

# Add attachment (base64 encoded)
m365 request \
  --url "https://graph.microsoft.com/v1.0/me/messages/$MESSAGE_ID/attachments" \
  --method post \
  --body @/dev/stdin \
  --content-type "application/json" <<JSONEOF
{
  "@odata.type": "#microsoft.graph.fileAttachment",
  "name": "filename.pdf",
  "contentType": "application/pdf",
  "contentBytes": "$(base64 -i /path/to/file.pdf)"
}
JSONEOF
```

**Note**: For large files (>3MB), use upload sessions instead.

## Carefeed Email Directory

Common recipients (infer from first name or role):

| Name | Email |
|------|-------|
| Lionel Barrow | lionel.barrow@carefeed.com |
| Colin Smith | colin.smith@carefeed.com |
| Hammer | hammer@carefeed.com |

When the user says "email Colin", resolve to `colin.smith@carefeed.com`. If unsure, ask.

## Email Formatting

- Use HTML content type for rich formatting
- Keep emails professional but conversational (match Carefeed tone)
- Use `<p>` tags for paragraphs, `<strong>` for emphasis
- Use `<ul>/<li>` for lists, `<code>` for technical terms
- Escape special characters in JSON (quotes, apostrophes)

## Workflow

### Step 1: Gather Information

From the user's request, determine:
- **Recipients** (to, cc, bcc)
- **Subject** line
- **Body** content
- **Action**: draft (default) or send

### Step 2: Compose the Email

Write the email body based on context. If the conversation has relevant context (e.g., a support case, a bug report, a decision), use it to write a complete email.

### Step 3: Show Preview

Before creating the draft or sending, show a preview:

```
To: colin.smith@carefeed.com, lionel.barrow@carefeed.com
Subject: Need help filing AWS Support case
---
[Email body preview]
---
Creating draft in Outlook...
```

### Step 4: Create Draft or Send

- **Draft**: Use Graph API POST to `/me/messages`
- **Send**: Use `m365 outlook mail send`

### Step 5: Confirm

After creation:
- **Draft**: "Draft created in your Outlook Drafts folder. Open Outlook to review and send."
- **Send**: "Email sent to [recipients]."

If the draft needs an attachment the user mentioned, remind them to attach it manually in Outlook (or offer to attach via the API if the file path is known).

## Error Handling

### Not logged in
```
You're not logged into m365. Run: m365 login
```

### Permission denied
```
Your m365 app registration may not have Mail.ReadWrite permission.
Check: m365 status
```

### Invalid recipient
Validate email format before sending. If a name is given without domain, assume `@carefeed.com`.

## Anti-Patterns

- **Don't** send emails without explicit user confirmation
- **Don't** guess recipients — resolve names or ask
- **Don't** include sensitive data (passwords, tokens) in email bodies
- **Don't** send to external addresses without confirming with user

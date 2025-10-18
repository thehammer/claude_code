Provide an overview of the available slash commands and active session context.

## Available Slash Commands

Scan for all `.md` files in:
1. `~/.claude/commands/` (global commands)
2. `.claude/commands/` (project-specific commands, if in a project)

For each `.md` file found, list the command:
- Command name: `/filename` (without the .md extension)
- Brief description based on file content or common usage
- Usage example if applicable

Examples:
- `start.md` → `/start [type]` - Start a new session
- `wrapup.md` → `/wrapup` - Wrap up the current session
- `help.md` → `/help` - Show this help overview

If NO .md files are found in either location, state that clearly.

## Active Session Context

If `~/.claude/SESSION_START.md` has been read during this session, provide a summary of key behaviors and prompts you're watching for:

### Automatic Actions
- **"wrap up", "time to wrap up", "wrapup"** → Automatically run `/wrapup` command
- **"notify me when done", "let me know when finished", "ping me when ready"** → Send notification when task completes

### Session Management
- **Session type active**: [Show current session type if `/start` was used]
- **Session notes location**: [Show where session notes are being saved]
- **Todo list active**: [Show if TodoWrite is being used]

### Helper Functions Available
- List integration helper functions that are available (from `~/.claude/lib/integrations.sh`)
- Notification functions (if available)

## Configuration Locations

Show the user where key configuration files live:
- Global config: `~/.claude/`
- Project config: `.claude/` (if in a project)
- Credentials: `~/.claude/credentials/`
- Session notes: `.claude/session-notes/{type}/` or `~/.claude/session-notes/{type}/`

## Quick Tips

Provide 2-3 helpful tips based on the current context:
- If no session started: Suggest running `/start [type]`
- If in a project: Mention project-specific preferences
- If integrations available: Mention key integration capabilities

Keep the response concise and actionable.

Read ~/.claude/SESSION_START.md and follow all the instructions in it.

## Arguments

The `/start` command accepts the following format:
```
/start [session_type] [description...]
```

- **session_type** (optional): One of the valid session types. Defaults to 'coding' if not provided.
- **description** (optional): Any text after the session type becomes the session description.

**Valid session types:** coding, debugging, analysis, planning, presenting, learning, personal, clauding

**Examples:**
- `/start` → type=coding, no description
- `/start debugging` → type=debugging, no description
- `/start debugging the production branch vs master` → type=debugging, description="the production branch vs master"
- `/start coding implement user authentication` → type=coding, description="implement user authentication"

## Passing Description to SESSION_START.md

If a description was provided, include it in the instructions:
```
SESSION_DESCRIPTION: {description}
```

This allows SESSION_START.md and session type files to use the description for:
- Session notes header/context
- Initial prompt context
- SESSION_MARKER metadata

## Session Marker

IMPORTANT: After completing the session startup, emit a session marker comment for continuation detection.

**Without description:**
```html
<!-- SESSION_MARKER: type={session_type} date={YYYY-MM-DD} -->
```

**With description:**
```html
<!-- SESSION_MARKER: type={session_type} date={YYYY-MM-DD} description="{description}" -->
```

Replace {session_type} with the actual session type used (e.g., "clauding", "coding", "debugging").
Replace {YYYY-MM-DD} with today's date from the <env> block.
Replace {description} with the session description if provided.

This marker enables automatic session resumption when using --continue.

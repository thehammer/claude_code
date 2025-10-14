Read ~/.claude/SESSION_START.md and follow all the instructions in it.

If an argument was provided to this command, use it as the session type. Otherwise, default to 'coding'.

Valid session types: coding, debugging, analysis, planning, presenting, learning, personal, clauding

IMPORTANT: After completing the session startup, emit a session marker comment for continuation detection:

<!-- SESSION_MARKER: type={session_type} date={YYYY-MM-DD} -->

Replace {session_type} with the actual session type used (e.g., "clauding", "coding", "debugging").
Replace {YYYY-MM-DD} with today's date from the <env> block.

This marker enables automatic session resumption when using --continue.

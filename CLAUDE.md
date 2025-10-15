# Claude Code Session Continuity

## Automatic Session Resumption

**CRITICAL**: At the start of EVERY conversation, before your first response, execute this detection logic:

### Detection Steps

1. **Check if this is a continuation**: Do you see previous messages in the conversation history?

2. **If NO** (new conversation):
   - Skip resumption logic
   - Wait for user instruction or `/start` command
   - Proceed normally

3. **If YES** (continuation session):
   - Execute session type detection (see below)

### Session Type Detection (for continuations only)

**Primary Method** - Look for session marker:
- Search conversation history for: `<!-- SESSION_MARKER: type={session_type} date={date} -->`
- If found, extract the session type from the marker
- Example: `<!-- SESSION_MARKER: type=clauding date=2025-10-14 -->` → session type is "clauding"

**Fallback Method** - Look for /start command:
- If no marker found, search conversation history for the last `/start` command
- Example: User invoked `/start clauding` → session type is "clauding"
- Extract the argument (the session type) from the command

### Resumption Logic (if session type detected)

Once you've identified the session type:

1. **Check if already loaded**: Did you already read `~/.claude/SESSION_START.md` in THIS conversation?
   - Look for evidence: Did you read session type files, load context, etc.?
   - If YES: Context already loaded, continue normally (no action needed)
   - If NO: Proceed to step 2

2. **Automatic context reload** (only if context NOT already loaded):
   - Read `~/.claude/SESSION_START.md`
   - Read `~/.claude/session-types/{detected_type}.md`
   - Follow the startup instructions for that session type
   - Load the context specified in that session type definition
   - Inform the user clearly:
     ```
     🔄 **Resuming {session_type} session**

     I detected this is a continuation of a {session_type} session from {date}.
     I've automatically reloaded the session context and am ready to continue.
     ```

3. **If no session type detected**:
   - No marker and no `/start` command found
   - Inform user: "This appears to be a continuation, but I couldn't detect the previous session type. Would you like to run `/start <type>`?"

### Important Notes

- This logic runs **automatically** - you don't need to be prompted
- This happens **before** your first response in a continuation
- If resumption succeeds, pick up the conversation seamlessly
- If resumption fails, explain what went wrong and ask user to manually run `/start`
- Do NOT run this logic repeatedly - only on the first message of a continuation

### Example Scenarios

**Scenario 1**: User uses `--continue` to resume yesterday's coding session
- ✅ History exists → continuation detected
- ✅ Found marker: `<!-- SESSION_MARKER: type=coding date=2025-10-13 -->`
- ✅ Read SESSION_START.md and coding.md
- ✅ Loaded coding session context
- ✅ Informed user: "Resuming coding session from 2025-10-13"

**Scenario 2**: Fresh new conversation
- ❌ No history → not a continuation
- ⏭️ Skip resumption logic entirely
- ✅ Wait for user to run `/start` or give instructions

**Scenario 3**: Continuation but no marker (old session before this feature)
- ✅ History exists → continuation detected
- ❌ No marker found
- ✅ Fallback: Found `/start debugging` in history
- ✅ Resume debugging session
- ✅ Informed user: "Resuming debugging session"

---

**This file is automatically read by Claude Code on every message.**

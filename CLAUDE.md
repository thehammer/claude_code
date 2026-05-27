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
- Search conversation history for: `<!-- SESSION_MARKER: type={session_type} date={date} description="{description}" -->`
- If found, extract:
  - **session type** from the marker
  - **date** from the marker
  - **description** from the marker (optional)
- Examples:
  - `<!-- SESSION_MARKER: type=clauding date=2025-10-14 -->` → session type is "clauding", no description
  - `<!-- SESSION_MARKER: type=debugging date=2025-10-17 description="the production branch vs master" -->` → session type is "debugging", description is "the production branch vs master"

**Fallback Method** - Look for /start command:
- If no marker found, search conversation history for the last `/start` command
- Example: User invoked `/start debugging the production branch vs master` → session type is "debugging", description is "the production branch vs master"
- Extract both the session type (first argument) and description (remaining text) from the command

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
   - If a description was detected, use it to inform the session context
   - Inform the user clearly:

     **Without description:**
     ```
     🔄 **Resuming {session_type} session**

     I detected this is a continuation of a {session_type} session from {date}.
     I've automatically reloaded the session context and am ready to continue.
     ```

     **With description:**
     ```
     🔄 **Resuming {session_type} session: {description}**

     I detected this is a continuation of a {session_type} session from {date}.
     Focus: {description}

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

## ECS Production Safety Rules

**CRITICAL**: When working with ECS connections via `/shell` or the ECS tooling:

### Absolute Prohibitions

1. **NEVER send commands to tmux panes connected to production systems**
   - If you open a tmux pane with `/shell production ... pane`, you MUST NOT use `tmux send-keys` or any other mechanism to execute commands in that pane
   - The user must manually type all commands in production shells
   - This includes demo and canada environments - treat ALL remote ECS connections as production

2. **NEVER execute `ecs_connect` directly**
   - Only use `ecs_build_command` or `ecs_copy_command` to generate commands
   - Let the user execute the connection command themselves

3. **NEVER run destructive commands through ECS**
   - No `migrate:fresh`, `db:wipe`, or similar destructive operations
   - No bulk delete operations
   - No cache clearing without explicit user request

### Allowed Actions

- Generate and display ECS connection commands
- Copy commands to clipboard
- Open a tmux pane that runs the connection (but never send additional commands)
- Provide instructions for what the user should run manually

### When User Asks You to Run Something in Production

If the user asks you to "run this in production" or similar:

1. **Generate the command** they need
2. **Copy it to clipboard** if requested
3. **Explain what it does** and any risks
4. **Tell them to execute it manually**
5. **REFUSE to execute it yourself** in any remote shell

Example response:
```
I've copied the command to your clipboard. Please paste and run it manually in the production shell:

php artisan cache:clear

I cannot execute commands in production environments for safety reasons.
```

---

## Feature requests and bug reports — convention

Use `/doc` (backed by `~/.claude/bin/doc-mgr`) to file and manage all
project documentation. Supported types: `bug`, `feature`, `idea`,
`note`, `todo`, `wip`.

### Where to file

Docs are **always local to their project**. File in the nearest
`.claude/` directory up from CWD:

- **Repo-specific work** → `<repo>/.claude/` (e.g.
  `~/Code/callimachus/.claude/bugs/open/`)
- **Claude-config / harness bugs and features** → `~/.claude/` — only
  for things that are about the `~/.claude` repo itself (broken hooks,
  agent behaviour, tooling)

When in doubt: if it touches a repo's code, file it in that repo.

### Layout

```
.claude/
  bugs/open/          ← active bugs
  bugs/resolved/      ← fixed bugs
  features/backlog/   ← requested features
  features/shipped/   ← shipped features
  ideas/              ← loose ideas, no status
  notes/              ← decisions, reference, observations
  todos/open/         ← open action items
  todos/done/         ← completed todos
  wip/                ← multi-file working folders (one subdir per topic)
    <topic>/
      index.md        ← entry point
      ...             ← supporting files, data, scripts
```

### Filing a doc

```bash
# Get the path (wip also creates the folder)
path=$(~/.claude/bin/doc-mgr path bug "short title")
# Then write the file at $path using the appropriate template
```

Or just invoke `/doc` and describe what you want to file.

### Transitioning a doc

```bash
~/.claude/bin/doc-mgr move <full-path> resolved   # fix a bug
~/.claude/bin/doc-mgr move <full-path> shipped    # ship a feature
~/.claude/bin/doc-mgr move <full-path> done       # complete a todo
```

Git history preserves the content; the folder move is the
queue-management signal. WIP folders are renamed or deleted manually.

### Doc types

- **bug** — "the system is doing the wrong thing." File with a failing
  test repro when possible.
- **feature** — "the system doesn't do this yet." Promote to Ada/PRD
  when scope warrants it.
- **idea** — loose exploration, not yet committed.
- **note** — decision records, reference material, observations.
- **todo** — concrete action item with acceptance criteria.
- **wip** — active multi-file investigation or analysis. Lives in
  `wip/<topic>/` with an `index.md` entry point and any supporting
  artifacts (scripts, CSVs, sub-docs).

---

**This file is automatically read by Claude Code on every message.**

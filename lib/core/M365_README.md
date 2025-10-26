# Microsoft 365 CLI Auto-Authentication Wrapper

## Overview

All `m365` CLI commands now automatically check and ensure authentication before executing. If you're not authenticated, you'll be prompted to login via browser before the command proceeds.

## How It Works

### Two-Layer Implementation

**1. Script Wrapper (`~/bin/m365`)**
- Shadows the real m365 binary in PATH
- Intercepts all m365 command invocations
- Checks authentication status before each command
- Prompts for browser login if not authenticated
- Works in all contexts: Bash tool, interactive shells, recipes, scripts

**2. Function Wrapper (`~/.claude/lib/core/m365.sh`)**
- Loaded automatically by loader.sh
- Provides the same functionality in interactive shells
- Backup for shells where PATH doesn't prioritize ~/bin

### PATH Configuration

The wrapper works because `~/bin` comes **first** in PATH (configured in `~/.zshrc` line 452):

```bash
export PATH="$HOME/bin:$PATH"
```

This ensures the wrapper script at `~/bin/m365` is found before the real binary at `~/.nvm/versions/node/v22.19.0/bin/m365`.

## Usage

### You Don't Need to Do Anything Different!

All existing m365 commands work exactly the same:

```bash
# Status check
m365 status

# API requests
m365 request --url "https://graph.microsoft.com/v1.0/me" --method get

# Calendar queries
m365 request --url "https://graph.microsoft.com/v1.0/me/calendar/calendarView?..." --method get
```

### Authentication Flow

**If authenticated:**
- Commands execute immediately with no interruption

**If NOT authenticated:**
1. You'll see a clear notification:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ⚠️  Microsoft 365 authentication required

   A browser window will open for you to approve the login.
   Please complete the authentication in your browser.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

2. Browser window opens automatically
3. You approve the login in the browser
4. Command proceeds automatically after successful auth
5. Subsequent commands work without re-authenticating

## Technical Details

### Script Location and Structure

**Wrapper script:** `~/bin/m365`
- Executable bash script
- Calls real m365 binary at `/Users/hammer/.nvm/versions/node/v22.19.0/bin/m365`
- Uses `exec` to replace the wrapper process with the real m365 process

**Function wrapper:** `~/.claude/lib/core/m365.sh`
- Sourced by loader.sh (always loaded)
- Uses `command m365` to call the real binary
- Exports functions for use in interactive shells

### Authentication Check Logic

```bash
m365_is_authenticated() {
    status_output=$(m365 status 2>&1)
    exit_code=$?

    if [ $exit_code -eq 0 ] && echo "$status_output" | grep -q "connectedAs"; then
        return 0  # Authenticated
    else
        return 1  # Not authenticated
    fi
}
```

### Commands That Skip Auth Check

These commands bypass the auth check to avoid infinite recursion:
- `m365 login`
- `m365 logout`
- `m365 status`

## Maintenance

### If Real m365 Binary Location Changes

If NVM updates or m365 is installed in a different location, update line 10 in `~/bin/m365`:

```bash
M365_BIN="/path/to/new/m365/binary"
```

Find the new location with:
```bash
mv ~/bin/m365 ~/bin/m365.bak
which m365
```

### Disable the Wrapper

If you need to temporarily bypass the wrapper:

```bash
# Call the real binary directly
/Users/hammer/.nvm/versions/node/v22.19.0/bin/m365 status

# Or temporarily rename the wrapper
mv ~/bin/m365 ~/bin/m365.disabled
```

### Re-enable the Wrapper

```bash
mv ~/bin/m365.disabled ~/bin/m365
```

## Benefits

✅ **Automatic** - No manual auth checks needed
✅ **Transparent** - Works with all existing code unchanged
✅ **Clear UX** - User knows exactly what to do when auth is needed
✅ **Universal** - Works in Bash tool, recipes, session scripts, interactive shells
✅ **Reliable** - Prevents "not authenticated" errors mid-session

## Related Files

- **Script wrapper:** `~/bin/m365`
- **Function wrapper:** `~/.claude/lib/core/m365.sh`
- **Loader:** `~/.claude/lib/core/loader.sh` (line 29-32)
- **PATH config:** `~/.zshrc` (line 452)
- **Calendar recipe:** `~/.claude/recipes/calendar/display-today-calendar.md`
- **Session types:** Uses m365 in coding.md, debugging.md, clauding.md

## Version History

- **2025-10-25** - Initial implementation with dual wrapper approach
  - Created script wrapper in ~/bin/m365
  - Created function wrapper in lib/core/m365.sh
  - Updated PATH configuration in .zshrc
  - Tested in multiple contexts (Bash tool, interactive shell, recipes)

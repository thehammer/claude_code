# Bug: m365 CLI wrapper doesn't source nvm, fails in non-interactive shells

**Filed:** 2026-05-20
**Severity:** High (breaks all m365 Graph API access in Claude Code)
**Component:** m365 CLI integration
**Reporter:** Hammer
**Status:** inbox

## Summary

The m365 CLI wrapper script (`~/bin/m365`) invokes the real m365 binary without sourcing nvm first. This causes `node: No such file or directory` errors in non-interactive shell contexts (like Claude Code's Bash tool), even though the m365 CLI is installed and authenticated.

## Reproduction

```bash
# Direct call fails
/Users/hammer/bin/m365 request --url "https://graph.microsoft.com/v1.0/me" --method get
# Error: env: node: No such file or directory
```

**Workaround:**
```bash
# Works if you source nvm first
source ~/.nvm/nvm.sh && /Users/hammer/.nvm/versions/node/v22.19.0/bin/m365 request ...
```

## Root Cause

The wrapper at `~/bin/m365` is a shell script that directly calls `$M365_BIN` (the Node-based m365 CLI). Node.js is managed by nvm and only available in the PATH after `~/.nvm/nvm.sh` is sourced. Non-interactive shells (like Claude Code's bash execution) don't automatically source nvm, causing the Node runtime to be unavailable.

**Wrapper snippet:**
```bash
M365_BIN="/Users/hammer/.nvm/versions/node/v22.19.0/bin/m365"
m365_is_authenticated() {
    local status_output
    status_output=$("$M365_BIN" status 2>&1)  # ← Fails: Node not in PATH
    ...
}
```

## Expected Behavior

The wrapper should work in both interactive and non-interactive shells, making m365 CLI available globally without requiring users to manually source nvm.

## Proposed Fix

The wrapper script should source nvm before invoking m365:

```bash
# Initialize nvm if not already done
if [[ -z "$NVM_DIR" ]]; then
    export NVM_DIR="$HOME/.nvm"
    [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh"
fi

M365_BIN="/Users/hammer/.nvm/versions/node/v22.19.0/bin/m365"
...
```

This ensures Node is available in the PATH before any m365 calls.

## Impact

- ❌ `graph_request` from `/claude/lib/services/m365.sh` doesn't work in Claude Code
- ❌ All Graph API helpers (email, calendar, people search) fail
- ❌ Fred mailbox/calendar integration can't refresh
- ✅ Works only when users manually `source ~/.nvm/nvm.sh` first (not documented)

## Related

- `/Users/hammer/.claude/lib/services/m365.sh` (relies on m365 CLI)
- `/Users/hammer/.claude/lib/core/m365.sh` (auth wrapper)
- `/Users/hammer/bin/m365` (the affected wrapper)
- `~/.claude/skills/m365-setup/SKILL.md` (setup docs don't mention nvm requirement)

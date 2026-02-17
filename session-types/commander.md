# Commander Session Type

## Purpose
Central command center for managing multiple Claude Code sessions. This session type runs the IDE dashboard and coordinates other sessions.

## Context to Load

### 1. Minimal Context Only
This session focuses on coordination, not coding work.

- **Skip** all project context
- **Skip** git status, PRs, Jira
- **Skip** session notes (this isn't a work session)

### 2. Dashboard Mode
The commander session primarily runs the dashboard:
```bash
~/.claude/bin/ide-dashboard
```

## Behavior

### Window Position
Commander should be window 0 (first window) for easy access.

### Primary Functions
1. **Monitor sessions** - See all active Claude Code sessions
2. **Spawn sessions** - Create new sessions with project/type selection
3. **Jump to sessions** - Quick switch to any active session
4. **Cleanup** - Remove stale sessions from registry

### Not for Coding
This session type is NOT for doing actual work. It's for:
- Overview and coordination
- Launching and managing other sessions
- Quick checks on session status

## Skip Registration
Commander sessions should NOT register themselves in the registry (would be confusing).

## Startup Command
When starting a commander session, immediately launch the dashboard:
```bash
~/.claude/bin/ide-dashboard
```

## Window Name
🎛️ commander

## Summary Format
No summary needed - just launch the dashboard immediately.

## Token Budget
~1K tokens (minimal - just launch dashboard)

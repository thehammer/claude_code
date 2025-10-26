# Launcher Session Startup

## Purpose
Minimal context session designed for tmux environments. Loads just enough to launch other session types in new tmux windows. Optimized for speed - no integrations, no project context, no calendar checks.

## Context to Load

### 1. Tmux Helper Functions ONLY
```bash
source ~/.claude/lib/local/tmux.sh
```

This provides all the window/pane creation functions needed.

### 2. Session Types List
Quick reminder of available session types:
- `coding` - Building features, fixing bugs
- `debugging` - Investigating errors
- `analysis` - Understanding codebase
- `planning` - Task prioritization
- `presenting` - Creating PRs, docs
- `learning` - Understanding tech
- `personal` - Side projects
- `clauding` - Config improvements

### 3. Common Launcher Commands
Show available launcher commands:
- `tmux_create_coding_layout <project-dir>` - Create coding workspace
- `tmux_create_clauding_layout [description]` - Create clauding workspace
- `tmux new-window -n "name"` - Create blank window
- Manual: New window → `claude` → `/start <type>`

## Skip EVERYTHING ELSE

**DO NOT LOAD:**
- ❌ Calendar/M365 integration
- ❌ Any other integrations (Jira, Bitbucket, Slack, etc.)
- ❌ Session notes (no history needed)
- ❌ Global or project preferences
- ❌ TODO items
- ❌ Git status
- ❌ IDEAS.md
- ❌ Config health checks
- ❌ Integration status

This is a pure launcher - no context about work, just the ability to start work.

## Summary Format

Tell Hammer:
```
🚀 **Launcher Session Ready**

Available launcher commands:
  • tmux_create_coding_layout <project-dir>
  • tmux_create_clauding_layout [description]
  • Manual: C-b c (new window) → claude → /start <type>

Available session types: coding, debugging, analysis, planning, presenting, learning, personal, clauding

What would you like to launch?
```

Keep it minimal and fast. The goal is to be ready to launch other sessions, not to do work directly.

## Token Budget Target
~1-2K tokens for startup (95% savings - absolute minimum!)

## Notes
- No session notes for launcher sessions
- No wrapup needed
- Just a quick way to get tmux environment ready
- All real work happens in launched session windows

## Success Metrics
Good launcher session outcomes:
- ✅ Starts in <1 second
- ✅ Can immediately launch other session types
- ✅ No unnecessary context loaded
- ✅ User can quickly get to work

# Tmux/iTerm Integration - Work in Progress

**Status:** Phase 3 Complete - Coding Workspace Layouts Ready
**Last Updated:** 2025-10-25 (night)
**Session:** Clauding

---

## What's New in Phase 3

✅ **Coding Workspace Layouts**
- Natural language workflow: "start a coding session for the admin portal"
- Automatic 3-pane layout: Claude (left) | Emacs (top-right) / Shell (bottom-right)
- Changes to correct project directory
- Auto-initializes Claude with `/start coding`

✅ **Project Mappings File**
- Location: `~/.claude/PROJECTS.md`
- Maps friendly project names to directories
- Example: **admin portal** → `~/Code/portal_dev`
- Easy to extend with new projects

✅ **Helper Function: `tmux_create_coding_layout()`**
- Creates complete coding workspace in one call
- Location: `~/.claude/lib/local/tmux.sh`
- Handles directory validation and layout creation
- Returns focus to Claude pane

✅ **Recipe: Start Coding Session**
- Location: `~/.claude/recipes/tmux/start-coding-session.md`
- Step-by-step instructions for Claude to follow
- Includes error handling and project discovery
- Examples and customization options

⚠️ **Important:** Reload tmux helpers to use new function
```bash
source ~/.claude/lib/local/tmux.sh
```

---

## What's New in Phase 2

✅ **New shell function: `ct` (Claude Tab)**
- Quick command to open new Claude instances in tmux windows
- Supports session type names with emoji indicators
- Example: `ct coding` creates window "💻 coding"
- **Refined (2025-10-25 evening):** Silent loading, clear success feedback

✅ **New helper: `tmux_new_window()`**
- Low-level utility for creating tmux windows
- Auto-loads via `loader.sh`

✅ **Comprehensive recipe created**
- Location: `~/.claude/recipes/tmux/new-claude-tab.md`
- Documents all usage patterns and examples

✅ **Updated `cs` function**
- New sessions now start in `~/.claude` directory
- Perfect for clauding sessions and configuration work

⚠️ **Important:** Reload your shell or start fresh session to use new features
```bash
source ~/.zshrc
```

---

## Overview

Building out tmux/iTerm as primary IDE for Claude Code sessions, replacing VS Code as the main interface.

### Design Principle
**Favor recipes over helper functions** - Use recipes for workflows, helper functions for low-level utilities.

---

## Phase 1: Foundation (✅ COMPLETE)

### What We Built

#### 1. Shell Function: `cs` (Claude Session)
**File:** `~/.zshrc:369-388`

**Purpose:** Quick tmux session management with automatic Claude CLI startup and session initialization

**Usage:**
```bash
cs                    # Creates/attaches "claude" session, auto /start clauding
cs work               # Creates/attaches "work" session, auto /start clauding
cs portal-dev coding  # Creates/attaches "portal-dev" session, auto /start coding
```

**How it works:**
- First time: Creates new tmux session with given name, starts in `~/.claude`, automatically runs `claude` and sends `/start <session_type>` command
- Subsequent: Attaches to existing session, preserves everything
- Default session type: `clauding` (since we start in `~/.claude`)

**To activate:** `source ~/.zshrc` or open new terminal

**Updates:**
- **2025-10-25 evening:** New sessions start in `~/.claude` directory for easier config access
- **2025-10-25 late:** Auto-sends `/start` command when creating new sessions

---

#### 2. Tmux Helper Library
**File:** `~/.claude/lib/local/tmux.sh`

**Functions provided:**
- `tmux_is_active()` - Detect if running in tmux
- `tmux_get_session_name()` - Get current session name
- `tmux_get_window_info()` - Get window index and name
- `tmux_get_pane_index()` - Get current pane
- `tmux_rename_window(name)` - Rename current window
- **`tmux_set_claude_window(type)`** - Rename with session type emoji
- `tmux_split_horizontal(cmd)` - Create horizontal split pane
- `tmux_split_vertical(cmd)` - Create vertical split pane
- `tmux_send_keys(pane, keys)` - Send keys to pane
- `tmux_capture_pane(pane, lines)` - Capture pane output

---

#### 3. SESSION_START.md Integration
**File:** `~/.claude/SESSION_START.md:60-83`

**Added:** Step 0.4 - Update Tmux Window Name

**What it does:**
After determining session type (coding, debugging, etc.), automatically renames tmux window with emoji indicator.

**Window names:**
- 💻 coding
- 🐛 debug
- 🔍 analysis
- 📋 planning
- 📊 presenting
- 📚 learning
- 🏠 personal
- 🔧 clauding

**Behavior:** Silent no-op if not in tmux (VS Code still works)

---

#### 4. Updated PREFERENCES.md
**File:** `~/.claude/PREFERENCES.md:40-45`

**Added:** Guideline to favor recipes over helper functions

**When to use helpers:**
- Low-level utilities (parsing, formatting, validation)
- Frequently-called operations (dozens of times per session)
- Complex logic requiring error handling and state management
- Functions that compose well into recipes

**When to use recipes:**
- Workflows and multi-step processes
- Human-readable documentation needed
- Flexibility and maintainability prioritized

---

## Testing Checklist

### Step 1: Reload Shell Configuration
```bash
source ~/.zshrc
```

### Step 2: Test `cs` Function
```bash
# Exit current Claude session (Ctrl-D)
# Exit current tmux session (Ctrl-B D or type 'exit')

# From regular shell, test the cs function
cs test-session
```

**Expected result:**
- New tmux session created named "test-session"
- Claude CLI starts automatically
- You're at Claude prompt

### Step 3: Test `/start` Integration
```bash
# In Claude:
/start clauding
```

**Expected result:**
- Session loads normally
- Tmux window renames to "🔧 clauding" (check status bar)
- Everything works as before

### Step 4: Test Session Persistence
```bash
# In Claude, exit (Ctrl-D)
# Detach from tmux (Ctrl-B D)

# Reattach
cs test-session
```

**Expected result:**
- Reconnects to existing session
- History preserved
- Can run `claude` again manually

---

## Phase 2: Multi-Window Support (✅ COMPLETE)

### What We Built

#### 1. Helper: `tmux_new_window()`
**File:** `~/.claude/lib/local/tmux.sh:148-171`

**Purpose:** Low-level helper for creating tmux windows with optional name and command

**Usage:**
```bash
tmux_new_window "window_name" "command"
```

**Examples:**
```bash
tmux_new_window "💻 coding" "claude"
tmux_new_window "" "claude"
tmux_new_window "logs" "tail -f /var/log/app.log"
```

---

#### 2. Shell Function: `ct` (Claude Tab)
**File:** `~/.zshrc:390-437`

**Purpose:** Quick way to open new Claude sessions in new tmux windows with automatic session initialization

**Usage:**
```bash
ct              # Opens new Claude tab with default name
ct coding       # Opens new tab named "💻 coding", auto /start coding
ct debugging    # Opens new tab named "🐛 debug", auto /start debugging
ct my-feature   # Opens new tab named "my-feature" (no auto-start)
```

**How it works:**
- Validates you're in tmux (errors if not)
- Maps session type to emoji window name
- Creates new window with claude auto-started
- Automatically sends `/start <session_type>` command if session type is recognized
- Provides clear success feedback: `✓ Opened: 💻 coding (starting coding session)`

**To activate:** `source ~/.zshrc` or open new terminal

**Updates:**
- **2025-10-25 evening:** Silent helper loading, clear success messages
- **2025-10-25 late:** Auto-sends `/start` command for recognized session types

---

#### 3. Recipe: Opening New Claude Tabs
**File:** `~/.claude/recipes/tmux/new-claude-tab.md`

**Comprehensive documentation including:**
- Quick method using `ct` helper
- Manual method using tmux commands
- Advanced usage with helper library
- Session type mapping (emoji indicators)
- Navigation tips
- Use cases and examples
- Error handling

---

#### 4. Loader Integration
**File:** `~/.claude/lib/core/loader.sh:43-46`

**Added:** Automatic loading of tmux.sh helpers

**What it does:**
Ensures `tmux_new_window()` and other tmux helpers are always available when Claude Code starts

---

## Phase 3: Coding Workspace Layouts (✅ COMPLETE)

### What We Built

#### 1. Project Mappings File
**File:** `~/.claude/PROJECTS.md`

**Purpose:** Maps friendly project names to directory paths for easy lookup

**Format:**
```markdown
- **admin portal** → `~/Code/portal_dev`
- **api server** → `~/Code/api`
```

**Usage:** Claude reads this file when asked to start a coding session

---

#### 2. Helper Function: `tmux_create_coding_layout()`
**File:** `~/.claude/lib/local/tmux.sh:173-218`

**Purpose:** Creates a 3-pane coding workspace with automatic initialization

**Usage:**
```bash
tmux_create_coding_layout "~/Code/portal_dev" "💻 admin-portal"
```

**Arguments:**
- `$1` = Project directory path (required)
- `$2` = Window name (optional, defaults to "💻 coding")

**Layout Created:**
```
┌─────────────────┬─────────────────┐
│                 │                 │
│                 │     Emacs       │
│     Claude      │   (top-right)   │
│     (left)      ├─────────────────┤
│                 │                 │
│                 │     Shell       │
│                 │  (bottom-right) │
└─────────────────┴─────────────────┘
```

**Features:**
- Validates directory exists
- Expands tilde in paths
- Starts Claude and auto-runs `/start coding`
- Starts Emacs in top-right pane
- Provides shell in bottom-right pane
- All panes start in project directory
- Returns focus to Claude pane

---

#### 3. Recipe: Start Coding Session
**File:** `~/.claude/recipes/tmux/start-coding-session.md`

**Purpose:** Instructions for Claude to follow when user requests a coding workspace

**Workflow:**
1. Parse user's request for project name
2. Look up project in PROJECTS.md
3. Verify directory exists
4. Load tmux helpers
5. Create coding layout
6. Provide clear feedback

**Handles errors:**
- Project not found in mappings
- Directory doesn't exist
- Not in tmux session

---

### Future Enhancement Ideas

#### 1. Additional Layout Types
**Potential layouts for other session types:**
- **Debugging layout:** Claude + logs viewer + query shell
- **Analysis layout:** Claude + file browser + documentation viewer
- **Presenting layout:** Claude + preview pane + notes

#### 2. More Tmux Recipes
**Where:** `~/.claude/recipes/tmux/`

**Ideas:**
1. **`debug-production-issue.md`** - Debugging layout with logs and queries
2. **`parallel-command-runner.md`** - Run commands in multiple panes
3. **`session-persistence.md`** - Save and restore layouts
4. **`start-debugging-session.md`** - Similar to coding but for debugging

#### 3. iTerm-Specific Features

**Potential integrations:**
- iTerm badges (show session type in window)
- iTerm notifications (build complete, tests pass/fail)
- iTerm marks (mark important output)
- Profile switching (different colors per session type?)

---

## Phase 2 Testing Checklist

**To verify Phase 2 is working correctly:**

1. **Reload shell config:**
   ```bash
   source ~/.zshrc
   ```

2. **Verify ct function exists:**
   ```bash
   type ct
   # Should show: "ct is a shell function from /Users/hammer/.zshrc"
   ```

3. **Test opening new window:**
   ```bash
   ct coding
   # Should create new window named "💻 coding" with Claude starting
   ```

4. **Verify window was created:**
   ```bash
   # Press Ctrl-B w to list windows
   # Or run: tmux list-windows
   # Should see both original window and new "💻 coding" window
   ```

5. **Test navigation:**
   - `Ctrl-B n` to switch to next window
   - `Ctrl-B p` to switch back
   - Both should work smoothly

6. **Test other session types:**
   ```bash
   ct debugging    # Should create "🐛 debug"
   ct analysis     # Should create "🔍 analysis"
   ```

**Status:** Ready for testing in fresh session

---

## Current Recommendations

**Start simple:**
1. ✅ Use `cs` function for all sessions
2. ✅ Let `/start` auto-rename tmux windows
3. ✅ Create panes manually as needed
4. 🔜 Observe patterns over several sessions
5. 🔜 Build recipes for repeated patterns
6. 🔜 Evolve based on actual usage

**Don't over-engineer:**
- Start with single pane for all session types
- Create splits when you need them
- Document patterns that emerge
- Codify into recipes when pattern is clear

---

## Files Modified

**Phase 1:**
1. `~/.zshrc` - Added `cs()` function
2. `~/.claude/lib/local/tmux.sh` - Created tmux helper library
3. `~/.claude/SESSION_START.md` - Added step 0.4 for tmux window renaming
4. `~/.claude/PREFERENCES.md` - Added recipes-vs-helpers guideline

**Phase 2:**
5. `~/.zshrc` - Added `ct()` function for opening new Claude tabs
6. `~/.claude/lib/local/tmux.sh` - Added `tmux_new_window()` helper
7. `~/.claude/lib/core/loader.sh` - Added tmux.sh to auto-load list
8. `~/.claude/recipes/tmux/new-claude-tab.md` - Created comprehensive recipe

**Phase 2 Refinements (2025-10-25 evening):**
9. `~/.zshrc` - Updated `ct()` for silent loading and success feedback
10. `~/.zshrc` - Updated `cs()` to start new sessions in `~/.claude` directory

**Phase 3 (2025-10-25 night):**
11. `~/.claude/PROJECTS.md` - Created project mappings file
12. `~/.claude/lib/local/tmux.sh` - Added `tmux_create_coding_layout()` function
13. `~/.claude/recipes/tmux/start-coding-session.md` - Created recipe for coding workspaces

---

## Testing Environment

**Current session info:**
- Terminal: iTerm2 v3.6.4
- Tmux session: 2
- Window: 1:🔧 clauding (renamed via helper!)
- Pane: 0
- Shell: zsh

**Verified working:**
- ✅ Environment detection (TMUX, ITERM_SESSION_ID, etc.)
- ✅ `tmux_set_claude_window()` function
- ✅ Window successfully renamed to "🔧 clauding"

---

## Questions to Resolve Next Session

1. Should we create default layouts for different session types?
2. What tmux recipes would be most valuable to build first?
3. Do we need iTerm-specific integrations (badges, notifications)?
4. Should Claude automatically create monitoring panes for long tasks?
5. How should we handle multi-project workflows?

---

## Success Criteria

**Phase 1:** ✅
- [x] `cs` function works
- [x] Tmux window auto-renames on `/start`
- [x] Works seamlessly with existing workflows
- [x] No breaking changes to VS Code usage

**Phase 2:** ✅
- [x] `ct` function for opening new Claude tabs
- [x] `tmux_new_window()` helper available
- [x] Recipe documenting multi-window workflow
- [x] Helpers auto-load via loader.sh
- [x] Silent loading with clear feedback (refined 2025-10-25)
- [x] `cs` starts in ~/.claude for config work (refined 2025-10-25)

**Phase 3:** ✅
- [x] Coding workspace layout implemented
- [x] Project mappings file created (PROJECTS.md)
- [x] Helper function for 3-pane layout
- [x] Recipe for starting coding sessions
- [x] Natural language workflow ("start a coding session for X")
- [x] Automatic directory navigation and initialization

**Future Enhancements:**
- [ ] Additional layout types (debugging, analysis, presenting)
- [ ] More tmux recipes for specific workflows
- [ ] iTerm-specific integrations (badges, notifications)

---

## Troubleshooting

### Workspace Trust Prompt on `cs` Startup

**Problem:** When running `cs` (which starts Claude in `~/.claude`), you see:
```
Do you trust the files in this folder?
/Users/hammer/.claude
```

**Solution:** Add `~/.claude` to Claude Code's trusted projects:

Create or update `~/.claude/.claude.json`:
```json
{
  "projects": {
    "/Users/hammer/.claude": {
      "allowedTools": []
    }
  }
}
```

**Why:** When `cs` starts a new session, it begins in `~/.claude` (perfect for clauding sessions). Claude Code's workspace trust feature prompts for untrusted directories. Pre-configuring the directory in `.claude.json` skips the trust dialog.

**Status:** ✅ Fixed (2025-10-25)

---

### "can't find window: 0" Error on `cs` Startup

**Problem:** When creating a new session with `cs`, error messages appear before attaching:
```
can't find window: 0
can't find window: 0
```
And the `/start` command never executes automatically.

**Root cause:** The `cs` function was using `tmux send-keys -t "$session_name:0"` to send the `/start` command. When creating a session with a command argument (`"claude"`), tmux's window indexing isn't immediately stable, causing the `:0` window reference to fail.

**Solution:** Remove the `:0` window specification. Changed from:
```bash
tmux send-keys -t "$session_name:0" "/start $session_type"
```
To:
```bash
tmux send-keys -t "$session_name" "/start $session_type"
```

**Why this works:** When you send keys without specifying a window, tmux sends them to the current window of that session. Since we just created the session with only one window, this is more reliable.

**Location:** `~/.zshrc:383,387`

**Status:** ✅ Fixed (2025-10-25)

---

## Quick Start

### First Time Setup

**IMPORTANT:** After Phase 2 changes, you need to reload your shell configuration:

**Option 1: Reload in current shell**
```bash
source ~/.zshrc
```

**Option 2: Start a fresh session (recommended)**
```bash
# Exit current Claude session (Ctrl-D)
# Exit current tmux session or open new terminal
cs my-session
```

### Usage

**Start a new tmux session with Claude:**
```bash
cs my-session
```

**Open additional Claude tabs within the session:**
```bash
ct              # Default window
ct coding       # "💻 coding" window
ct debugging    # "🐛 debug" window
```

**Create a coding workspace with layout (NEW in Phase 3):**

Ask Claude in natural language:
```
"Start a coding session for the admin portal"
"Create a coding workspace for the API"
```

Claude will:
1. Look up the project in `~/.claude/PROJECTS.md`
2. Create a 3-pane layout (Claude left, Emacs top-right, Shell bottom-right)
3. Change to the project directory
4. Auto-initialize Claude with `/start coding`

**Navigate between windows:**
- Next: `Ctrl-B n`
- Previous: `Ctrl-B p`
- Select by number: `Ctrl-B [0-9]`
- List all: `Ctrl-B w`

**Navigate between panes:**
- Arrow keys: `Ctrl-B ↑/↓/←/→`
- Next pane: `Ctrl-B o`
- Last pane: `Ctrl-B ;`

**See the recipes for full details:**
```bash
cat ~/.claude/recipes/tmux/new-claude-tab.md
cat ~/.claude/recipes/tmux/start-coding-session.md
```

# Tmux/iTerm Integration - Work in Progress

**Status:** Phase 2 Complete - Multi-Window Support Ready
**Last Updated:** 2025-10-25
**Session:** Clauding

---

## What's New in Phase 2

✅ **New shell function: `ct` (Claude Tab)**
- Quick command to open new Claude instances in tmux windows
- Supports session type names with emoji indicators
- Example: `ct coding` creates window "💻 coding"

✅ **New helper: `tmux_new_window()`**
- Low-level utility for creating tmux windows
- Auto-loads via `loader.sh`

✅ **Comprehensive recipe created**
- Location: `~/.claude/recipes/tmux/new-claude-tab.md`
- Documents all usage patterns and examples

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
**File:** `~/.zshrc:369-376`

**Purpose:** Quick tmux session management with automatic Claude CLI startup

**Usage:**
```bash
cs              # Creates/attaches "claude" session, runs claude
cs clauding     # Creates/attaches "clauding" session, runs claude
cs portal-dev   # Creates/attaches "portal-dev" session, runs claude
```

**How it works:**
- First time: Creates new tmux session with given name, automatically runs `claude` command
- Subsequent: Attaches to existing session, preserves everything

**To activate:** `source ~/.zshrc` or open new terminal

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
**File:** `~/.zshrc:378-414`

**Purpose:** Quick way to open new Claude sessions in new tmux windows

**Usage:**
```bash
ct              # Opens new Claude tab with default name
ct coding       # Opens new tab named "💻 coding"
ct debugging    # Opens new tab named "🐛 debug"
ct my-feature   # Opens new tab named "my-feature"
```

**How it works:**
- Validates you're in tmux (errors if not)
- Maps session type to emoji window name
- Creates new window with claude auto-started
- User can then run `/start` in the new window

**To activate:** `source ~/.zshrc` or open new terminal

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

## Phase 3: Next Steps (🔜 NOT STARTED)

### Potential Enhancements

#### 1. Session-Specific Layouts
**Question:** Should different session types auto-create pane layouts?

**Options:**
- **Minimal (current):** Single pane, create splits manually as needed
- **Automatic:** Pre-configured layouts per session type
- **Hybrid:** Simple default + recipes for complex layouts

#### 2. Additional Tmux Recipes
**Where:** `~/.claude/recipes/tmux/`

**Potential recipes:**
1. **`setup-coding-workspace.md`** - Multi-pane development layout
2. **`debug-production-issue.md`** - Debugging layout with logs and queries
3. **`parallel-command-runner.md`** - Run commands in multiple panes
4. **`session-persistence.md`** - Save and restore layouts

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

**Phase 3 (Future):**
- [ ] Common workflow recipes created
- [ ] Session-type specific behaviors documented
- [ ] Multi-pane patterns established
- [ ] iTerm integrations (if valuable)

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

**Navigate between windows:**
- Next: `Ctrl-B n`
- Previous: `Ctrl-B p`
- Select by number: `Ctrl-B [0-9]`
- List all: `Ctrl-B w`

**See the recipe for full details:**
```bash
cat ~/.claude/recipes/tmux/new-claude-tab.md
```

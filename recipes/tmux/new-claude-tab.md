# Recipe: Opening New Claude Sessions in Tmux Tabs

**Category:** tmux
**Complexity:** simple
**Last Updated:** 2025-10-25

## Goal

Quickly open a new Claude Code instance in a new tmux window (tab) within your current session.

This allows you to work on multiple Claude sessions simultaneously - for example, running a coding session in one window while having a separate debugging session in another, all within the same tmux session.

## Prerequisites

- Currently inside a tmux session
- Claude CLI installed and accessible
- Shell configuration loaded (`.zshrc` with `ct` function)

## Inputs

- **Optional:**
  - `session_type`: The type of Claude session to start (coding, debugging, analysis, planning, presenting, learning, personal, clauding)
  - This determines the window name with emoji indicator

## Steps

### Quick Method: Use the `ct` Helper

The fastest way to open a new Claude tab:

1. **From within any tmux window**, run the `ct` command:
   ```bash
   ct              # Opens new Claude tab with default name
   ct coding       # Opens new tab named "💻 coding"
   ct debugging    # Opens new tab named "🐛 debug"
   ```

2. **Claude automatically starts** in the new window

3. **Run `/start` if needed** to initialize a specific session type:
   ```
   /start coding
   ```

### Manual Method: Using Tmux Commands

If you prefer manual control or want to understand what's happening:

1. **Create new window**: Press `Ctrl-B c` or run:
   ```bash
   tmux new-window
   ```

2. **Rename window** (optional): Press `Ctrl-B ,` or run:
   ```bash
   tmux rename-window "💻 coding"
   ```

3. **Start Claude**:
   ```bash
   claude
   ```

4. **Initialize session** with `/start` command

### Advanced: Using the Helper Library

For scripting or custom workflows:

```bash
# Load the library
source ~/.claude/lib/core/loader.sh

# Create window with specific name
tmux_new_window "💻 my-project" "claude"

# Create window with no name
tmux_new_window "" "claude"
```

## Command Patterns

### Using `ct` Helper

```bash
ct [session_type]
```

**Parameters:**
- `session_type` (optional): One of: coding, debugging, analysis, planning, presenting, learning, personal, clauding
- If omitted, creates window with default name

**Examples:**
```bash
ct                  # New Claude tab, default name
ct coding           # New tab: "💻 coding"
ct debugging        # New tab: "🐛 debug"
ct my-feature       # New tab: "my-feature"
```

### Using Tmux Helper Library

```bash
tmux_new_window "window_name" "command"
```

**Parameters:**
- `window_name`: Name for the new window (empty string for default)
- `command`: Command to run in new window (empty string for shell)

**Examples:**
```bash
tmux_new_window "💻 coding" "claude"
tmux_new_window "" "claude"
tmux_new_window "logs" "tail -f /var/log/app.log"
```

## Expected Output

### Success Indicators

1. **New window appears** in tmux status bar
2. **Window switches** to the newly created window
3. **Claude starts** and shows the welcome prompt
4. **Window name** (if specified) appears with emoji in status bar

### Navigation

- **Next window**: `Ctrl-B n`
- **Previous window**: `Ctrl-B p`
- **Select window by number**: `Ctrl-B [0-9]`
- **List all windows**: `Ctrl-B w`

## Error Handling

### "Error: ct requires tmux"

**Cause:** Running `ct` outside of a tmux session

**Solution:** First start a tmux session:
```bash
cs                  # Start default "claude" session
cs my-session       # Start named session
```

### "command not found: tmux_new_window"

**Cause:** Tmux helper library not loaded

**Solution:** The `ct` function auto-loads it, but if calling directly:
```bash
source ~/.claude/lib/core/loader.sh
```

### Window doesn't appear

**Cause:** Already at maximum window limit (rare) or tmux configuration issue

**Solution:**
- Close unused windows: `Ctrl-B &` (confirms before killing)
- Check tmux configuration: `tmux show-options -g`

### `/start` command appears but doesn't submit

**Cause:** Timing issue - Enter key sent before Claude is ready to receive it

**Solution:** This was fixed in the `cs` and `ct` functions on 2025-10-25:
- Increased initialization wait from 1.5s to 2s
- Send text and Enter separately with 0.3s delay between them
- If still experiencing issues, reload shell: `source ~/.zshrc`

## Use Cases

### Multiple Projects

Work on different projects simultaneously:
```bash
# Window 1: Main project
ct coding

# Window 2: Dependency analysis
ct analysis

# Window 3: Documentation
ct learning
```

### Parallel Development Tasks

Keep different contexts separate:
```bash
# Window 1: Feature development
ct coding

# Window 2: Bug investigation
ct debugging

# Window 3: Planning next sprint
ct planning
```

### Long-Running Operations

Start a long operation in one window while working in another:
```bash
# Window 1: Start deployment
ct coding
# (in Claude: run deployment script)

# Window 2: Continue working
ct coding
# (work on next task while deployment runs)
```

## Session Type Mapping

The following session types map to emoji-prefixed window names:

| Session Type | Window Name | Use Case |
|-------------|-------------|----------|
| `coding` | 💻 coding | Writing code, implementing features |
| `debugging` | 🐛 debug | Investigating bugs, troubleshooting |
| `analysis` | 🔍 analysis | Code review, architecture analysis |
| `planning` | 📋 planning | Project planning, task breakdown |
| `presenting` | 📊 presenting | Preparing presentations, reports |
| `learning` | 📚 learning | Learning new tools, documentation |
| `personal` | 🏠 personal | Personal projects, experiments |
| `clauding` | 🔧 clauding | Meta work on Claude setup |

Any other string will be used as-is for the window name.

## Related Recipes

**Uses:**
- `~/.claude/lib/local/tmux.sh` - Tmux helper library
- `~/.zshrc` (cs function) - For starting initial tmux sessions

**Alternatives:**
- **iTerm Tabs**: If not using tmux, open new iTerm tab manually and run `claude`
- **Tmux Panes**: Use `Ctrl-B %` or `Ctrl-B "` to split current window instead
- **Multiple tmux sessions**: Use `cs different-session` in a new terminal

## Notes

### Window vs Pane vs Session

- **Session**: Entire tmux instance (created with `cs`)
- **Window**: Tab-like containers within a session (created with `ct`)
- **Pane**: Split views within a window (created with `Ctrl-B %` or `Ctrl-B "`)

### Why Multiple Windows?

Multiple Claude windows are useful for:
- **Context separation**: Different tasks don't interfere with each other
- **Parallel workflows**: Work on features while tests run elsewhere
- **Reference material**: Keep documentation/analysis open in one window
- **History management**: Each window maintains separate conversation history

### Performance Considerations

Each Claude window is a separate instance:
- Uses separate memory/resources
- Maintains independent conversation history
- No shared context between windows
- Generally lightweight, can run 5-10+ instances comfortably

## Examples

### Example 1: Starting a Coding Session

```bash
# From existing tmux session
ct coding

# Claude starts, then in Claude:
/start coding

# You now have a new coding session in a separate window
```

Result: New window "💻 coding" with fresh Claude instance ready for development work.

### Example 2: Parallel Bug Investigation

```bash
# Current window: working on feature
# Need to investigate a bug without losing context

ct debugging

# New window opens, in Claude:
/start debugging production login issue

# Switch back to coding window
# Press Ctrl-B p (previous window)
```

Result: Bug investigation in separate window, feature work preserved in original window.

### Example 3: Multiple Projects

```bash
# Open windows for different projects
ct coding        # Rename to "portal-frontend"
ct coding        # Rename to "api-backend"
ct debugging     # Keep as "🐛 debug" for issues

# Navigate with Ctrl-B [0-9] or Ctrl-B w
```

Result: Three separate Claude sessions for parallel project work.

---

**Version History:**
- 2025-10-25: Initial creation with `ct` helper and manual methods
- 2025-10-25: Fixed timing issue where `/start` command wasn't auto-submitting (both `cs` and `ct` functions)

# Recipe: Start a Coding Session

## Purpose
When the user asks to start a coding session for a project (e.g., "start a coding session for the admin portal"), follow this recipe to create a properly configured tmux workspace.

## Prerequisites
- Must be in a tmux session
- Helper functions loaded (automatically via loader.sh)
- Project must be defined in `~/.claude/PROJECTS.md`

## Steps

### 1. Parse the User's Request

Extract the project name from the user's request. Common patterns:
- "start a coding session for **[project name]**"
- "open a coding workspace for **[project name]**"
- "set up coding environment for **[project name]**"
- "create a coding window for **[project name]**"

### 2. Look Up the Project Directory

Read `~/.claude/PROJECTS.md` to find the mapping:
```bash
cat ~/.claude/PROJECTS.md | grep -i "project name"
```

**Example mapping:**
```
- **admin portal** → `~/Code/portal_dev`
```

Extract the directory path (the part after `→`).

### 3. Verify the Directory Exists

Before creating the workspace, confirm the directory exists:
```bash
ls -ld ~/Code/portal_dev
```

If the directory doesn't exist, inform the user and ask if they want to:
- Create the directory
- Update the mapping
- Cancel the operation

### 4. Load Tmux Helpers

Ensure the tmux helper functions are available:
```bash
source ~/.claude/lib/local/tmux.sh
```

(This is usually automatic via loader.sh, but safe to source again)

### 5. Create the Coding Layout

Use the `tmux_create_coding_layout` helper function:
```bash
tmux_create_coding_layout "~/Code/portal_dev" "💻 admin-portal"
```

**Arguments:**
- `$1` = Project directory path (required)
- `$2` = Window name (optional, defaults to "💻 coding")

**What this does:**
- Creates a new tmux window with name "💻 admin-portal"
- Changes to the project directory in all panes
- Sets up 3-pane layout:
  - **Left (50%):** Claude Code session with `/start coding` auto-run
  - **Top-right (25%):** Emacs editor
  - **Bottom-right (25%):** Shell prompt
- Returns focus to Claude pane

### 6. Provide Feedback

Inform the user that the workspace is ready:
```
✅ Coding session created for admin portal
   Directory: ~/Code/portal_dev
   Window: 💻 admin-portal
   Layout: Claude (left) | Emacs (top-right) / Shell (bottom-right)
```

Optionally mention:
- How to navigate between panes: `Ctrl-B` + arrow keys
- How to switch between windows: `Ctrl-B n` (next), `Ctrl-B p` (previous)

## Layout Diagram

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

## Error Handling

### Project Not Found
If the project isn't in PROJECTS.md:
```
❌ Project "[name]" not found in ~/.claude/PROJECTS.md

Available projects:
  - admin portal
  - api server

Would you like me to add this project to the mapping?
```

### Directory Doesn't Exist
If the mapped directory doesn't exist:
```
❌ Directory doesn't exist: ~/Code/portal_dev

Would you like me to:
1. Create the directory
2. Update the mapping to a different path
3. Cancel
```

### Not in Tmux
If the user isn't in a tmux session:
```
❌ Not currently in a tmux session

To start a tmux session:
  cs my-session

Then I can create the coding workspace.
```

## Examples

### Example 1: Simple Request
**User:** "Start a coding session for the admin portal"

**Claude:**
```bash
# Read PROJECTS.md to find mapping
cat ~/.claude/PROJECTS.md | grep -i "admin portal"
# Result: - **admin portal** → `~/Code/portal_dev`

# Verify directory exists
ls -ld ~/Code/portal_dev

# Create the layout
source ~/.claude/lib/local/tmux.sh
tmux_create_coding_layout "~/Code/portal_dev" "💻 admin-portal"
```

**Response:**
```
✅ Coding session created for admin portal
   Directory: ~/Code/portal_dev
   Window: 💻 admin-portal

Layout ready:
  • Claude (left) - coding session initialized
  • Emacs (top-right) - ready to edit
  • Shell (bottom-right) - at project root

Navigate panes: Ctrl-B + arrow keys
```

### Example 2: Project Not in Mapping
**User:** "Start a coding session for the API"

**Claude finds no mapping in PROJECTS.md**

**Response:**
```
❌ I couldn't find "API" in ~/.claude/PROJECTS.md

Available projects:
  - admin portal → ~/Code/portal_dev

Where is the API project located? I can add it to the mapping.
```

### Example 3: Adding New Project
**User:** "It's in ~/Code/api_server"

**Claude adds to PROJECTS.md:**
```bash
# Add to PROJECTS.md
echo "- **API** → \`~/Code/api_server\`" >> ~/.claude/PROJECTS.md

# Create the workspace
tmux_create_coding_layout "~/Code/api_server" "💻 api"
```

## Customization Options

### Custom Window Name
If the user wants a specific window name:
```bash
tmux_create_coding_layout "~/Code/portal_dev" "💻 portal-feature-x"
```

### Different Session Type
If they want a different session type (debugging, analysis):
Modify the helper call or use individual tmux commands to customize the layout.

## Tips

1. **Use friendly names** - Match the project names users naturally use
2. **Keep PROJECTS.md updated** - Add new projects as they're mentioned
3. **Verify paths** - Always check directories exist before creating layouts
4. **Clear feedback** - Tell the user what was created and where
5. **Help navigate** - Remind users of tmux navigation keys

## Related Files

- Project mappings: `~/.claude/PROJECTS.md`
- Helper functions: `~/.claude/lib/local/tmux.sh`
- Tmux integration status: `~/.claude/TMUX_INTEGRATION_STATUS.md`

# Project Directory Mappings

When starting a coding session, use these mappings to find the correct project directory.

## Format

Each entry maps a friendly project name to its directory path.

## Projects

- **admin portal** → `~/Code/portal_dev`

---

## Usage

When asked to "start a coding session for [project name]", Claude should:
1. Look up the project directory from this mapping
2. Follow the recipe at `~/.claude/recipes/tmux/start-coding-session.md`
3. Create a new tmux window in that directory with the coding layout

## Adding New Projects

Add entries in this format:
```
- **friendly name** → `~/path/to/directory`
```

Examples:
- **api server** → `~/Code/api`
- **frontend app** → `~/Code/frontend`
- **mobile app** → `~/Code/mobile`

---
tags:
  - config
  - session-types
---

# Session Types

Session types define different modes for Claude Code sessions, each with its own context and focus.

## Usage

Start a session with a specific type:

```bash
claude --start coding
claude --start debugging "the authentication flow"
```

## Available Session Types

| Type | Purpose |
|------|---------|
| `coding` | Feature development and implementation |
| `debugging` | Investigating and fixing issues |
| `reviewing` | Code review and PR feedback |
| `planning` | Architecture and design planning |
| `analysis` | Code analysis and understanding |
| `learning` | Exploring new concepts and tools |
| `presenting` | Demo and presentation mode |
| `personal` | Personal projects and experiments |
| `clauding` | Claude Code configuration work |
| `launcher` | Quick task launcher |

## Session Type Details

### coding
Default mode for feature development. Loads project context, recent git history, and TODO items.

### debugging
Investigation mode with focus on error tracking, logs, and reproduction steps.

### reviewing
Code review mode with PR context and review checklist focus.

### planning
Architecture and design mode with emphasis on documentation and diagrams.

### clauding
Meta-mode for working on Claude Code itself - configurations, agents, MCPs.

## Configuration

Session types are defined in `~/.claude/session-types/`:

```
~/.claude/session-types/
├── coding.md
├── debugging.md
├── reviewing.md
├── planning.md
├── analysis.md
├── learning.md
├── presenting.md
├── personal.md
├── clauding.md
└── launcher.md
```

Each file defines:
- Session description and purpose
- Context to load (files, tools, agents)
- Startup instructions
- Available agents for that session type

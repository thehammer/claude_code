# Session Types Guide

## Overview

Claude Code now supports task-oriented sessions. Each session type loads only the context needed for that type of work, dramatically reducing token usage and improving startup speed.

## Available Session Types

### `coding`
**Purpose:** Building features, fixing bugs, implementing functionality, refactoring code

**Context loaded:**
- Git status and recent commits
- Open pull requests
- Recent coding session notes
- Project preferences

**Token budget:** ~15K (50% savings)

**Usage:**
```bash
/start coding
# or just
/start
```

---

### `debugging`
**Purpose:** Investigating errors, troubleshooting production issues, analyzing error patterns

**Context loaded:**
- Sentry integration (pre-loaded)
- Datadog integration (pre-loaded)
- Recent debugging session notes
- Minimal git status (current branch only)

**Token budget:** ~12K (65% savings)

**Usage:**
```bash
/start debugging
```

---

### `analysis`
**Purpose:** Understanding codebase, evaluating architecture, research, code review

**Context loaded:**
- Extended git history
- Project documentation
- Recent analysis session notes

**Token budget:** ~10K (70% savings)

**Usage:**
```bash
/start analysis
```

---

### `planning`
**Purpose:** Task prioritization, roadmap planning, feature breakdown, sprint planning

**Context loaded:**
- All TODO lists
- IDEAS.md backlog
- Recent session notes (scan across types)
- Minimal git status

**Token budget:** ~8K (75% savings)

**Usage:**
```bash
/start planning
```

---

### `presenting`
**Purpose:** Creating PR descriptions, writing documentation, generating summaries, demos

**Context loaded:**
- Recent session notes (relevant type)
- Git context (recent work)
- Existing documentation

**Token budget:** ~12K (60% savings)

**Usage:**
```bash
/start presenting
```

---

### `clauding`
**Purpose:** Improving Claude configuration, refining workflows, maintaining dotfiles

**Context loaded:**
- Global configuration files ONLY
- Integration status check
- NO project context whatsoever

**Token budget:** ~5K (85% savings)

**Usage:**
```bash
/start clauding
```

---

## Configuration Cascade

Each session type uses a cascade resolution pattern:

1. **Global base:** `~/.claude/PREFERENCES.md`
2. **Global type:** `~/.claude/session-types/{type}.md`
3. **Project base:** `.claude/preferences/PREFERENCES.md`
4. **Project type:** `.claude/preferences/{type}.md`

Later levels override earlier levels.

## Session Notes Organization

Notes are organized by type:

```
.claude/session-notes/
├── coding/
│   └── 2025-10-09.md
├── debugging/
│   └── 2025-10-09.md
├── analysis/
│   └── 2025-10-09.md
├── planning/
│   └── 2025-10-09.md
├── presenting/
│   └── 2025-10-09.md
└── clauding/
    └── 2025-10-09.md
```

Templates are available at `~/.claude/templates/session-notes/{type}.md`

## Integration Loading

Most sessions load integrations **on-demand** rather than at startup:

- **Pre-loaded:** Only `debugging` sessions pre-load Sentry and Datadog
- **On-demand:** All other sessions load integrations when first needed
- **Never loaded:** `clauding` sessions skip all integrations

## Choosing the Right Session Type

| Task | Session Type |
|------|--------------|
| "Fix this bug" | `coding` |
| "Why is production throwing errors?" | `debugging` |
| "How does this module work?" | `analysis` |
| "What should we work on next?" | `planning` |
| "Create a PR for this work" | `presenting` |
| "Improve my Claude setup" | `clauding` |

## Token Savings

**Previous baseline:** ~30-35K tokens per session startup

**With session types:**
- `clauding`: 85% savings (5K tokens)
- `planning`: 75% savings (8K tokens)
- `analysis`: 70% savings (10K tokens)
- `debugging`: 65% savings (12K tokens)
- `presenting`: 60% savings (12K tokens)
- `coding`: 50% savings (15K tokens)

## Tips

1. **Be specific:** Choose the most appropriate type for your task
2. **Switch types:** You can always switch mid-session if needed
3. **Clauding first:** When improving config, use `clauding` to avoid project noise
4. **Default is coding:** `/start` without arguments defaults to coding session
5. **Check definitions:** Each `~/.claude/session-types/{type}.md` file documents exactly what's loaded

## Customization

To customize a session type:

1. Edit `~/.claude/session-types/{type}.md` to change what's loaded
2. Create `.claude/preferences/{type}.md` for project-specific overrides
3. Update token budget targets if needed
4. Test with `/start {type}` to verify changes

## Version Control

Session type definitions are version controlled in `~/.claude/.git`

Session notes are gitignored to protect sensitive information.

---

**Last Updated:** 2025-10-09

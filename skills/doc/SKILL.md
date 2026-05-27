---
name: doc
description: File and manage project documentation — bug reports, feature requests, ideas, notes, todos, and wip folders — in a project's .claude/ directory. Use when asked to file a bug, log a feature request, capture an idea, add a note, create a todo, or start a WIP investigation folder. Also handles listing, transitioning status, initializing structure, and migrating legacy layouts.
---

# Project Doc Management Skill

File and manage structured project docs via `~/.claude/bin/doc-mgr`.

## When to Use

Trigger when user asks to:
- File / log / report a bug
- Add a feature request or feature idea
- Capture an idea or "thing to revisit"
- Create a project note or decision record
- Add a todo item
- Start a WIP investigation, analysis, or working folder
- List open bugs, features, todos, wip folders, etc.
- Mark a bug as resolved, feature as shipped, todo as done
- Initialize the doc structure in a project
- Migrate a legacy `bug-reports/` or `feature-requests/` layout

## Workflow for Filing a New Doc

1. **Get the target path:**
   ```bash
   ~/.claude/bin/doc-mgr path <type> "<title>"
   ```

2. **Write the file** using the appropriate template below — fill in all sections with real content drawn from context. Don't leave placeholder text.

3. **Confirm** to the user: type filed, filename, path.

If the path command fails because `.claude/` doesn't exist, run `init` first:
```bash
~/.claude/bin/doc-mgr init
```

## Templates

Use today's date (`date +%Y-%m-%d`) and the project name from the directory or CLAUDE.md.

### Bug
```markdown
---
type: bug
status: open
created: {YYYY-MM-DD}
project: {project}
---

# {Title}

## Summary
One-sentence description of the bug.

## Steps to Reproduce
1.
2.

## Expected Behavior


## Actual Behavior


## Context
Relevant code locations, error messages, environment details.

## Notes
Hypotheses, workarounds, related issues.
```

### Feature Request
```markdown
---
type: feature
status: backlog
created: {YYYY-MM-DD}
project: {project}
---

# {Title}

## Summary
One-sentence description of the feature.

## Motivation
Why is this needed? What problem does it solve?

## Proposed Approach
High-level description of how this could be implemented.

## Acceptance Criteria
- [ ]
- [ ]

## Notes
Open questions, dependencies, alternatives considered.
```

### Idea
```markdown
---
type: idea
created: {YYYY-MM-DD}
project: {project}
---

# {Title}

## The Idea
What is this?

## Why It Might Be Worth Exploring
Potential value or opportunity.

## Open Questions
What would need to be answered before committing to this?
```

### Note
```markdown
---
type: note
created: {YYYY-MM-DD}
project: {project}
---

# {Title}

{Freeform content — decisions, observations, reference material, etc.}
```

### Todo
```markdown
---
type: todo
status: open
created: {YYYY-MM-DD}
project: {project}
---

# {Title}

## What Needs to Be Done
Clear description of the work.

## Context
Why this needs to happen.

## Acceptance Criteria
- [ ]
```

### WIP
`path wip "<title>"` creates the folder and returns `wip/<slug>/index.md`.
Write `index.md` using this template, then add supporting files freely:

```markdown
---
type: wip
created: {YYYY-MM-DD}
project: {project}
---

# {Title}

## Goal
One sentence: what are we trying to figure out or build?

## Quick Navigation
| Doc | Contents |
|---|---|
| [file.md](file.md) | ... |

## Current Status
What's the state of play right now?

## Key Findings
Discoveries so far.

## Next Steps
What needs to happen next?
```

## Other Operations

### List docs
```bash
~/.claude/bin/doc-mgr list                  # all active items
~/.claude/bin/doc-mgr list bug              # all bugs (open + resolved)
~/.claude/bin/doc-mgr list bug open         # open bugs only
~/.claude/bin/doc-mgr list feature backlog  # features in backlog
~/.claude/bin/doc-mgr list wip              # all wip folders
```

### Transition a doc
```bash
~/.claude/bin/doc-mgr move <full-path> resolved   # close a bug
~/.claude/bin/doc-mgr move <full-path> shipped    # ship a feature
~/.claude/bin/doc-mgr move <full-path> done       # complete a todo
# WIP folders: rename or delete the folder manually when done
```
Use `list` first to get the full path if needed.

### Initialize structure in a project
```bash
~/.claude/bin/doc-mgr init                  # uses CWD
~/.claude/bin/doc-mgr init /path/to/project
```

### Migrate legacy layout
```bash
~/.claude/bin/doc-mgr migrate               # uses CWD
```
Moves files from `bug-reports/` → `bugs/open/`, `feature-requests/` → `features/backlog/`, `inbox/` → `ideas/`. Archive subfolders are left untouched.

## Notes

- `doc-mgr path` returns the path but does NOT create the file — use Write/Edit to create it.
- All commands walk up from CWD to find the nearest `.claude/` directory.
- File naming: `YYYY-MM-DD-slugified-title.md`
- Draft content should use real project context — don't leave templates half-filled.

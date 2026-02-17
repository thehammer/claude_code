---
tags:
  - config
  - agents
---

# Agents

Custom agents for specialized tasks. These are spawned via the Task tool to handle specific workflows.

## Available Agents

### Investigation Agents

| Agent | Purpose |
|-------|---------|
| `pipeline-debugger` | Debug Bitbucket pipeline failures |
| `ecs-investigator` | Investigate ECS/container issues |
| `datadog-agent` | Search Datadog logs and metrics |
| `sentry-agent` | Investigate Sentry errors |
| `slack-url-to-logs` | Find Datadog logs for Slack conversations |

### Development Agents

| Agent | Purpose |
|-------|---------|
| `pr-reviewer` | Review pull request diffs |
| `test-writer` | Generate tests for code |
| `codebase-explainer` | Explain how code works |
| `laravel-expert` | Laravel-specific debugging and patterns |
| `dependency-auditor` | Check for outdated/vulnerable dependencies |

### Research Agents

| Agent | Purpose |
|-------|---------|
| `git-historian` | Search git history for changes |
| `session-researcher` | Find context from past sessions |
| `confluence-agent` | Search Confluence documentation |
| `confluence-reader` | Read specific Confluence pages |

### Utility Agents

| Agent | Purpose |
|-------|---------|
| `calendar-fetcher` | Get calendar events |
| `jira-agent` | Work with Jira tickets |
| `slack-retriever` | Retrieve Slack messages |

## Usage

Agents are automatically used by Claude when appropriate, or can be explicitly requested:

```
"Use the pipeline-debugger agent to investigate the failed build"
"Spawn the pr-reviewer agent to review PR #123"
```

## Configuration

Agents are defined in `~/.claude/agents/`:

```
~/.claude/agents/
├── pipeline-debugger.md
├── pr-reviewer.md
├── test-writer.md
└── ...
```

Each agent definition includes:
- Description and purpose
- Available tools
- Behavior guidelines
- Example usage

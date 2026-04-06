#!/usr/bin/env bash
# Generates shell aliases for Claude Code agents.
# Source the output in .zshrc: eval "$(~/.claude/agents/sync-aliases.sh)"
#
# Agents with a `workdir` frontmatter field are skipped — those need
# machine-specific aliases defined manually.

AGENTS_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_CMD="${CLAUDE_ALIAS:-cdsp --agent}"

for file in "$AGENTS_DIR"/*.md; do
  [ -f "$file" ] || continue

  name=""
  has_workdir=false

  while IFS= read -r line; do
    # Stop at closing frontmatter delimiter (skip the opening one)
    [[ "$name" != "" && "$line" == "---" ]] && break
    [[ "$line" =~ ^name:\ *(.+)$ ]] && name="${BASH_REMATCH[1]}"
    [[ "$line" =~ ^workdir: ]] && has_workdir=true
  done < "$file"

  [ -z "$name" ] && continue
  $has_workdir && continue

  echo "alias ${name}=\"${CLAUDE_CMD} ${name}\""
done

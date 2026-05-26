#!/usr/bin/env bash
# inject-time.sh — UserPromptSubmit hook
# Injects the current local time into the system prompt so Claude always
# knows what time it is when the user sends a message.
printf '{"type":"system_prompt_injection","text":"Current time: %s"}\n' "$(date '+%A %Y-%m-%d %H:%M:%S %Z')"

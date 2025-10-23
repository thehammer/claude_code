#!/bin/bash
# Claude Code - Credential Loading
#
# Loads credentials from .env file and exports them for use by helper functions.
#
# Usage:
#   source ~/.claude/lib/core/credentials.sh

# ==============================================================================
# Load Credentials
# ==============================================================================

# Check if credentials file exists
if [ ! -f ~/.claude/credentials/.env ]; then
    echo "Warning: Credentials file not found at ~/.claude/credentials/.env" >&2
    echo "See ~/.claude/credentials/README.md for setup instructions" >&2
    return 1
fi

# Load credentials from .env file
# Note: This handles variable expansion like ${ATLASSIAN_API_TOKEN}
set -a  # Automatically export all variables
source ~/.claude/credentials/.env
set +a

# Trim whitespace from tokens to prevent authentication issues
SENTRY_API_TOKEN=$(echo -n "${SENTRY_API_TOKEN}" | tr -d '[:space:]')
DATADOG_API_KEY=$(echo -n "${DATADOG_API_KEY}" | tr -d '[:space:]')
DATADOG_APP_KEY=$(echo -n "${DATADOG_APP_KEY}" | tr -d '[:space:]')
ATLASSIAN_API_TOKEN=$(echo -n "${ATLASSIAN_API_TOKEN}" | tr -d '[:space:]')
BITBUCKET_ACCESS_TOKEN=$(echo -n "${BITBUCKET_ACCESS_TOKEN}" | tr -d '[:space:]')
SLACK_BOT_TOKEN=$(echo -n "${SLACK_BOT_TOKEN}" | tr -d '[:space:]')
GITHUB_TOKEN=$(echo -n "${GITHUB_TOKEN}" | tr -d '[:space:]')

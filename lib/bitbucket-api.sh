#!/bin/bash
#
# Bitbucket API Helper - Maintains session for credential access
#
# Usage:
#   ~/.claude/lib/bitbucket-api.sh <endpoint> [jq_filter]
#
# Examples:
#   ~/.claude/lib/bitbucket-api.sh "pipelines/13472"
#   ~/.claude/lib/bitbucket-api.sh "pipelines/?sort=-created_on&pagelen=5"

# Load credentials
source ~/.claude/lib/integrations.sh

if [ -z "$1" ]; then
    echo "Usage: $0 <endpoint> [jq_filter]"
    echo "Example: $0 'pipelines/13472'"
    exit 1
fi

ENDPOINT="$1"
JQ_FILTER="${2:-.}"

# Make API request
curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" \
    "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/${ENDPOINT}" \
    | jq "${JQ_FILTER}"

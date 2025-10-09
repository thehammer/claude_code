#!/bin/bash
#
# Fetch latest pipeline log for a PR
#
# Usage:
#   ~/.claude/lib/get-pr-pipeline-log.sh <pr_number>
#
# Example:
#   ~/.claude/lib/get-pr-pipeline-log.sh 3773

source ~/.claude/lib/integrations.sh

if [ -z "$1" ]; then
    echo "Usage: $0 <pr_number>"
    echo "Example: $0 3773"
    exit 1
fi

PR_NUM="$1"

echo "Fetching latest pipeline for PR #${PR_NUM}..." >&2

# Get latest pipeline for this PR
PIPELINE_DATA=$(curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" \
    "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/pipelines/?target.pullrequest.id=${PR_NUM}&sort=-created_on&pagelen=1")

PIPELINE_NUM=$(echo "$PIPELINE_DATA" | jq -r '.values[0].build_number')
PIPELINE_STATE=$(echo "$PIPELINE_DATA" | jq -r '.values[0].state.name')
COMMIT_HASH=$(echo "$PIPELINE_DATA" | jq -r '.values[0].target.commit.hash[0:9]')

if [ -z "$PIPELINE_NUM" ] || [ "$PIPELINE_NUM" = "null" ]; then
    echo "Error: No pipeline found for PR #${PR_NUM}" >&2
    exit 1
fi

echo "Pipeline #${PIPELINE_NUM} (${COMMIT_HASH}) - ${PIPELINE_STATE}" >&2

# Get steps
STEPS_DATA=$(curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" \
    "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/pipelines/${PIPELINE_NUM}/steps/")

# Find the test suite step
TEST_STEP_UUID=$(echo "$STEPS_DATA" | jq -r '.values[] | select(.name | contains("Test Suite")) | .uuid' | head -1)
TEST_STEP_STATE=$(echo "$STEPS_DATA" | jq -r '.values[] | select(.name | contains("Test Suite")) | .state.name' | head -1)

if [ -z "$TEST_STEP_UUID" ] || [ "$TEST_STEP_UUID" = "null" ]; then
    echo "Error: No Test Suite step found" >&2
    exit 1
fi

echo "Test Suite Step: ${TEST_STEP_UUID} - ${TEST_STEP_STATE}" >&2

# URL encode the UUID properly
STEP_UUID_ENCODED=$(printf '%s' "$TEST_STEP_UUID" | sed 's/{/%7B/g; s/}/%7D/g')

echo "Fetching test log..." >&2
curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" \
    "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/pipelines/${PIPELINE_NUM}/steps/${STEP_UUID_ENCODED}/log"

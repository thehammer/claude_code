#!/bin/bash
#
# Fetch Bitbucket Pipeline Log
#
# Usage:
#   ~/.claude/lib/get-pipeline-log.sh <pipeline_number> [step_uuid]
#
# Examples:
#   ~/.claude/lib/get-pipeline-log.sh 13474
#   ~/.claude/lib/get-pipeline-log.sh 13474 "{uuid}"

# Load credentials
source ~/.claude/lib/integrations.sh

if [ -z "$1" ]; then
    echo "Usage: $0 <pipeline_number> [step_uuid]"
    echo "Example: $0 13474"
    exit 1
fi

PIPELINE_NUM="$1"
STEP_UUID="$2"

# First, get pipeline details to find the UUID and steps
echo "Fetching pipeline ${PIPELINE_NUM}..." >&2
PIPELINE_DATA=$(curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" \
    "https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/pipelines/${PIPELINE_NUM}")

PIPELINE_UUID=$(echo "$PIPELINE_DATA" | jq -r '.uuid')

if [ -z "$PIPELINE_UUID" ] || [ "$PIPELINE_UUID" = "null" ]; then
    echo "Error: Could not find pipeline ${PIPELINE_NUM}" >&2
    exit 1
fi

echo "Pipeline UUID: ${PIPELINE_UUID}" >&2

# Get steps
STEPS_URL="https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/pipelines/${PIPELINE_NUM}/steps/"
STEPS_DATA=$(curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" "${STEPS_URL}")

echo "Available steps:" >&2
echo "$STEPS_DATA" | jq -r '.values[] | "\(.name): \(.uuid) - \(.state.name) (\(.state.result.name // "N/A"))"' >&2

# If step UUID provided, get that step's log
if [ -n "$STEP_UUID" ]; then
    # URL encode the UUID (replace {} with %7B %7D)
    STEP_UUID_ENCODED=$(echo "$STEP_UUID" | sed 's/{/%7B/g' | sed 's/}/%7D/g')
    LOG_URL="https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/pipelines/${PIPELINE_NUM}/steps/${STEP_UUID_ENCODED}/log"
    echo "Fetching log from: ${LOG_URL}" >&2
    curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" "${LOG_URL}"
else
    # Automatically find the PHP Test Suite step
    TEST_STEP=$(echo "$STEPS_DATA" | jq -r '.values[] | select(.name | contains("Test Suite")) | .uuid' | head -1)

    if [ -z "$TEST_STEP" ] || [ "$TEST_STEP" = "null" ]; then
        echo "No Test Suite step found, using first step" >&2
        TEST_STEP=$(echo "$STEPS_DATA" | jq -r '.values[0].uuid')
    else
        echo "Found Test Suite step: ${TEST_STEP}" >&2
    fi

    if [ -n "$TEST_STEP" ] && [ "$TEST_STEP" != "null" ]; then
        # URL encode the UUID
        STEP_UUID_ENCODED=$(echo "$TEST_STEP" | sed 's/{/%7B/g' | sed 's/}/%7D/g')
        LOG_URL="https://api.bitbucket.org/2.0/repositories/Bitbucketpassword1/portal_dev/pipelines/${PIPELINE_NUM}/steps/${STEP_UUID_ENCODED}/log"
        echo "Fetching log..." >&2
        curl -s -u "${BITBUCKET_USERNAME}:${BITBUCKET_ACCESS_TOKEN}" "${LOG_URL}"
    fi
fi

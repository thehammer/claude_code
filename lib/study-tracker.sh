#!/bin/bash
#
# Study Tracking System
#
# Functions to log study executions with timestamps, parameters, and results
#

STUDY_LOG_DIR="${STUDY_LOG_DIR:-$HOME/.claude/study-logs}"
STUDY_ARTIFACTS_DIR="${STUDY_ARTIFACTS_DIR:-$HOME/.claude/study-logs/artifacts}"

# Ensure directories exist
mkdir -p "$STUDY_LOG_DIR"
mkdir -p "$STUDY_ARTIFACTS_DIR"

# Initialize a study run
# Usage: study_init "study-name" "description" "param1" "param2" ...
function study_init() {
    local study_name=$1
    local description=$2
    shift 2
    local params="$@"

    # Generate run ID with timestamp
    local run_id=$(date +%Y%m%d-%H%M%S)
    local study_run_id="${study_name}-${run_id}"

    # Create study-specific directory
    local study_dir="${STUDY_LOG_DIR}/${study_name}"
    mkdir -p "$study_dir"

    # Create artifacts directory for this run
    local artifacts_dir="${STUDY_ARTIFACTS_DIR}/${study_run_id}"
    mkdir -p "$artifacts_dir"

    # Store run metadata
    cat > "${study_dir}/${run_id}.json" <<EOF
{
  "study": "${study_name}",
  "run_id": "${run_id}",
  "full_id": "${study_run_id}",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "timestamp_local": "$(date '+%Y-%m-%d %H:%M:%S %Z')",
  "description": "${description}",
  "parameters": "${params}",
  "artifacts_dir": "${artifacts_dir}",
  "status": "running",
  "start_time": $(date +%s)
}
EOF

    # Export for use in study
    export STUDY_RUN_ID="$study_run_id"
    export STUDY_RUN_DIR="$study_dir"
    export STUDY_ARTIFACTS_DIR="$artifacts_dir"
    export STUDY_LOG_FILE="${study_dir}/${run_id}.json"

    echo "$study_run_id"
}

# Save a study artifact (raw data, intermediate results, etc.)
# Usage: study_save_artifact "artifact-name" "data"
# Or: cat data.json | study_save_artifact "artifact-name"
function study_save_artifact() {
    local artifact_name=$1
    local data=$2

    if [ -z "$STUDY_ARTIFACTS_DIR" ]; then
        echo "Error: No active study run. Call study_init first." >&2
        return 1
    fi

    local artifact_file="${STUDY_ARTIFACTS_DIR}/${artifact_name}"

    if [ -n "$data" ]; then
        echo "$data" > "$artifact_file"
    else
        # Read from stdin
        cat > "$artifact_file"
    fi

    echo "Saved artifact: $(basename $artifact_file)" >&2
}

# Complete a study run with results
# Usage: study_complete "summary" "finding" "status"
function study_complete() {
    local summary=$1
    local finding=$2
    local status=${3:-"completed"}

    if [ -z "$STUDY_LOG_FILE" ]; then
        echo "Error: No active study run. Call study_init first." >&2
        return 1
    fi

    local end_time=$(date +%s)
    local start_time=$(jq -r '.start_time' "$STUDY_LOG_FILE")
    local duration=$((end_time - start_time))

    # Update the log file with results
    local tmp_file=$(mktemp)
    jq --arg summary "$summary" \
       --arg finding "$finding" \
       --arg status "$status" \
       --arg end_time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       --arg duration "$duration" \
       '. + {
           status: $status,
           end_time: $end_time,
           duration_seconds: ($duration | tonumber),
           summary: $summary,
           finding: $finding
       }' "$STUDY_LOG_FILE" > "$tmp_file"

    mv "$tmp_file" "$STUDY_LOG_FILE"

    # Create symlink to latest run
    local study_name=$(jq -r '.study' "$STUDY_LOG_FILE")
    ln -sf "$(basename $STUDY_LOG_FILE)" "${STUDY_RUN_DIR}/latest.json"

    echo "Study completed: $STUDY_RUN_ID (${duration}s)" >&2
}

# List recent study runs
# Usage: study_list [study-name] [limit]
function study_list() {
    local study_name=$1
    local limit=${2:-10}

    if [ -n "$study_name" ]; then
        local pattern="${STUDY_LOG_DIR}/${study_name}/*.json"
    else
        local pattern="${STUDY_LOG_DIR}/*/*.json"
    fi

    find $STUDY_LOG_DIR -name "*.json" -not -name "latest.json" 2>/dev/null | \
        sort -r | \
        head -n "$limit" | \
        while read -r log_file; do
            jq -r '[.full_id, .timestamp_local, .status, .summary // "N/A"] | @tsv' "$log_file"
        done | column -t -s $'\t'
}

# Get details of a study run
# Usage: study_get "run-id"
function study_get() {
    local run_id=$1

    if [ -z "$run_id" ]; then
        echo "Usage: study_get <run-id>"
        return 1
    fi

    # Find the log file
    local log_file=$(find "$STUDY_LOG_DIR" -name "*${run_id}*.json" -not -name "latest.json" | head -1)

    if [ -z "$log_file" ]; then
        echo "Study run not found: $run_id"
        return 1
    fi

    jq '.' "$log_file"
}

# Get latest study run for a specific study
# Usage: study_latest "study-name"
function study_latest() {
    local study_name=$1

    if [ -z "$study_name" ]; then
        echo "Usage: study_latest <study-name>"
        return 1
    fi

    local latest_file="${STUDY_LOG_DIR}/${study_name}/latest.json"

    if [ ! -f "$latest_file" ]; then
        echo "No runs found for study: $study_name"
        return 1
    fi

    jq '.' "$latest_file"
}

# Compare two study runs
# Usage: study_compare "run-id-1" "run-id-2"
function study_compare() {
    local run1=$1
    local run2=$2

    if [ -z "$run1" ] || [ -z "$run2" ]; then
        echo "Usage: study_compare <run-id-1> <run-id-2>"
        return 1
    fi

    local log1=$(find "$STUDY_LOG_DIR" -name "*${run1}*.json" -not -name "latest.json" | head -1)
    local log2=$(find "$STUDY_LOG_DIR" -name "*${run2}*.json" -not -name "latest.json" | head -1)

    if [ -z "$log1" ] || [ -z "$log2" ]; then
        echo "One or both study runs not found"
        return 1
    fi

    echo "=== Study Comparison ==="
    echo ""
    echo "Run 1: $(jq -r '.full_id' $log1)"
    echo "Time:  $(jq -r '.timestamp_local' $log1)"
    echo "Summary: $(jq -r '.summary // "N/A"' $log1)"
    echo ""
    echo "Run 2: $(jq -r '.full_id' $log2)"
    echo "Time:  $(jq -r '.timestamp_local' $log2)"
    echo "Summary: $(jq -r '.summary // "N/A"' $log2)"
    echo ""
}

# Clean up old study runs (keep last N runs per study)
# Usage: study_cleanup [keep_count]
function study_cleanup() {
    local keep_count=${1:-20}

    echo "Cleaning up study logs (keeping last ${keep_count} per study)..."

    for study_dir in "$STUDY_LOG_DIR"/*; do
        if [ -d "$study_dir" ]; then
            local study_name=$(basename "$study_dir")
            local total=$(find "$study_dir" -name "*.json" -not -name "latest.json" | wc -l | tr -d ' ')
            local to_remove=$((total - keep_count))

            if [ "$to_remove" -gt 0 ]; then
                echo "  $study_name: removing $to_remove old runs..."
                find "$study_dir" -name "*.json" -not -name "latest.json" | \
                    sort | \
                    head -n "$to_remove" | \
                    xargs rm -f

                # TODO: Also clean up corresponding artifact directories
            fi
        fi
    done

    echo "Cleanup complete"
}

# Export functions
export -f study_init
export -f study_save_artifact
export -f study_complete
export -f study_list
export -f study_get
export -f study_latest
export -f study_compare
export -f study_cleanup

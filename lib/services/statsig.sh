#!/bin/bash
# Statsig Console API helpers (curl-based)
#
# Requires credentials loaded from ~/.claude/credentials/.env:
#   STATSIG_CONSOLE_API_KEY
#
# Usage:
#   source ~/.claude/lib/core/credentials.sh
#   source ~/.claude/lib/services/statsig.sh

# ==============================================================================
# Base request function
# ==============================================================================

STATSIG_API_BASE="https://statsigapi.net/console/v1"

# Make authenticated Statsig Console API request
# Usage: statsig_request GET "/gates"
#        statsig_request POST "/gates" '{"name":"my_gate","idType":"userID"}'
function statsig_request() {
    local method="${1:?Usage: statsig_request METHOD PATH [BODY]}"
    local path="$2"
    local body="$3"

    if [ -z "$STATSIG_CONSOLE_API_KEY" ]; then
        echo '{"error":"Missing STATSIG_CONSOLE_API_KEY. Source ~/.claude/lib/core/credentials.sh first."}' >&2
        return 1
    fi

    local url="${STATSIG_API_BASE}${path}"
    local args=(
        -s
        -X "$method"
        -H "statsig-api-key: ${STATSIG_CONSOLE_API_KEY}"
        -H "Content-Type: application/json"
    )

    if [ -n "$body" ]; then
        args+=(-d "$body")
    fi

    /usr/bin/curl "${args[@]}" "$url"
}

# ==============================================================================
# Gates (Feature Gates)
# ==============================================================================

# List all gates
# Usage: statsig_list_gates
function statsig_list_gates() {
    statsig_request GET "/gates"
}

# Get a specific gate
# Usage: statsig_get_gate "my_gate_id"
function statsig_get_gate() {
    local gate_id="${1:?Usage: statsig_get_gate GATE_ID}"
    statsig_request GET "/gates/${gate_id}"
}

# Create a new gate
# Usage: statsig_create_gate '{"name":"My Gate","idType":"userID"}'
function statsig_create_gate() {
    local body="${1:?Usage: statsig_create_gate JSON_BODY}"
    statsig_request POST "/gates" "$body"
}

# Update a gate (partial update)
# Usage: statsig_update_gate "my_gate_id" '{"description":"updated"}'
function statsig_update_gate() {
    local gate_id="${1:?Usage: statsig_update_gate GATE_ID JSON_BODY}"
    local body="${2:?}"
    statsig_request PATCH "/gates/${gate_id}" "$body"
}

# Delete a gate
# Usage: statsig_delete_gate "my_gate_id"
function statsig_delete_gate() {
    local gate_id="${1:?Usage: statsig_delete_gate GATE_ID}"
    statsig_request DELETE "/gates/${gate_id}"
}

# Add a rule to a gate
# Usage: statsig_add_gate_rule "my_gate_id" '{"name":"Rule 1","passPercentage":100,"conditions":[...]}'
function statsig_add_gate_rule() {
    local gate_id="${1:?Usage: statsig_add_gate_rule GATE_ID JSON_BODY}"
    local body="${2:?}"
    statsig_request POST "/gates/${gate_id}/rule" "$body"
}

# Update gate rules
# Usage: statsig_update_gate_rules "my_gate_id" '{"rules":[...]}'
function statsig_update_gate_rules() {
    local gate_id="${1:?Usage: statsig_update_gate_rules GATE_ID JSON_BODY}"
    local body="${2:?}"
    statsig_request PATCH "/gates/${gate_id}/rules" "$body"
}

# ==============================================================================
# Dynamic Configs
# ==============================================================================

# List all dynamic configs
# Usage: statsig_list_configs
function statsig_list_configs() {
    statsig_request GET "/dynamic_configs"
}

# Get a specific dynamic config
# Usage: statsig_get_config "my_config_id"
function statsig_get_config() {
    local config_id="${1:?Usage: statsig_get_config CONFIG_ID}"
    statsig_request GET "/dynamic_configs/${config_id}"
}

# Create a dynamic config
# Usage: statsig_create_config '{"name":"My Config","defaultValue":{"key":"value"}}'
function statsig_create_config() {
    local body="${1:?Usage: statsig_create_config JSON_BODY}"
    statsig_request POST "/dynamic_configs" "$body"
}

# Update a dynamic config (partial)
# Usage: statsig_update_config "my_config_id" '{"description":"updated"}'
function statsig_update_config() {
    local config_id="${1:?Usage: statsig_update_config CONFIG_ID JSON_BODY}"
    local body="${2:?}"
    statsig_request PATCH "/dynamic_configs/${config_id}" "$body"
}

# Delete a dynamic config
# Usage: statsig_delete_config "my_config_id"
function statsig_delete_config() {
    local config_id="${1:?Usage: statsig_delete_config CONFIG_ID}"
    statsig_request DELETE "/dynamic_configs/${config_id}"
}

# ==============================================================================
# Formatting helpers
# ==============================================================================

# List gates in a readable format
# Usage: statsig_list_gates | statsig_format_gates
function statsig_format_gates() {
    python3 -c "
import json, sys
data = json.load(sys.stdin).get('data', [])
for g in data:
    status = 'ON' if g['isEnabled'] else 'OFF'
    rules = len(g.get('rules', []))
    print(f'  [{status}] {g[\"id\"]:50s} {rules} rules  ({g.get(\"status\", \"\")})')
print(f'\nTotal: {len(data)} gates')
"
}

# List dynamic configs in a readable format
# Usage: statsig_list_configs | statsig_format_configs
function statsig_format_configs() {
    python3 -c "
import json, sys
data = json.load(sys.stdin).get('data', [])
for c in data:
    status = 'ON' if c['isEnabled'] else 'OFF'
    print(f'  [{status}] {c[\"id\"]:50s} ({c.get(\"status\", \"\")})')
print(f'\nTotal: {len(data)} configs')
"
}

# Show gate details in a readable format
# Usage: statsig_get_gate "my_gate" | statsig_format_gate_detail
function statsig_format_gate_detail() {
    python3 -c "
import json, sys
resp = json.load(sys.stdin)
g = resp.get('data', resp)
print(f'Gate: {g[\"id\"]}')
print(f'Name: {g[\"name\"]}')
print(f'Enabled: {g[\"isEnabled\"]}')
print(f'Status: {g.get(\"status\", \"\")}')
print(f'Description: {g.get(\"description\", \"\")}')
print(f'ID Type: {g.get(\"idType\", \"\")}')
print()
for i, rule in enumerate(g.get('rules', [])):
    envs = ', '.join(rule.get('environments', ['all']))
    print(f'  Rule {i+1}: {rule[\"name\"]} (pass {rule[\"passPercentage\"]}%, envs: {envs})')
    for cond in rule.get('conditions', []):
        field = cond.get('field', '')
        op = cond.get('operator', '')
        val = cond.get('targetValue', '')
        print(f'    - {cond[\"type\"]} {field} {op} {val}')
"
}

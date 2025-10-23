#!/usr/bin/env bash
# Script Generator for Claude Code Helper Scripts - Version 2
#
# Generates wrapper scripts from function definitions in ~/.claude/lib/

set -eo pipefail

LIB_DIR="$HOME/.claude/lib"
BIN_DIR="$HOME/.claude/bin"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Claude Code Wrapper Script Generator ===${NC}\n"

# Create directory structure
mkdir -p "$BIN_DIR"/{services/{bitbucket,github,slack,sentry,datadog,aws,onepassword,confluence},utilities,carefeed,study,vscode}

# Convert function name to script name (remove prefix, underscore to hyphen)
function_to_script() {
    local func_name="$1"
    local prefix="$2"
    echo "$func_name" | sed "s/^${prefix}_//" | tr '_' '-'
}

# Generate a wrapper script
generate_wrapper() {
    local service="$1"
    local func_name="$2"
    local source_file="$3"
    local script_dir="$4"
    local script_name="$5"

    local script_path="$BIN_DIR/$script_dir/$script_name"

    # Write script header
    cat > "$script_path" <<'HEADER'
#!/usr/bin/env bash
# Claude Code Helper Script
set -eo pipefail

LIB_DIR="$HOME/.claude/lib"

HEADER

    # Add source lines based on service type
    case "$service" in
        bitbucket|github|slack|sentry|datadog)
            cat >> "$script_path" <<SOURCES
source "\$LIB_DIR/core/credentials.sh"
source "\$LIB_DIR/services/mcp-candidates/${service}.sh"
SOURCES
            ;;
        aws|onepassword|confluence)
            cat >> "$script_path" <<SOURCES
source "\$LIB_DIR/core/credentials.sh"
source "\$LIB_DIR/services/_bash/${service}.sh"
SOURCES
            ;;
        utilities)
            cat >> "$script_path" <<'SOURCES'
source "$LIB_DIR/core/credentials.sh"
source "$LIB_DIR/services/mcp-candidates/bitbucket.sh"
source "$LIB_DIR/services/mcp-candidates/github.sh"
source "$LIB_DIR/core/utilities.sh"
SOURCES
            ;;
        carefeed)
            cat >> "$script_path" <<'SOURCES'
source "$LIB_DIR/conventions/carefeed.sh"
SOURCES
            ;;
        study)
            cat >> "$script_path" <<'SOURCES'
source "$LIB_DIR/local/study-tracker.sh"
SOURCES
            ;;
        vscode)
            cat >> "$script_path" <<'SOURCES'
source "$LIB_DIR/local/vscode.sh"
SOURCES
            ;;
    esac

    # Add function call
    echo "" >> "$script_path"
    echo "${func_name} \"\$@\"" >> "$script_path"

    chmod +x "$script_path"
    echo -e "${GREEN}✓${NC} $script_dir/$script_name"
}

# Generate scripts for each service
echo -e "${BLUE}Bitbucket...${NC}"
for func in bitbucket_is_configured bitbucket_list_prs bitbucket_create_pr bitbucket_update_pr bitbucket_get_pr bitbucket_get_pr_comments bitbucket_get_pipeline bitbucket_get_step_url bitbucket_get_pipeline_logs; do
    script_name=$(function_to_script "$func" "bitbucket")
    generate_wrapper "bitbucket" "$func" "$LIB_DIR/services/mcp-candidates/bitbucket.sh" "services/bitbucket" "$script_name"
done

echo -e "\n${BLUE}GitHub...${NC}"
for func in github_is_configured github_whoami github_list_prs github_get_pr github_create_pr github_update_pr github_get_pr_comments github_get_pr_reviews github_list_repos; do
    script_name=$(function_to_script "$func" "github")
    generate_wrapper "github" "$func" "$LIB_DIR/services/mcp-candidates/github.sh" "services/github" "$script_name"
done

echo -e "\n${BLUE}Slack...${NC}"
for func in slack_is_configured slack_whoami slack_list_conversations slack_get_history slack_search_messages slack_get_user_info slack_find_channel slack_get_channel_messages slack_send_dm slack_post_message slack_notify_completion slack_notify_progress; do
    script_name=$(function_to_script "$func" "slack")
    generate_wrapper "slack" "$func" "$LIB_DIR/services/mcp-candidates/slack.sh" "services/slack" "$script_name"
done

echo -e "\n${BLUE}Sentry...${NC}"
for func in sentry_is_configured sentry_whoami sentry_list_orgs sentry_list_projects sentry_list_issues sentry_get_issue sentry_get_issue_events sentry_search_issues sentry_list_production_issues; do
    script_name=$(function_to_script "$func" "sentry")
    generate_wrapper "sentry" "$func" "$LIB_DIR/services/mcp-candidates/sentry.sh" "services/sentry" "$script_name"
done

echo -e "\n${BLUE}Datadog...${NC}"
for func in datadog_is_configured datadog_validate datadog_search_logs datadog_search_logs_paginated datadog_collect_logs_bulk datadog_get_metrics datadog_list_monitors datadog_get_monitor datadog_search_traces datadog_list_dashboards datadog_get_dashboard datadog_create_dashboard datadog_update_dashboard datadog_delete_dashboard datadog_search_dashboards datadog_export_dashboard; do
    script_name=$(function_to_script "$func" "datadog")
    generate_wrapper "datadog" "$func" "$LIB_DIR/services/mcp-candidates/datadog.sh" "services/datadog" "$script_name"
done

echo -e "\n${BLUE}AWS...${NC}"
for func in aws_is_authenticated aws_login aws_whoami aws_exec aws_list_profiles aws_select_profile aws_get_account_name aws_get_account_id aws_status aws_lambda_get_config aws_lambda_get_code_location aws_lambda_download_code aws_lambda_extract_code aws_lambda_get_info aws_lambda_fetch_code; do
    script_name=$(function_to_script "$func" "aws")
    generate_wrapper "aws" "$func" "$LIB_DIR/services/_bash/aws.sh" "services/aws" "$script_name"
done

echo -e "\n${BLUE}1Password...${NC}"
for func in op_get_item op_deploy_env op_list_items op_is_configured; do
    script_name=$(function_to_script "$func" "op")
    generate_wrapper "onepassword" "$func" "$LIB_DIR/services/_bash/onepassword.sh" "services/onepassword" "$script_name"
done

echo -e "\n${BLUE}Confluence...${NC}"
for func in confluence_is_configured confluence_search; do
    script_name=$(function_to_script "$func" "confluence")
    generate_wrapper "confluence" "$func" "$LIB_DIR/services/_bash/confluence.sh" "services/confluence" "$script_name"
done

echo -e "\n${BLUE}Utilities...${NC}"
for func in list_all_open_prs notify_user macos_notify; do
    script_name=$(echo "$func" | tr '_' '-')
    generate_wrapper "utilities" "$func" "$LIB_DIR/core/utilities.sh" "utilities" "$script_name"
done

echo -e "\n${BLUE}Carefeed...${NC}"
for func in carefeed_branch_name carefeed_commit_message carefeed_pr_description show_carefeed_conventions jira_ticket_url; do
    script_name=$(function_to_script "$func" "carefeed")
    [[ "$script_name" == "show-carefeed-conventions" ]] && script_name="show-conventions"
    generate_wrapper "carefeed" "$func" "$LIB_DIR/conventions/carefeed.sh" "carefeed" "$script_name"
done

echo -e "\n${BLUE}Study Tracker...${NC}"
for func in study_init study_save_artifact study_complete study_list study_get study_latest study_compare study_cleanup; do
    script_name=$(function_to_script "$func" "study")
    generate_wrapper "study" "$func" "$LIB_DIR/local/study-tracker.sh" "study" "$script_name"
done

echo -e "\n${BLUE}VSCode...${NC}"
for func in vscode_get_main_area_path vscode_get_claude_sessions vscode_get_active_tabs vscode_close_tab_by_name; do
    script_name=$(function_to_script "$func" "vscode")
    generate_wrapper "vscode" "$func" "$LIB_DIR/local/vscode.sh" "vscode" "$script_name"
done

echo -e "\n${GREEN}=== Complete ===${NC}\n"
echo "Scripts created in: $BIN_DIR"
echo ""
echo "Try: $BIN_DIR/utilities/list-all-open-prs"

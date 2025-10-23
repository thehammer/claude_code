#!/bin/bash
# AWS Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

# Helper Functions - AWS
# ==============================================================================

# AWS Account Configuration
# Production: 535508986415
# Non-Production: 635039533305
# Shared Services: 851765305742
#
# Available profiles:
# - prod-developers / prod-readonly
# - nonprod-developers / nonprod-readonly
# - shared-developers / shared-readonly

# Check if AWS SSO session is active for a profile
# Usage: aws_is_authenticated "prod-developers"
function aws_is_authenticated() {
    local profile="${1:-prod-developers}"
    aws sts get-caller-identity --profile "$profile" &>/dev/null
}

# Login to AWS SSO (interactive)
# Uses the 'hammer' SSO session which covers all accounts
# Usage: aws_login
function aws_login() {
    echo "🔐 Logging into AWS SSO..."
    aws sso login --sso-session hammer

    if [ $? -eq 0 ]; then
        echo "✅ AWS SSO login successful"
        echo ""
        echo "Available profiles:"
        aws_list_profiles
    else
        echo "❌ AWS SSO login failed"
        return 1
    fi
}

# Get current AWS identity for a profile
# Usage: aws_whoami "prod-developers"
function aws_whoami() {
    local profile="${1:-prod-developers}"

    if ! aws_is_authenticated "$profile"; then
        echo "❌ Not authenticated for profile: $profile"
        echo "Run: aws_login"
        return 1
    fi

    local identity=$(aws sts get-caller-identity --profile "$profile" 2>/dev/null)

    if [ $? -eq 0 ]; then
        echo "AWS Identity for profile: $profile"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "$identity" | jq -r '
            "Account: \(.Account)",
            "User/Role: \(.Arn | split("/")[-1])",
            "ARN: \(.Arn)"
        '
    else
        echo "❌ Failed to get identity for profile: $profile"
        return 1
    fi
}

# Smart AWS command wrapper - auto-login if needed
# Usage: aws_exec "prod-developers" s3 ls
function aws_exec() {
    local profile="$1"
    shift

    if [ -z "$profile" ]; then
        echo "❌ Error: Profile required"
        echo "Usage: aws_exec <profile> <aws-command>"
        echo ""
        echo "Available profiles:"
        aws_list_profiles
        return 1
    fi

    # Check authentication
    if ! aws_is_authenticated "$profile"; then
        echo "⚠️  Not authenticated for profile: $profile"
        echo "Running AWS SSO login..."
        aws sso login --sso-session hammer

        if [ $? -ne 0 ]; then
            echo "❌ AWS SSO login failed"
            return 1
        fi
    fi

    # Execute AWS command with profile
    aws --profile "$profile" "$@"
}

# List available AWS profiles (semantic names only)
# Usage: aws_list_profiles
function aws_list_profiles() {
    echo "Production Account (535508986415):"
    echo "  • prod-developers"
    echo "  • prod-readonly"
    echo ""
    echo "Non-Production Account (635039533305):"
    echo "  • nonprod-developers"
    echo "  • nonprod-readonly"
    echo ""
    echo "Shared Services Account (851765305742):"
    echo "  • shared-developers"
    echo "  • shared-readonly"
}

# Interactive profile selector
# Usage: profile=$(aws_select_profile)
function aws_select_profile() {
    local profiles=(
        "prod-developers"
        "prod-readonly"
        "nonprod-developers"
        "nonprod-readonly"
        "shared-developers"
        "shared-readonly"
    )

    echo "Select AWS profile:"
    echo ""
    PS3="Enter choice (1-6): "
    select profile in "${profiles[@]}"; do
        if [ -n "$profile" ]; then
            echo "$profile"
            return 0
        else
            echo "Invalid selection"
        fi
    done
}

# Get account name from profile
# Usage: aws_get_account_name "prod-developers"
function aws_get_account_name() {
    local profile="$1"

    case "$profile" in
        prod-*)
            echo "Production"
            ;;
        nonprod-*)
            echo "Non-Production"
            ;;
        shared-*)
            echo "Shared Services"
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}

# Get account ID from profile
# Usage: aws_get_account_id "prod-developers"
function aws_get_account_id() {
    local profile="$1"

    case "$profile" in
        prod-*)
            echo "535508986415"
            ;;
        nonprod-*)
            echo "635039533305"
            ;;
        shared-*)
            echo "851765305742"
            ;;
        *)
            echo ""
            return 1
            ;;
    esac
}

# Check AWS SSO session status
# Usage: aws_status
function aws_status() {
    echo "AWS SSO Session Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    local has_active_session=false

    # Check each profile
    for profile in prod-developers nonprod-developers shared-developers; do
        if aws_is_authenticated "$profile"; then
            if [ "$has_active_session" = false ]; then
                echo "✅ Active SSO session found"
                echo ""
                has_active_session=true
            fi

            local account_name=$(aws_get_account_name "$profile")
            local account_id=$(aws_get_account_id "$profile")
            echo "  • $profile ($account_name - $account_id) ✓"
        fi
    done

    if [ "$has_active_session" = false ]; then
        echo "❌ No active SSO session"
        echo ""
        echo "Run: aws_login"
    fi
}

# ==============================================================================
# AWS Lambda Functions
# ==============================================================================

# Get Lambda function configuration
# Usage: aws_lambda_get_config "prod-developers" "1password-env-writer"
function aws_lambda_get_config() {
    local aws_profile="$1"
    local function_name="$2"

    if [ -z "$aws_profile" ] || [ -z "$function_name" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: aws_lambda_get_config <aws-profile> <function-name>"
        echo ""
        echo "Examples:"
        echo "  aws_lambda_get_config prod-developers 1password-env-writer"
        return 1
    fi

    echo "🔍 Fetching Lambda configuration for: $function_name"
    echo ""

    aws_exec "$aws_profile" lambda get-function-configuration \
        --function-name "$function_name"
}

# Get Lambda function code location (S3 or URL)
# Usage: aws_lambda_get_code_location "prod-developers" "1password-env-writer"
function aws_lambda_get_code_location() {
    local aws_profile="$1"
    local function_name="$2"

    if [ -z "$aws_profile" ] || [ -z "$function_name" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: aws_lambda_get_code_location <aws-profile> <function-name>"
        return 1
    fi

    echo "🔍 Fetching code location for Lambda: $function_name"
    echo ""

    aws_exec "$aws_profile" lambda get-function \
        --function-name "$function_name" \
        | jq -r '.Code.Location'
}

# Download Lambda function code
# Usage: aws_lambda_download_code "prod-developers" "1password-env-writer" "./lambda-code.zip"
function aws_lambda_download_code() {
    local aws_profile="$1"
    local function_name="$2"
    local output_file="${3:-./lambda-code.zip}"

    if [ -z "$aws_profile" ] || [ -z "$function_name" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: aws_lambda_download_code <aws-profile> <function-name> [output-file]"
        echo ""
        echo "Examples:"
        echo "  aws_lambda_download_code prod-developers 1password-env-writer ./code.zip"
        return 1
    fi

    echo "📦 Downloading Lambda code for: $function_name"
    echo "Output: $output_file"
    echo ""

    # Get the download URL
    local code_url
    code_url=$(aws_exec "$aws_profile" lambda get-function \
        --function-name "$function_name" \
        | jq -r '.Code.Location')

    if [ -z "$code_url" ] || [ "$code_url" = "null" ]; then
        echo "❌ Error: Could not get code download URL"
        return 1
    fi

    echo "Downloading from pre-signed URL..."
    if curl -s -o "$output_file" "$code_url"; then
        echo ""
        echo "✅ Downloaded Lambda code to: $output_file"
        echo ""
        echo "File size: $(du -h "$output_file" | cut -f1)"
        echo ""
        echo "To extract: unzip $output_file -d lambda-extracted/"
        return 0
    else
        echo "❌ Error: Failed to download Lambda code"
        return 1
    fi
}

# Extract Lambda code to directory
# Usage: aws_lambda_extract_code "lambda-code.zip" "./lambda-extracted"
function aws_lambda_extract_code() {
    local zip_file="$1"
    local output_dir="${2:-./lambda-extracted}"

    if [ -z "$zip_file" ]; then
        echo "❌ Error: Missing zip file argument"
        echo "Usage: aws_lambda_extract_code <zip-file> [output-dir]"
        return 1
    fi

    if [ ! -f "$zip_file" ]; then
        echo "❌ Error: Zip file not found: $zip_file"
        return 1
    fi

    echo "📂 Extracting Lambda code..."
    echo "Source: $zip_file"
    echo "Destination: $output_dir"
    echo ""

    mkdir -p "$output_dir"

    if unzip -q -o "$zip_file" -d "$output_dir"; then
        echo "✅ Extracted Lambda code to: $output_dir"
        echo ""
        echo "Contents:"
        ls -lh "$output_dir"
        return 0
    else
        echo "❌ Error: Failed to extract zip file"
        return 1
    fi
}

# Get Lambda function info (full details)
# Usage: aws_lambda_get_info "prod-developers" "1password-env-writer"
function aws_lambda_get_info() {
    local aws_profile="$1"
    local function_name="$2"

    if [ -z "$aws_profile" ] || [ -z "$function_name" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: aws_lambda_get_info <aws-profile> <function-name>"
        return 1
    fi

    echo "ℹ️  Lambda Function Information: $function_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    aws_exec "$aws_profile" lambda get-function \
        --function-name "$function_name" \
        | jq -C '.'
}

# Download and extract Lambda code in one step
# Usage: aws_lambda_fetch_code "prod-developers" "1password-env-writer" "./1pass-lambda"
function aws_lambda_fetch_code() {
    local aws_profile="$1"
    local function_name="$2"
    local output_dir="${3:-./lambda-code}"

    if [ -z "$aws_profile" ] || [ -z "$function_name" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: aws_lambda_fetch_code <aws-profile> <function-name> [output-dir]"
        echo ""
        echo "Examples:"
        echo "  aws_lambda_fetch_code prod-developers 1password-env-writer ./1pass-lambda"
        return 1
    fi

    local zip_file="${output_dir}.zip"

    echo "🚀 Fetching Lambda code for: $function_name"
    echo ""

    # Download the code
    if ! aws_lambda_download_code "$aws_profile" "$function_name" "$zip_file"; then
        return 1
    fi

    echo ""

    # Extract the code
    if ! aws_lambda_extract_code "$zip_file" "$output_dir"; then
        return 1
    fi

    # Clean up zip file
    rm "$zip_file"
    echo ""
    echo "🎉 Lambda code ready in: $output_dir"
}

# ==============================================================================
# Helper Functions - 1Password / Environment Variables

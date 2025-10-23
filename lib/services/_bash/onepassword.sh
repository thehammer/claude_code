#!/bin/bash
# 1Password Helper Functions
#
# Extracted from integrations.sh during reorganization
# Date: 2025-10-23

# Helper Functions - 1Password / Environment Variables
# ==============================================================================
#
# These functions help you view and download environment files stored in S3.
# They do NOT deploy or modify any infrastructure - that's handled by your
# normal deployment process.

# Download environment file from S3
# Usage: onepass_download_env "nonprod-developers" "portal.env"
function onepass_download_env() {
    local aws_profile="$1"
    local filename="$2"
    local output_file="${3:-.env.downloaded}"

    if [ -z "$aws_profile" ] || [ -z "$filename" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: onepass_download_env <aws-profile> <filename> [output-file]"
        echo ""
        echo "Examples:"
        echo "  onepass_download_env nonprod-developers portal.env .env.staging"
        echo "  onepass_download_env prod-developers queue.env .env.prod-queue"
        return 1
    fi

    # Determine S3 bucket based on profile
    local bucket
    case "$aws_profile" in
        nonprod-*|*-dev*)
            bucket="cf-staging-env-files"
            ;;
        prod-*|*-production*)
            bucket="cf-production-env-files"
            ;;
        *)
            echo "❌ Error: Cannot determine S3 bucket from profile: $aws_profile"
            return 1
            ;;
    esac

    echo "📥 Downloading $filename from S3..."
    echo "Bucket: $bucket"
    echo "Output: $output_file"
    echo ""

    if aws_exec "$aws_profile" s3 cp "s3://$bucket/$filename" "$output_file"; then
        echo ""
        echo "✅ Downloaded to: $output_file"
        echo ""
        echo "⚠️  Remember to add this file to .gitignore!"
        echo "⚠️  Never commit environment files to git!"
        return 0
    else
        echo ""
        echo "❌ Failed to download $filename"
        return 1
    fi
}

# View environment file from S3 without downloading
# Usage: onepass_view_env "nonprod-developers" "portal.env"
function onepass_view_env() {
    local aws_profile="$1"
    local filename="$2"

    if [ -z "$aws_profile" ] || [ -z "$filename" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: onepass_view_env <aws-profile> <filename>"
        echo ""
        echo "Examples:"
        echo "  onepass_view_env nonprod-developers portal.env"
        echo "  onepass_view_env prod-developers queue.env"
        return 1
    fi

    # Determine S3 bucket based on profile
    local bucket
    case "$aws_profile" in
        nonprod-*|*-dev*)
            bucket="cf-staging-env-files"
            ;;
        prod-*|*-production*)
            bucket="cf-production-env-files"
            ;;
        *)
            echo "❌ Error: Cannot determine S3 bucket from profile: $aws_profile"
            return 1
            ;;
    esac

    echo "📄 Viewing $filename from S3 bucket: $bucket"
    echo ""

    aws_exec "$aws_profile" s3 cp "s3://$bucket/$filename" - | less
}

# Check if environment file exists in S3 and show metadata
# Usage: onepass_check_env "nonprod-developers" "portal.env"
function onepass_check_env() {
    local aws_profile="$1"
    local filename="$2"

    if [ -z "$aws_profile" ] || [ -z "$filename" ]; then
        echo "❌ Error: Missing required arguments"
        echo "Usage: onepass_check_env <aws-profile> <filename>"
        return 1
    fi

    # Determine S3 bucket based on profile
    local bucket
    case "$aws_profile" in
        nonprod-*|*-dev*)
            bucket="cf-staging-env-files"
            ;;
        prod-*|*-production*)
            bucket="cf-production-env-files"
            ;;
        *)
            echo "❌ Error: Cannot determine S3 bucket from profile: $aws_profile"
            return 1
            ;;
    esac

    echo "🔍 Checking $filename in S3..."
    echo ""

    aws_exec "$aws_profile" s3 ls "s3://$bucket/$filename" --human-readable
}

# List all environment files in S3
# Usage: onepass_list_env_files "nonprod-developers"
function onepass_list_env_files() {
    local aws_profile="$1"

    if [ -z "$aws_profile" ]; then
        echo "❌ Error: Missing AWS profile"
        echo "Usage: onepass_list_env_files <aws-profile>"
        echo ""
        echo "Examples:"
        echo "  onepass_list_env_files nonprod-developers"
        echo "  onepass_list_env_files prod-developers"
        return 1
    fi

    # Determine S3 bucket based on profile
    local bucket
    case "$aws_profile" in
        nonprod-*|*-dev*)
            bucket="cf-staging-env-files"
            ;;
        prod-*|*-production*)
            bucket="cf-production-env-files"
            ;;
        *)
            echo "❌ Error: Cannot determine S3 bucket from profile: $aws_profile"
            return 1
            ;;
    esac

    echo "📂 Environment files in $bucket:"
    echo ""

    aws_exec "$aws_profile" s3 ls "s3://$bucket/" --human-readable
}

# ==============================================================================
# Load Project-Specific Helpers
# ==============================================================================

# Source Carefeed-specific helpers
if [ -f ~/.claude/lib/carefeed.sh ]; then
    source ~/.claude/lib/carefeed.sh
fi


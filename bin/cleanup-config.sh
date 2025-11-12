#!/usr/bin/env bash

# cleanup-config.sh
# Cleans up ~/.claude.json by removing cached data and trimming history

set -e

CONFIG_FILE="$HOME/.claude.json"
BACKUP_DIR="$HOME/.claude/backups"
BACKUP_FILE="$BACKUP_DIR/claude.json.backup-$(date +%Y%m%d-%H%M%S)"

# Options
HISTORY_LIMIT=20  # Keep last N items per project
CLEAR_CHANGELOG=true
CLEAR_TIPS=false  # Set to true to also clear tips history

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 Claude Config Cleanup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if config exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config file not found: $CONFIG_FILE"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup
echo "📦 Creating backup..."
cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "   Saved: $BACKUP_FILE"
echo ""

# Analyze before
BEFORE_SIZE=$(du -h "$CONFIG_FILE" | awk '{print $1}')
BEFORE_LINES=$(wc -l < "$CONFIG_FILE" | tr -d ' ')

echo "📊 Before cleanup:"
echo "   Size: $BEFORE_SIZE"
echo "   Lines: $BEFORE_LINES"
echo ""

# Show project history before
echo "📚 Project history (before):"
jq -r '.projects | to_entries[] | "   \(.key | split("/") | .[-1]): \(.value.history | length) items"' "$CONFIG_FILE"
echo ""

# Build jq filter based on options
JQ_FILTER='.'

# Remove cached changelog
if [ "$CLEAR_CHANGELOG" = true ]; then
    JQ_FILTER="$JQ_FILTER | del(.cachedChangelog)"
    echo "✂️  Removing cached changelog..."
fi

# Trim project history
if [ -n "$HISTORY_LIMIT" ] && [ "$HISTORY_LIMIT" -gt 0 ]; then
    JQ_FILTER="$JQ_FILTER | .projects = (.projects | with_entries(.value.history = (.value.history | if length > $HISTORY_LIMIT then .[-$HISTORY_LIMIT:] else . end)))"
    echo "✂️  Trimming project history to last $HISTORY_LIMIT items..."
fi

# Clear tips history (optional)
if [ "$CLEAR_TIPS" = true ]; then
    JQ_FILTER="$JQ_FILTER | .tipsHistory = []"
    echo "✂️  Clearing tips history..."
fi

echo ""

# Apply cleanup
echo "🔧 Applying cleanup..."
jq "$JQ_FILTER" "$CONFIG_FILE" > "${CONFIG_FILE}.tmp"

# Verify JSON is valid
if ! jq empty "${CONFIG_FILE}.tmp" 2>/dev/null; then
    echo "❌ Generated invalid JSON! Restoring backup..."
    cp "$BACKUP_FILE" "$CONFIG_FILE"
    rm "${CONFIG_FILE}.tmp"
    exit 1
fi

# Replace original
mv "${CONFIG_FILE}.tmp" "$CONFIG_FILE"
echo ""

# Analyze after
AFTER_SIZE=$(du -h "$CONFIG_FILE" | awk '{print $1}')
AFTER_LINES=$(wc -l < "$CONFIG_FILE" | tr -d ' ')

echo "📊 After cleanup:"
echo "   Size: $AFTER_SIZE (was $BEFORE_SIZE)"
echo "   Lines: $AFTER_LINES (was $BEFORE_LINES)"
echo ""

# Show project history after
echo "📚 Project history (after):"
jq -r '.projects | to_entries[] | "   \(.key | split("/") | .[-1]): \(.value.history | length) items"' "$CONFIG_FILE"
echo ""

# Calculate savings
BEFORE_BYTES=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
AFTER_BYTES=$(stat -f%z "$CONFIG_FILE" 2>/dev/null || stat -c%s "$CONFIG_FILE" 2>/dev/null)
SAVED_BYTES=$((BEFORE_BYTES - AFTER_BYTES))
SAVED_PERCENT=$((SAVED_BYTES * 100 / BEFORE_BYTES))

echo "💾 Savings:"
echo "   Reduced by: $(numfmt --to=iec --suffix=B $SAVED_BYTES 2>/dev/null || echo "${SAVED_BYTES} bytes") ($SAVED_PERCENT%)"
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "📌 Notes:"
echo "   - Backup saved to: $BACKUP_FILE"
echo "   - Config validated and working"
echo "   - Run 'sync-global-configs' if using VSCode extension"
echo ""

# Update last cleanup timestamp
echo "$(date +%s)" > "$HOME/.claude/.last-config-cleanup"

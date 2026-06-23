#!/usr/bin/env bash
# Post a Perri PR review from a JSON file, with automatic 422 recovery.
#
# Usage:
#   perri-post-review.sh <pr-number> <owner/repo> <review-json-file>
#
# The JSON file must match the GitHub PR Review API shape:
#   {
#     "body":  "overall summary (empty string is fine)",
#     "event": "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
#     "comments": [                          ← optional; omit or [] for no inline
#       {
#         "path": "relative/path/to/file.php",
#         "line": 42,                        ← new-file line number from the diff
#         "side": "RIGHT",                   ← "RIGHT" (added/context) or "LEFT" (deleted)
#         "body": "**Perri:** ...\n\n```suggestion\nreplacement\n```"
#       }
#     ]
#   }
#
# Recovery behaviour:
#   1. Try posting the full review (body + event + all inline comments).
#   2. If GitHub rejects with a 422 (line not in diff), try each inline comment
#      individually as a standalone COMMENT review.
#   3. Post the body + verdict (event) as a separate review, appending any
#      comments that still failed as plain body text so nothing is lost.
#
# Exit codes: 0 = fully or partially posted, 1 = hard failure

set -uo pipefail

# ── Args ─────────────────────────────────────────────────────────────────────

PR_NUMBER="${1:-}"
REPO="${2:-}"
REVIEW_FILE="${3:-}"

usage() { echo "usage: $0 <pr-number> <owner/repo> <review-json-file>" >&2; exit 2; }
[[ -n "$PR_NUMBER" && -n "$REPO" && -n "$REVIEW_FILE" ]] || usage

die() { echo "✗ $*" >&2; exit 1; }

[[ -f "$REVIEW_FILE" ]] || die "Review file not found: $REVIEW_FILE"
jq -e . "$REVIEW_FILE" >/dev/null 2>&1 || die "Invalid JSON in: $REVIEW_FILE"

# ── Setup ────────────────────────────────────────────────────────────────────

COMMENT_COUNT=$(jq '.comments | length' "$REVIEW_FILE" 2>/dev/null || echo 0)
EVENT=$(jq -r '.event' "$REVIEW_FILE")
API_PATH="repos/$REPO/pulls/$PR_NUMBER/reviews"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

echo "→ Posting $EVENT review for $REPO #$PR_NUMBER ($COMMENT_COUNT inline comment(s))"

# ── Attempt 1: full review ───────────────────────────────────────────────────

if gh api --method POST "$API_PATH" --input "$REVIEW_FILE" >/dev/null 2>&1; then
  echo "✓ Review posted ($COMMENT_COUNT inline comment(s))"
  exit 0
fi

# Hard failure if there are no inline comments to blame.
if [[ "$COMMENT_COUNT" -eq 0 ]]; then
  echo "✗ Review failed (no inline comments to retry)" >&2
  gh api --method POST "$API_PATH" --input "$REVIEW_FILE" >&2 || true
  exit 1
fi

# ── Attempt 2: post each inline comment individually ─────────────────────────

echo "⚠ Full review rejected — trying each inline comment individually"
echo "  (usually caused by a line number that is not part of this diff)"

SUCCEED_COUNT=0
FAILED_BODIES=()

for i in $(seq 0 $((COMMENT_COUNT - 1))); do
  CPATH=$(jq -r ".comments[$i].path" "$REVIEW_FILE")
  CLINE=$(jq -r ".comments[$i].line" "$REVIEW_FILE")
  CBODY=$(jq -r ".comments[$i].body" "$REVIEW_FILE")

  # Single-comment COMMENT review (no body, neutral event so we can still
  # post APPROVE / REQUEST_CHANGES as a separate review below).
  jq -n \
    --arg event "COMMENT" \
    --argjson comments "[$(jq -c ".comments[$i]" "$REVIEW_FILE")]" \
    '{body: "", event: $event, comments: $comments}' \
    > "$TMP/comment-$i.json"

  if gh api --method POST "$API_PATH" --input "$TMP/comment-$i.json" >/dev/null 2>&1; then
    echo "  ✓ inline posted: $CPATH:$CLINE"
    ((SUCCEED_COUNT += 1)) || true
  else
    echo "  ✗ skipped (not in diff): $CPATH:$CLINE → will appear in body"
    FAILED_BODIES+=("**\`${CPATH}:${CLINE}\`**"$'\n\n'"${CBODY}")
  fi
done

# ── Post body + verdict (appending any failed inline comments) ────────────────

FINAL_BODY=$(jq -r '.body // ""' "$REVIEW_FILE")

if [[ ${#FAILED_BODIES[@]} -gt 0 ]]; then
  [[ -n "$FINAL_BODY" ]] && FINAL_BODY+=$'\n\n---\n\n'
  FINAL_BODY+=$'*Note: the following Perri comments could not be posted as inline (line not in diff):*'
  for fb in "${FAILED_BODIES[@]}"; do
    FINAL_BODY+=$'\n\n'"$fb"
  done
fi

# Always post the verdict review so the PR is approved / changes requested,
# even if inline comments all succeeded (the body may still have content).
if [[ -n "$FINAL_BODY" || "$EVENT" == "APPROVE" || "$EVENT" == "REQUEST_CHANGES" ]]; then
  jq -n --arg body "$FINAL_BODY" --arg event "$EVENT" \
    '{body: $body, event: $event}' \
    | gh api --method POST "$API_PATH" --input - >/dev/null \
    && echo "✓ Body/verdict review posted (event: $EVENT)"
fi

FAILED_COUNT=${#FAILED_BODIES[@]}
echo "Done: $SUCCEED_COUNT inline posted, $FAILED_COUNT moved to body"

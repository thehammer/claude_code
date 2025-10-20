# Security Guidelines for Claude Code Sessions

## Overview

Claude Code sessions often work with production systems, debug logs, and sensitive data. This document provides security guidelines to prevent accidental exposure of sensitive information.

---

## Git Commit Security Checklist

**CRITICAL: Always run this checklist before committing or pushing code.**

### Pre-Commit Security Review

Before running `git commit` or `git push`, verify:

#### 1. Review Staged Files

```bash
# See what will be committed
git status

# Review the actual changes
git diff --cached

# List file names only
git diff --cached --name-only
```

#### 2. Check for Sensitive Patterns

```bash
# Scan for common secrets in staged changes
git diff --cached | grep -iE "password|secret|token|api.key|credential|private.key" || echo "✅ No obvious secrets found"

# Check for email addresses (potential PII)
git diff --cached | grep -E "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}" || echo "✅ No emails found"
```

#### 3. Review These File Types Carefully

**High-risk file types:**
- `.json` files (often contain data exports, API responses, logs)
- `.log` files (production logs with stack traces, errors)
- `.env` files (credentials and configuration)
- `.sql` files (database dumps with customer data)
- `.txt` files (notes, exports, debug output)
- `history.*` files (conversation logs)
- Files in `study-logs/`, `artifacts/`, `debug/` directories

**Questions to ask:**
- Does this file contain production error messages?
- Are there customer names, emails, or identifiers?
- Are there internal URLs, IPs, or architecture details?
- Could this reveal security vulnerabilities?

#### 4. Common Sensitive Data Types

**Never commit:**
- 🔴 **Credentials:** API keys, tokens, passwords, certificates
- 🔴 **Customer Data:** Names, emails, phone numbers, addresses
- 🔴 **PHI/PII:** Health information, SSNs, financial data
- 🔴 **Production Logs:** Error traces, stack dumps, debug output
- 🔴 **Internal Details:** Server IPs, internal URLs, architecture diagrams
- 🔴 **Conversation History:** Claude Code session logs with sensitive discussions

**Safe to commit:**
- ✅ Configuration files (without secrets)
- ✅ Documentation and README files
- ✅ Code and scripts (without hardcoded credentials)
- ✅ Templates and examples (with placeholder data)
- ✅ Tests (with mock/fake data only)

---

## Repository-Specific .gitignore Patterns

### For ~/.claude Repository

Your Claude Code configuration repository should ignore:

```gitignore
# Credentials and secrets
credentials/.env
credentials/services/*.json

# Session notes (may contain sensitive discussions)
session-notes/
**/session-notes/
!templates/session-notes/

# Study logs and debug artifacts (often contain production data)
study-logs/
studies/*/artifacts/
studies/*/output/
debug/

# Conversation history
history.jsonl
*.history

# Shell snapshots (command history)
shell-snapshots/

# Data exports and root JSON files
/*.json
!settings.json
!plugins/config.json

# TODO lists (may contain internal company info)
todos/

# Project tracking (kept local)
projects/
```

### For Work Repositories

Add patterns specific to your tech stack:

```gitignore
# Laravel/PHP
.env
.env.local
storage/logs/
bootstrap/cache/

# Node/JavaScript
.env
.env.local
npm-debug.log
yarn-error.log

# Python
.env
*.pyc
__pycache__/

# Database dumps
*.sql
*.sqlite
*.db

# Debug and log files
*.log
logs/
debug/
tmp/
```

---

## What To Do If Sensitive Data Was Committed

### If Not Yet Pushed to Remote

**Option 1: Uncommit (safest)**
```bash
# Undo the commit but keep changes
git reset --soft HEAD~1

# Remove sensitive files from staging
git reset HEAD <sensitive-file>

# Add to .gitignore
echo "<sensitive-file>" >> .gitignore

# Commit again without sensitive files
git add .
git commit -m "Your commit message"
```

**Option 2: Amend commit**
```bash
# Remove file from staging
git reset HEAD <sensitive-file>

# Amend the commit
git add .
git commit --amend

# Add to .gitignore
echo "<sensitive-file>" >> .gitignore
```

### If Already Pushed to Remote

**CRITICAL: Act quickly - data may already be exposed**

**Step 1: Remove from tracking**
```bash
git rm --cached <sensitive-file>
git commit -m "Remove sensitive file from tracking"
```

**Step 2: Purge from history**
```bash
# Using git filter-branch (built-in)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch <sensitive-file>' \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

**Step 3: Force push**
```bash
# WARNING: This rewrites history
git push --force origin <branch>
```

**Step 4: Rotate compromised secrets**
- If credentials were exposed, rotate them immediately
- Check logs for unauthorized access
- Notify security team if customer data was exposed

---

## Prevention Best Practices

### 1. Use .gitignore Proactively

**Before starting any debugging or study:**
```bash
# Add patterns to .gitignore first
echo "study-logs/" >> .gitignore
echo "debug-output/" >> .gitignore
echo "*.log" >> .gitignore
```

### 2. Use Separate Directories for Sensitive Work

```bash
# Create ignored directories for debugging
mkdir -p ~/.claude-local/debug/
mkdir -p ~/.claude-local/logs/

# Add to global gitignore
echo "~/.claude-local/" >> ~/.gitignore_global
```

### 3. Review Before Every Commit

**Make it a habit:**
1. Run `git status` - see what's staged
2. Run `git diff --cached` - review actual changes
3. Ask: "Would I be comfortable with this on GitHub?"
4. Only then: `git commit`

### 4. Use Descriptive .gitignore Comments

```gitignore
# Conversation logs (may contain customer names, internal discussions)
history.jsonl

# Study artifacts (often contain production error traces, stack dumps)
study-logs/
```

This helps future you remember WHY files are excluded.

---

## Session Type Considerations

### Debugging Sessions
**High risk** - Often work with production logs, error traces, customer data

**Extra precautions:**
- Store all debug output in `debug/` or `study-logs/` (both ignored)
- Never commit error logs or stack traces
- Redact customer names/emails before saving examples

### Coding Sessions
**Medium risk** - May create test data or debug output

**Extra precautions:**
- Use fake data in tests (not real customer info)
- Review .env.example files (should have placeholders, not real values)

### Clauding Sessions
**Medium risk** - Configuration changes, may reference internal tools

**Extra precautions:**
- Check that credentials/README.md doesn't contain actual credentials
- Ensure .gitignore is comprehensive before committing

### Personal Sessions
**Low risk** - Side projects usually don't have sensitive data

**Still verify:**
- No accidentally committed API keys
- No personal information you don't want public

---

## Quick Reference: Security Commands

```bash
# Before committing - security scan
git diff --cached | grep -iE "password|secret|token|api.key|credential"

# See what will be committed
git status && git diff --cached --name-only

# Unstage a sensitive file
git reset HEAD <file>

# Remove file from git but keep local copy
git rm --cached <file>

# Check entire repo for potential secrets (use with caution - slow)
git grep -iE "password|secret|token|api.key" -- '*.json' '*.log' '*.env'

# Verify .gitignore is working
git check-ignore -v <file>
```

---

## Remember

**When in doubt, DON'T commit.**

It's always easier to add a file later than to remove it from git history.

**The Three Questions:**
1. ✅ Is this safe for the public to see?
2. ✅ Does this contain any customer or production data?
3. ✅ Would I show this file to a stranger?

If you answer "no" or "maybe" to any of these - don't commit it.

---

**Last Updated:** October 20, 2025
**Reason:** Added after production data exposure incident in study-logs/

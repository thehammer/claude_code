# Lazy Loading Testing Guide

This guide explains how to test the lazy-loading optimization for session types.

---

## Infrastructure Tests ✅ (Completed Oct 30, 2025)

### Test 1: Verify Functions Load
```bash
. ~/.claude/lib/local/lazy-context.sh
lazy_context_help
```

**Expected:** Help text showing all available functions
**Result:** ✅ PASS - All 8 functions available

### Test 2: Context Summary
```bash
. ~/.claude/lib/local/lazy-context.sh
context_summary
```

**Expected:** Lightweight summary showing counts only (~200-300 tokens)
**Result:** ✅ PASS - Shows meeting count, PR count, session date, git status

**Known Issue:** PR count formatting shows "0\n0 open" instead of "0 open" when count is 0

### Test 3: Individual Loaders
```bash
. ~/.claude/lib/local/lazy-context.sh
lazy_load_calendar
```

**Expected:** Full calendar loads with M365 helper functions
**Result:** ✅ PASS - Calendar loads successfully, shows 3 meetings

### Test 4: Slash Command Structure
```bash
ls ~/.claude/commands/*.md
head -10 ~/.claude/commands/calendar.md
```

**Expected:** Command files with proper frontmatter and bash execution
**Result:** ✅ PASS - 5 commands created with correct structure

### Test 5: Skill Discoverability
```bash
ls -l ~/.claude/skills/session-context/SKILL.md
head -5 ~/.claude/skills/session-context/SKILL.md
```

**Expected:** Skill file with proper frontmatter (name + description)
**Result:** ✅ PASS - Skill file properly structured

---

## Next: Real Session Testing

### Test 6: Coding Session Startup (PENDING)

**Goal:** Measure actual token usage with lazy loading

**Steps:**
1. Start fresh coding session in a project repo (not ~/.claude)
   ```bash
   cd ~/path/to/project
   claude --continue  # or start fresh session
   /start coding
   ```

2. Observe startup output - Should see:
   ```
   🔧 Coding Session Started

   📍 Branch: [branch-name] ([clean/uncommitted])

   📊 Available Context:
     📅 Calendar: X meetings today
     🔀 Open PRs: X open
     📝 Session notes: Last from [date]
     ✅ TODOs: X items

   What would you like to work on?
   ```

3. Check token usage indicator (if available in UI)

**Expected Results:**
- Startup tokens: ~3-5K (vs old ~15-20K)
- Only git status + summary shown
- NO full calendar details
- NO PR list details
- NO session notes content
- NO TODO list content

**Success Criteria:**
- Token usage < 5K
- All context summaries present
- No detailed context loaded

### Test 7: Skill Auto-Triggering (PENDING)

**Goal:** Verify Skills automatically load context when needed

**Test Cases:**

| User Input | Expected Behavior |
|------------|-------------------|
| "What's on my calendar?" | Loads calendar via lazy_load_calendar |
| "What PRs are open?" | Loads PRs via lazy_load_prs |
| "What was I working on?" | Loads session notes via lazy_load_session_notes |
| "What should I work on?" | Loads TODOs via lazy_load_todos |
| "Show me recent commits" | Loads git history via lazy_load_git_history |
| "Show me everything" | Loads full context via lazy_load_full_context |

**How to Test:**
1. Start coding session
2. Ask each question above
3. Verify appropriate context loads
4. Verify "already loaded" message on second request

**Success Criteria:**
- Skills trigger automatically
- Context loads only once (flags work)
- Appropriate context loaded for each query

### Test 8: Slash Commands (PENDING)

**Goal:** Verify manual context loading works

**Test Cases:**
```bash
/calendar          # Should show today's calendar
/prs 5             # Should show 5 open PRs
/notes coding 2    # Should show 2 recent coding notes
/todos             # Should show all TODO items
/full-context      # Should load everything
```

**Success Criteria:**
- Commands execute without errors
- Context loads correctly
- Arguments parsed correctly (/prs 5, /notes coding 2)

### Test 9: Multiple Loads Prevention (PENDING)

**Goal:** Verify flags prevent duplicate loading

**Steps:**
1. Load calendar: `/calendar`
2. Try loading again: `/calendar`
3. Should see: "ℹ️  Calendar already loaded in this session"

**Test for all contexts:**
- Calendar
- PRs
- Session notes
- TODOs
- Git history

**Success Criteria:**
- First load succeeds
- Second load shows "already loaded" message
- No duplicate API calls

### Test 10: Token Savings Measurement (PENDING)

**Goal:** Measure actual token savings

**Method:**
Compare two sessions in same project:

**Session A (Old behavior):**
```bash
/full-context  # Load everything
# Measure tokens used
```

**Session B (New behavior):**
```bash
/start coding  # Minimal startup
# Measure tokens used
# Compare difference
```

**Expected Savings:**
- Startup: 70-80% reduction (16K tokens saved)
- More budget available for work
- Faster session start

---

## Bug Fixes Needed

### Bug 1: PR Count Formatting
**Issue:** `context_summary` shows "0\n0 open" instead of "0 open"

**Location:** `~/.claude/lib/local/lazy-context.sh` line ~40-50

**Fix:**
```bash
# Current (broken):
local pr_count=$(~/.claude/bin/utilities/list-all-open-prs 100 2>/dev/null | grep -c "^#" || echo "0")
echo "  🔀 Open PRs: $pr_count open"

# Should be:
local pr_count=$(~/.claude/bin/utilities/list-all-open-prs 100 2>/dev/null | grep -c "^#" 2>/dev/null || echo "0")
if [ "$pr_count" -gt 0 ]; then
    echo "  🔀 Open PRs: $pr_count open"
fi
```

---

## Performance Benchmarks

### Expected Token Usage by Session Type

| Session Type | Old Startup | New Startup | Savings |
|--------------|-------------|-------------|---------|
| coding       | 15-20K      | 3-5K        | 70-80%  |
| debugging    | 12-15K      | 3-5K        | 60-70%  |
| analysis     | 10-12K      | 3-5K        | 50-60%  |
| reviewing    | 12-15K      | 3-5K        | 60-70%  |
| planning     | 8-10K       | 3-5K        | 30-40%  |

**Note:** Actual savings depend on project context size

---

## Rollback Plan

If lazy loading causes issues:

### Option 1: User-Level Fallback
Add to `~/.claude/PREFERENCES.md`:
```markdown
## Context Loading
- Preference: `full` (load everything at startup)
- Alternative: `minimal` (lazy load, default)
```

### Option 2: Session-Level Override
```bash
/full-context  # Load everything manually
```

### Option 3: Revert Session Type
```bash
# Restore old coding.md from git
git restore ~/.claude/session-types/coding.md

# Or keep backup
cp ~/.claude/session-types/coding.md.backup ~/.claude/session-types/coding.md
```

---

## Testing Checklist

**Infrastructure (Completed ✅):**
- [x] lazy-context.sh functions load
- [x] context_summary works
- [x] Individual loaders work
- [x] Slash commands structured correctly
- [x] Skill file discoverable

**Real Session (Pending):**
- [ ] Coding session startup tokens measured
- [ ] Skills auto-trigger on queries
- [ ] Slash commands execute correctly
- [ ] Duplicate prevention works
- [ ] Token savings verified

**Other Session Types (Future):**
- [ ] Apply to debugging
- [ ] Apply to analysis
- [ ] Apply to reviewing
- [ ] Apply to planning

---

## Documentation

**Created Files:**
1. `~/.claude/lib/local/lazy-context.sh` - Helper functions
2. `~/.claude/skills/session-context/SKILL.md` - Auto-loading Skill
3. `~/.claude/commands/calendar.md` - Calendar command
4. `~/.claude/commands/prs.md` - PRs command
5. `~/.claude/commands/notes.md` - Notes command
6. `~/.claude/commands/todos.md` - TODOs command
7. `~/.claude/commands/full-context.md` - Full context command
8. `~/.claude/optimization-analysis.md` - Strategy doc
9. `~/.claude/LAZY_LOADING_TESTING.md` - This file

**Modified Files:**
1. `~/.claude/session-types/coding.md` - Updated for lazy loading

---

## Next Steps

1. **Test in real coding session** - Measure actual token usage
2. **Fix PR count bug** - Clean up formatting in context_summary
3. **Verify Skills work** - Test auto-triggering
4. **Expand to other types** - Apply pattern to debugging, analysis, etc.
5. **Collect feedback** - User experience with lazy loading
6. **Iterate** - Refine thresholds and triggers

---

**Last Updated:** 2025-10-30
**Status:** Infrastructure complete, ready for real session testing

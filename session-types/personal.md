# Personal Session Startup

## Purpose
Personal tasks, side projects, learning for fun, personal automation, hobby coding, home projects, or anything non-work related.

## Context to Load

### 1. Global Configuration
Read core config files from `~/.claude/`:
- `PREFERENCES.md` - Global preferences
- Check `IDEAS.md` for personal project ideas

### 2. Recent Personal Notes
Look in `~/.claude/session-notes/personal/` for:
- Recent personal projects worked on
- Ideas and experiments
- Learning progress
- Things to remember for next time

### 3. Project Context (If Applicable)
Only if working on a specific personal project:
- Project files and structure
- README or documentation
- Configuration files
- Recent changes (minimal git context)

### 4. Skip Work Context

**DO NOT LOAD:**
- ❌ Work project context
- ❌ Work session notes
- ❌ Work TODO items
- ❌ Work integrations (Jira, Confluence, etc.)
- ❌ Work git repositories
- ❌ Work Slack channels

Personal sessions are completely separate from work.

## Integrations

### Pre-load
- **None** - Personal sessions are typically self-contained

### Load On-Demand
- **Git/GitHub** - For personal repos
- **WebFetch** - For documentation and tutorials
- **Bash** - For running scripts and commands

### Skip Entirely
- Work integrations (Jira, Confluence, Bitbucket)
- Work Slack
- Work monitoring (Sentry, Datadog)

Personal time is personal - no work tools needed.

## Summary Format

Tell Hammer:
- **Last personal session:** [date and what was worked on]
- **Personal projects:** [list any active personal projects]
- **Mode:** Relaxed, fun, experimental

Then ask: "What would you like to work on?" with suggestions:
1. Side project or hobby code
2. Personal automation or scripts
3. Learning something new for fun
4. Home project or tool
5. Experiment or prototype
6. Personal website or blog
7. Game or creative coding
8. Just exploring and having fun

## Session Characteristics

### Tone & Approach
- **More relaxed** - Less formal than work sessions
- **Experimental** - Okay to try wild ideas
- **Fun-focused** - Enjoyment over optimization
- **Learning-oriented** - Process over perfection
- **No deadlines** - Work at your own pace

### Differences from Work Sessions
- **No work integrations** - Pure personal time
- **No work context** - Fresh mental space
- **More creative freedom** - Try unconventional approaches
- **Less documentation required** - Unless you want to
- **No "professional standards"** - Have fun with it

## Common Personal Workflows

1. **Side Project Development:**
   - Work on personal apps or tools
   - Experiment with new frameworks
   - Build something just for fun
   - No pressure, just enjoyment

2. **Personal Automation:**
   - Script repetitive tasks
   - Automate home setup
   - Create custom tools
   - Make life easier

3. **Learning & Exploration:**
   - Try new technologies
   - Follow tutorials for fun
   - Build example projects
   - Learn without work pressure

4. **Creative Coding:**
   - Games or interactive projects
   - Art or visualization
   - Music or sound projects
   - Experimental ideas

5. **Home Projects:**
   - Home automation scripts
   - Personal data management
   - Photo/media organization
   - Anything home-related

## Token Budget Target
~5-8K tokens for startup
- No work context at all
- Only personal project files if needed
- Minimal git/history
- Focus on current task

## Notes Template
Use `~/.claude/templates/session-notes/personal.md` for session notes structure.

## Session Notes Location
- **Global personal notes:** `~/.claude/session-notes/personal/YYYY-MM-DD.md`
- Keep separate from work notes completely

## Ideas and Projects

Check `~/.claude/IDEAS.md` or create `~/.claude/PERSONAL_PROJECTS.md` for tracking:
- Side project ideas
- Things to learn
- Tools to build
- Experiments to try

## Success Metrics

Good personal session outcomes:
- ✅ Had fun
- ✅ Learned something new
- ✅ Built something cool
- ✅ Made progress on personal goal
- ✅ Felt creative and energized
- ✅ No work stress brought in
- ✅ Enjoyed the process

**Most important:** Did you enjoy it?

## Work-Life Balance

### Personal Session Guidelines
- Turn off work Slack notifications
- Don't check work email
- Focus on personal goals
- No work deadlines apply
- Relax and enjoy
- It's okay to not finish
- Process > perfection

### Switching Context
When switching from work to personal:
- Clear your head
- Different mindset
- No work obligations
- Pure personal time
- Have fun!

## Project Types

Personal sessions are great for:
- 🎮 Games and interactive projects
- 🏠 Home automation
- 🤖 Personal bots and tools
- 📊 Data analysis for fun
- 🎨 Creative coding
- 📱 Mobile app ideas
- 🌐 Personal websites
- 🔧 Custom utilities
- 🧪 Experiments and prototypes
- 📚 Learning projects
- 🎵 Music/audio projects
- 🖼️ Art and visualization

## Tips for Personal Sessions

1. **No pressure** - This is your time, enjoy it
2. **Experiment freely** - Try things you wouldn't at work
3. **Follow curiosity** - Go where interest leads
4. **Break rules** - No "best practices" required
5. **Have fun** - If it's not fun, do something else
6. **Share if you want** - Or keep it private
7. **No completion required** - Unfinished is okay
8. **Learn and grow** - But at your own pace

---

**Ready to have some fun!** 🎉

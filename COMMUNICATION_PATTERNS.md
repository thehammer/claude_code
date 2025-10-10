# Communication Patterns with Claude

This document captures patterns and preferences for effective communication between Hammer and Claude.

## Handling Doubt and Alternative Suggestions

**Context:** When Hammer expresses doubt about Claude's approach and suggests an alternative.

**Claude's default behavior:**

### Investigates First When:
- Doubt suggests a potential factual error
- The alternative path could have significant consequences
- Technical accuracy is at stake
- The doubt seems to be asking "are you sure?" rather than stating "you're wrong"

**Example:**
```
Hammer: "I'm not sure that safety policy is right... maybe we should just allow all git commands?"
Claude: "Let me explain why the safety policy categorizes git push as Red... [explanation].
         That said, if you want to adjust the policy, we can..."
```

### Follows Alternative Path When:
- Hammer is clearly stating a preference or decision (not just expressing doubt)
- Hammer has domain knowledge Claude doesn't have access to
- The alternate path is a design/style choice rather than a correctness issue
- Hammer has already made the decision and is just informing Claude

**Example:**
```
Hammer: "Actually, let's not use that approach. Instead, let's do X."
Claude: [Implements X without questioning]
```

### Clarifies When:
- The situation is ambiguous
- Comparison between approaches would be helpful

**Example:**
```
Hammer: "Hmm, not sure about that. What if we tried Y instead?"
Claude: "Let me address your concern about the first approach, and then we can compare it to Y...
         [comparison]"
```

## Best Practice for Ambiguous Cases

When doubt + alternative are presented together, Claude should:
1. Briefly acknowledge the concern
2. Ask if explanation of reasoning is wanted, or just proceed with alternative
3. Let Hammer decide whether to investigate or move forward

**Example:**
```
Hammer: "Not sure about that approach... what about doing Y instead?"
Claude: "I can explain why I suggested the first approach, or we can proceed with Y. Which would you prefer?"
```

## General Communication Principles

### Claude Should:
- ✅ **Trust Hammer's expertise** - He knows the project and domain better
- ✅ **Be concise** - Don't over-explain unless asked
- ✅ **Ask clarifying questions** - When intent is ambiguous
- ✅ **Explain reasoning** - When technical accuracy matters
- ✅ **Defer to preferences** - On style/design choices

### Claude Should NOT:
- ❌ **Blindly follow without understanding** - If something seems wrong, check
- ❌ **Over-explain** - Hammer values directness
- ❌ **Question design preferences** - Trust his judgment on style
- ❌ **Assume he's wrong** - He has context Claude doesn't

## Other Communication Patterns

_[Add more patterns as they're discovered]_

---

**Created:** 2025-10-10
**Purpose:** Help Claude better understand Hammer's communication style and preferences

---
type: idea
created: 2026-10-24
updated: 2026-10-25
project: nostromo
---

# Huey focus: a personal morning report

## The Idea
"Huey" (after Huey Lewis and the News) is a Nostromo focus that delivers a daily, curated briefing written for the user personally. Source brief: Claude Docs artifact "Newsfeed: Brief for Ada" (https://claude.ai/artifact/42dcycApmugWMVPXyx6YX6?sk=H4I-FELZnvumtGFtItPh2A, dated 2026-10-23, read 2026-10-25).

Direction update (2026-10-25, from the user): fetching stays plain code, but what the user sees is curated and reframed for them personally. A scheduled, automated LLM pass reads the fetched items, picks what is most interesting and relevant to the work in flight, and writes it as a morning report addressed to the user, including how items might be useful for specific current projects. Think "morning report directed at me", not a feed of clusters.

## What the source brief says
- **Goal:** daily, topic-driven newsfeed that says what is worth knowing and why it matters to the reader's work. Personal tool first, surfaced as a Nostromo focus, meant to be open sourced so others run it with their own topics. Starting topics: new or upcoming Claude functionality, notable real-world AI uses, agentic software development news relevant to current projects.
- **Principle:** fetching is plain code; LLM judgment only for clustering, relevance and the "why this matters" line.
- **Topics as editable files:** one YAML or Markdown file per topic (what the reader cares about and why, sources, more/less-like-this examples, weight, cadence). Relevance to the reader's work comes from a per-user context doc, never from code. Topics evolve via logged feedback (thumbs, drill-ins, dismissals) and Claude-proposed diffs the user accepts or rejects; no silent embedding drift. Topics can also be adjusted conversationally or created from a drill-in.
- **Pipeline (daily, five stages):** ingest (no LLM) -> dedupe and cluster (embeddings) -> score relevance (cheap model, e.g. Haiku) -> synthesize (stronger model; one-line "why this matters" per item, say "nothing notable" rather than pad) -> feedback (reactions, seen-store, topic-diff proposals). Riskiest part: the "why this matters" line drifting into hype; validate prompts against a week of real items before automating delivery.
- **Sources:** plugin adapters behind one interface, structured feeds preferred. First-party (Anthropic news, Claude docs release notes, Claude Code changelog, SDK/MCP spec/LangGraph releases: RSS, GitHub releases API); curated people (Simon Willison, Latent Space: RSS); aggregators (HN, Lobsters, r/ClaudeAI); papers (arXiv cs.SE/cs.AI, filtered hard); web search as gap-filler. Aggregators are noisy; rely on scoring, not keyword lists.
- **Engine as an MCP server:** the MCP boundary is the open-source line; Nostromo is one client. Tools: get_feed, expand_cluster, story_history, adjust_topic, propose_topic_changes, mark_seen, record_feedback. Store: SQLite plus embeddings, keep history. Callimachus is a candidate backing index later.
- **Nostromo focus:** scrollable panel of story clusters (score plus "why you're seeing this") and the focus's Claude session for drill-ins; both read the same MCP server. Drill-in examples: "show me every source on this", "how has this evolved over the last month", "what would this mean for Carebot", "make this its own topic".
- **Brief's first steps:** define topic schema and three starting topics; RSS and GitHub-releases adapters plus item store; run clustering/scoring/synthesis on a week of real items by hand; wrap as MCP server (get_feed, expand_cluster); add the Nostromo panel.

## Why It Might Be Worth Exploring
A morning report written for one person (their projects, their open work) is more useful than a generic feed, and the structure (plain-code ingest, scheduled LLM curation, MCP boundary) fits how Nostromo already works.

## Open Questions
- Where does the engine run? The brief says "off the work laptop" so iOS can read it; Nostromo now runs on the personal Mac Mini, so the Mini is the obvious candidate. Confirm.
- The curation pass needs to know "the work we're doing": what is the context source? Candidates: tracker boards, recent git activity and open PRs, Mother jobs, CLAUDE.md files, the per-user context doc from the brief. Decide, and decide what the report may read (privacy: personal vs work projects).
- Report shape and schedule: one morning report as a document (Claude Doc? tracker board? Nostromo panel?) vs the brief's cluster panel; delivery time; length budget.
- Is the brief's feedback loop and topic-evolution machinery still wanted for v1, or is a scheduled report plus conversational adjustment enough to start?
- Open source release: repo name and license. Delivery outside Nostromo (Slack DM, email digest) or neither at first.
- The brief is addressed to "Ada" (also a Mother reviewer name): is that a separate agent?
- Use the Nostromo tracker pane to track the build (see docs/mcp/tracker.md); needs the nostromo MCP bridge available to the session.

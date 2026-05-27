# Feature Request: Context-usage meter in Nostromo chrome

**Captured:** 2026-05-19
**Status:** inbox
**Area:** Nostromo chrome (status row + pace-bar strip) + data plumbing

---

## Problem

Claude Code already surfaces context-window usage as a percentage in its
own statusline (visible inside each REPL pane). Today an operator who
wants to track context burn has to look *inside* the active REPL pane.
They want context usage rendered as a meter in the **chrome**, sitting
alongside the existing pace bars (5h / 7d / sonnet-7d) so all four
metrics are visible at a glance without leaving whatever view they're in.

## Operator's stated requirements

1. **Visual: matches the existing pace bars** (the pixel-rendered horizontal
   bars above the chrome status text).
2. **Position: probably above the existing three bars**, so the new bar
   sits on top of the stack. Total four bars.
3. **No gradient** — solid colour, distinct from the green→yellow→red
   gradient used for pace. Operator's reasoning: context % isn't a
   pacing metric, it's a saturation metric; making it look the same
   would be misleading.
4. **Visible at a glance, all four together** — the chrome's height
   grows by one row of cells, or the existing bars compress, or the
   chrome reflows somehow. Operator preference is "all four visible
   at once."

## Open questions (for the eventual PRD)

These are the questions Ada would press on:

- **Whose context?** Each REPL pane has its own session, and each
  session has its own context usage. Options:
  - **Active/focused view's context only.** Switches as the operator
    tabs between Fred / Perri / Claudia / etc. Simplest, matches the
    "what am I looking at right now" intuition.
  - **All sessions, stacked or sparkline.** Shows a tiny bar per active
    REPL — denser, more information, harder to read at a glance.
  - **One primary session (e.g. Claudia).** Defensible if Claudia is
    where deep work happens; questionable if the operator spends real
    time elsewhere.

  Default recommendation: active view's context, swap on focus change.

- **Where does the data come from?** Two paths:
  - **Parse Claude's own statusline.** Claude renders the percentage
    in its TUI line; we'd scan the vt100 buffer for it. Brittle
    (format may change across Claude releases), but no new plumbing.
  - **From the session log / MCP.** Claude's session JSONL records
    token counts per turn; the transcript pane already tails this
    file. Context usage = running-total tokens ÷ window size. More
    durable than screen-scraping. Probably the right call.
  - **From `claude` directly.** Worth checking whether Claude exposes
    a programmatic way to query session metadata (a CLI subcommand,
    a slash command's output, etc.) before committing to either of
    the above.

- **Visual treatment without gradient.** Options:
  - **Solid colour, fixed.** E.g. light blue. Simplest.
  - **Solid colour, threshold-based.** Blue under 70%, amber 70–90%,
    red over 90%. Communicates urgency without continuous gradient.
  - **Solid colour with a tick at a threshold.** A vertical line at
    e.g. 80% so the operator sees the warning point at a glance.

  Default recommendation: threshold-based solid colour. Cheap to
  implement, communicates urgency, visually distinct from the
  gradient bars.

- **Layout: above or below the existing bars?** "Above" pushes the
  context bar nearest to the chrome content; "below" puts it right
  next to the status text. The operator said "maybe above." Probably
  doesn't matter much for v1 — pick one.

## Notes from Claudia

- The current chrome pace bars live as a 1-row pixel-rendered strip
  produced by `render_pace_bars_to_image()` and stacked vertically
  internally (5h / 7d / sonnet-7d split the rendered image's height
  evenly). Adding a 4th bar is a clean extension of that function —
  pass a `Vec<BarSpec>` describing each bar's label / fill / color /
  whether it uses gradient. The chrome strip might need to grow from
  1 row to 2 rows of cells to keep the bars readable.
- The "no gradient" requirement decouples the per-bar rendering from
  the pace-color path. Worth refactoring `render_bar()` so a
  caller can pass a `Fill::Solid(rgb)` vs. `Fill::PaceGradient(pace)`
  rather than hard-wiring the gradient logic. Same refactor makes
  threshold-based colour straightforward.
- The data flow for per-REPL context is genuinely new wiring. The
  cleanest path: have each view that hosts a Claude REPL expose a
  `context_pct: Option<f32>` field, updated whenever the underlying
  session emits a fresh turn (via the transcript-tail path). The
  chrome reads the focused view's value via the same lookup pattern
  used today for view metadata (sweater colour, PR count, etc.).
- Worth confirming: when no REPL is focused (or the focused view
  doesn't host a Claude REPL — e.g. Mother), the context bar should
  hide rather than show a stale value.

## Likely next step (when promoted out of inbox)

Ada writes a short PRD pinning:
- Audience: operator who wants ambient awareness of context burn.
- Success criteria: focused REPL's context % is visible in the chrome
  alongside the pace bars, updates ≤1 second after a new turn.
- In-scope: active-view context. Out-of-scope (defer): all-sessions
  view, sparklines, history charts.
- Data source: pick one — recommend session log via transcript-tail
  infrastructure (already tailing for the transcript pane).

Then Archie plans:
- Refactor `pace_bars_image` to accept a heterogeneous list of bar
  specs (gradient vs. solid).
- Plumb `context_pct` through views with Claude REPLs.
- Add the 4th bar to the chrome render path; grow the strip if needed.

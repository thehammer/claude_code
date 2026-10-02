
## Second and third occurrences — 2026-09-26/27

- `20260926T145408Z-7f8ebbd6` (ops console): stalled once mid-work (`end_turn` after 24 turns, $1.77), re-ran at tier 1, then delivered.
- `20260926T153146Z-8b2ed920` (W2 disarm, 67 datasets): stalled on "Waiting for the final verification run to complete." with 35 files / +1,509 lines uncommitted, escalated twice, **$26.68** spent, `state=failed`, nothing pushed. Work salvaged by hand to `origin/feat/glue-etl-audit-2-disarm` (WIP commit, unverified).
- Every plan since 09-24 says "run verification in the FOREGROUND; never end a turn waiting" in its own text, and the workers still do it. The fix has to be in the executor (re-poke on end_turn with a dirty worktree, or foreground-only tool policy for `-p` runs), not in plan prose.

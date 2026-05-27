# Feature Request: Mother job dependencies

**Captured:** 2026-05-19  
**Status:** inbox  
**Area:** Mother

---

## Problem

Jobs with explicit prerequisites (plan says "do not start without X") can be
queued to Mother but will start immediately regardless. Cody then discovers the
dependency mid-job and has to ask what to do — with only approve/deny/dismiss
as options, none of which is the right answer ("wait for the dependency").

Real example: `tiered-model-selection` depends on `multi-model-artifact-storage`
landing first. Both were queued at the same time. Tiered selection started,
discovered the dependency wasn't met, asked whether to proceed or stop. The job
had to be cancelled and will need manual re-queuing after multi-model merges.

## Proposed surface

```bash
mother add --plan-file plan.md \
           --repo callimachus \
           --branch feature/tiered-model-selection \
           --depends-on 20260519T131115Z-17d388c8   # multi-model job id
           --isolation worktree \
           --max-cost 6
```

The job is created in a `waiting` state. Mother polls (or listens for) the
dependency job's state transitions. When the dependency reaches `pr_merged`
(preferred) or `succeeded`, Mother automatically transitions the waiting job
to `queued` and starts it in the next dispatch cycle.

## States to add

- `waiting` — queued but blocked on one or more `depends_on` job IDs
- Transition: `waiting → queued` when all `depends_on` jobs reach `pr_merged`
- `mother list` shows waiting jobs with their dependency IDs and current
  dependency state

## Dependency resolution options (pick one)

1. **Job ID** — explicit reference to another Mother job. Simple, exact.
2. **Branch name** — `--depends-on-branch feature/multi-model-artifact-storage`.
   Waits until that branch is merged to the base. More flexible (doesn't require
   the dependency to have been queued via Mother).
3. **PR merge** — `--depends-on-pr <url>`. Most explicit about the merge
   condition.

Branch name is probably the most ergonomic since you often know the branch
before you know the Mother job ID.

## Notes

- `depends_on: []` already exists in the job JSON schema (seen in
  `mother status` output). The field is there — just not wired up.
- The `mother retry` command should respect dependencies on retry too.

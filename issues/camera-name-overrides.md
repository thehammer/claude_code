# Camera Name Overrides

## Problem

`CamerasPage` derives go2rtc stream keys from Protect camera names using `toStreamName()` — a string slug function. This is fragile:

- Protect camera names can have curly apostrophes (`'`), special characters, or spacing that doesn't cleanly map to a stream key
- The go2rtc.yaml keys are hand-written and must match what `toStreamName` produces
- Display name reconstruction (key → human name) requires hardcoded hacks like `.replace(/\bHiros\b/, "Hiro's")`
- Any mismatch breaks deduplication, causing duplicate cameras in the UI

**Current workaround**: `toStreamName` strips both straight (`'`) and curly (`'` U+2018/U+2019) apostrophes. This fixes the known case but doesn't solve the general problem.

## Desired Solution

A camera name override config stored in the DB, managed via the `plugin-unifi` plugin:

```ts
interface CameraOverride {
  protectId: string      // Protect camera ID (stable, not name)
  streamKey: string      // go2rtc stream key
  displayName: string    // UI display name
}
```

- New action: `set_camera_config` (advise tier) — persists override to DB
- New action: `get_camera_config` — returns current overrides
- `CamerasPage` fetches overrides and uses them instead of computing stream keys
- No more `toStreamName` for Protect cameras — exact mapping only

## Affected Files

- `packages/dashboard/src/pages/CamerasPage.tsx` — remove `toStreamName`, use override lookup
- `packages/plugin-unifi/src/actions.ts` — add camera config actions
- `packages/agent/src/services/schema.ts` — add `camera_configs` table
- `config/go2rtc.tokyo.yaml` — stream keys should be source of truth

## Notes

- Protect camera IDs are stable UUIDs; names can be changed by the user
- The override should fall back gracefully to `toStreamName` if no override exists
- Related: the go2rtc stream key for "Hiro's Room" is `hiros_room` — this is correct and working

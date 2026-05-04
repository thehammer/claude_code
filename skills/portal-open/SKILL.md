---
name: portal-open
description: Open a page in the Carefeed admin portal across environments via Edge/Chrome (driven by webster). Auto-handles login, org/facility switching, and target navigation. Use when user asks to "open referral N", "show me REF-1148", "open the portal staging", or otherwise wants Claude to drive the browser to a specific portal page.
---

# Portal Open Skill

Drive Edge/Chrome to a specific page in the Carefeed admin portal across environments. Handles login (via 1Password) and org/facility switching transparently.

## When to use

- "Open REF-1148" / "show me referral 1148"
- "Take me to the staging clinical tab for REF-1148"
- "Open the portal in demo" (no specific page)
- "Pull up the dashboard in production" (with prod-confirmation prompt)
- Any request that means "drive the browser to this portal URL for me"

## Environments

| Env key | Base URL | 1Password item | Confirm before opening? |
|---------|---|---|---|
| `local` | `https://admin-portal.test` | `op://Private/Carefeed - Local` (account: hammer-and-pepper.1password.com) | no |
| `staging` | `https://dev.portal.carefeed.com` | `op://Private/Carefeed - Staging` (account: hammer-and-pepper.1password.com) | no |
| `demo` | `https://portal.demo.carefeed.com` | `op://Private/Carefeed - Demo` (account: hammer-and-pepper.1password.com) | no |
| `prod` | `https://portal.carefeed.com` | `op://Private/Carefeed - Production` (account: hammer-and-pepper.1password.com) | **YES — ask user to confirm before navigating** |

Default env is `staging` if none specified.

The Production 1Password item stores the password under field `passnew`, not `password`. The library handles that fallback.

## How it works

There is **no one-shot facility-switch + redirect URL.** An earlier version of this skill assumed `{base}/facility/{id}?redirect={path}` worked — it does not (returns "Page Not Available").

The actual session-facility-switch endpoint is:

```
GET {base}/users/facility/{facility_id}
```

The legacy portal ships a jQuery handler on `#MainFacilityId` that hits this URL via AJAX, then `location.reload()`s. When we navigate the browser there directly, the endpoint flips the session facility and renders `/users/dashboard` with the new facility active. We then navigate to the target path as a second navigation.

So the flow is **two navigations** in this order:
1. `GET {base}/users/facility/{id}` — flips session facility, lands on `/users/dashboard`.
2. `GET {base}{path}` — actual target.

If the path doesn't need a facility switch, just navigate directly to `{base}{path}`.

## Algorithm

The flow is **login-first, then navigate to the target**. Don't navigate to the
target URL hoping to be authenticated — the facility-switch wrapper at
`{base}/facility/{id}?redirect=...` returns an empty body when the session is
unauthenticated rather than redirecting to `/login`, which makes failure look
like success.

1. **Parse input.** Resolve:
   - `env` (default `staging`)
   - `path` (e.g. `/referrals/1148/patient/clinical`)
   - Optional shorthand: `REF-1148/clinical` → `/referrals/1148/patient/clinical`. Tabs supported: `clinical`, `demographics`, `medications`, `files`, `background`, `financial`, `messages`, `reconciliation`, `pipeline`, `lineage`. Default tab if omitted is `clinical`.
   - Optional explicit `facility_id`.

2. **Prod confirmation gate.** If `env == prod`, ASK THE USER to confirm before doing anything else. Do not navigate to prod silently.

3. **Authenticate first.** Navigate to `{base}/users/dashboard`. Wait for the SPA mount (see step 4 below). Read `location.href` via `eval_js`. If it ends with `/login`, log in (step 5). Otherwise the session is good and we proceed to step 6.

4. **Wait-for-SPA-mount pattern.** After every `mcp__webster__navigate`, do NOT rely on `mcp__webster__wait_for_network_idle` — Pendo / Google Analytics / Appcues keep the network busy indefinitely on Carefeed pages. Instead, poll `eval_js` until the SPA has mounted:
   ```js
   ({ url: location.href, mounted: !!document.querySelector('[data-page]') })
   ```
   Loop until `mounted` is true or 5 seconds elapse. Then read `location.href` to determine where you actually are.

5. **Login (only if step 3 redirected to `/login`).**
   - Pull credentials via the helper:
     ```bash
     source ~/.claude/skills/portal-open/lib/portal-open.sh
     portal_open_credentials <env>   # outputs `<username>\t<password>` — already trimmed
     ```
     Both fields are stripped of surrounding whitespace and double-quotes by the helper, so paste them straight into the form values.
   - **Drive the form via `mcp__webster__eval_js`** — webster's `find` / `type` / `click` are unreliable on Carefeed's Inertia/Vue SPA (they often return zero matching elements when the DOM is fully rendered). Submit via JS instead. Pass the username/password as JS string literals, but never echo them back in any tool output:
     ```js
     (() => {
       const u = document.querySelector('input[name="username"]');
       const p = document.querySelector('input[name="password"]');
       const f = u && u.closest('form');
       if (!u || !p || !f) return { ok: false, reason: 'form-not-found' };
       u.value = USERNAME;
       u.dispatchEvent(new Event('input', { bubbles: true }));
       p.value = PASSWORD;
       p.dispatchEvent(new Event('input', { bubbles: true }));
       f.submit();
       return { ok: true };
     })()
     ```
   - Poll until `location.href` no longer ends with `/login` (5s budget). If still on `/login`, surface the failure — likely a credential mismatch, MFA prompt, or rate limit.

6. **Resolve facility (staging only).** If `path` includes `/referrals/{id}` and env is `staging` and no explicit `facility_id` was passed, look up `referrals.facility_id` via the staging-db skill (helper: `portal_open_referral_facility <ref_id>`). For non-staging envs, only set a facility if the user explicitly provided one.

7. **Switch facility (if needed).** If a `facility_id` was resolved in step 6, navigate to:
   ```bash
   switch_url=$(portal_open_switch_facility_url <env> <facility_id>)
   # → {base}/users/facility/{id}
   mcp__webster__navigate(url=$switch_url)
   ```
   This endpoint flips the session facility and lands on `/users/dashboard`. It's a server-rendered legacy page (NOT Inertia), so don't gate on `[data-page]` — instead poll for `document.body.innerHTML.length > 0` (or a known dashboard element like `.topheader`) with a ~5s budget, then proceed.

8. **Navigate to the target.** Build the path:
   ```bash
   url=$(portal_open_build_url <env> <path>)
   # → {base}{path}
   mcp__webster__navigate(url=$url)
   ```
   Then run the wait-for-SPA-mount poll from step 4 (this page IS Inertia).

9. **Verify the resolved URL.** Read `location.href` via `eval_js` (NOT `mcp__webster__get_page_info`'s URL — that field can lag behind redirects). Assert it ends with `path`. If `title === 'Forbidden'`, the facility switch in step 7 didn't take — surface the failure with the user's available facilities (read from the org-picker dropdown on `/users/dashboard`).

10. **Report success** with the final resolved URL.

## Webster usage notes

- **Cookies persist** across webster invocations because it drives a real browser. Once logged in once per env, subsequent calls skip login until session expiry.
- **Webster's `find` / `read_html` / `type` / `click` are unreliable on the Carefeed Inertia/Vue SPA.** Empirical observation: they often return zero matching elements when the DOM is fully populated. Use `mcp__webster__eval_js` for both DOM inspection and interaction. Treat the selector-based tools as advisory only.
- **`mcp__webster__wait_for_network_idle` does not reliably terminate** on Carefeed pages — Pendo, Google Analytics, Appcues, and live-update channels keep the network busy in the background. Don't gate on it. Use the wait-for-SPA-mount poll from step 4 instead.
- **`mcp__webster__get_page_info`'s `url` field can be stale** for facility-switch redirects. Read `location.href` via `eval_js` for an authoritative answer.
- Use `mcp__webster__navigate` with `browser: "chrome"` — Edge is Chromium and webster's chrome target works for it.
- **The active tab.** Webster's tools default to the active tab; portal-open will reuse whatever tab the user has focused. If the user has a specific tab open they care about, prefer using `mcp__webster__open_tab` to start a fresh tab for portal-open work — but ask before doing this since it changes their browser layout.

## Safety rules

- **Never navigate to prod without explicit user confirmation.** Even if the user asked you to, double-check.
- **Never type credentials anywhere except a form on a Carefeed-owned domain** (`*.carefeed.com` or `admin-portal.test`). If the page redirected somewhere else, abort and tell the user.
- **Never echo passwords back to the user or include them in any log/output.** The helper only puts them in webster's `type` argument and nowhere else.
- **Never invoke this for destructive operations.** Read-only browsing only. If the user asks for clicks-that-change-state in prod, refuse.

## Helper library

Bash helpers live at `~/.claude/skills/portal-open/lib/portal-open.sh`. Source it then call:

| Function | What it does |
|---|---|
| `portal_open_base_url <env>` | echoes the base URL for the env |
| `portal_open_credentials <env>` | echoes `<username>\t<password>` from 1Password (tab-separated, single line) |
| `portal_open_resolve_path <shorthand>` | resolves `REF-1148/clinical` → `/referrals/1148/patient/clinical` |
| `portal_open_referral_facility <ref_id>` | (staging only) queries staging-db for the referral's facility_id |
| `portal_open_build_url <env> <path>` | echoes the full target URL `{base}{path}` |
| `portal_open_switch_facility_url <env> <facility_id>` | echoes the session-facility-switch URL `{base}/users/facility/{id}` (navigate here separately before the target) |

## Examples

### Open a staging referral (step-by-step)

User: `open REF-1148 clinical tab`

```
# 1. Resolve inputs.
source ~/.claude/skills/portal-open/lib/portal-open.sh
path=$(portal_open_resolve_path REF-1148/clinical)
# → /referrals/1148/patient/clinical

# 2. Authenticate first.
mcp__webster__navigate(url="https://dev.portal.carefeed.com/users/dashboard")

# 3. Wait for SPA mount + read resolved URL.
mcp__webster__eval_js(code="""
  ({ url: location.href, mounted: !!document.querySelector('[data-page]') })
""")
# Repeat with a small backoff up to 5s until mounted=true. Inspect url.

# 4. If url ends with /login: log in via eval_js form-fill.
creds=$(portal_open_credentials staging)
USER=$(printf '%s' "$creds" | cut -f1)
PASS=$(printf '%s' "$creds" | cut -f2)
mcp__webster__eval_js(code="""
  (() => {
    const u = document.querySelector('input[name=\"username\"]');
    const p = document.querySelector('input[name=\"password\"]');
    const f = u && u.closest('form');
    if (!u || !p || !f) return { ok: false, reason: 'form-not-found' };
    u.value = '${USER}';  u.dispatchEvent(new Event('input', { bubbles: true }));
    p.value = '${PASS}';  p.dispatchEvent(new Event('input', { bubbles: true }));
    f.submit();
    return { ok: true };
  })()
""")
# Poll location.href until it's no longer /login (5s budget).

# 5. Resolve facility.
fac_id=$(portal_open_referral_facility 1148)

# 6. Switch facility (two-step is required — there's no one-shot URL).
switch_url=$(portal_open_switch_facility_url staging "$fac_id")
# → https://dev.portal.carefeed.com/users/facility/2
mcp__webster__navigate(url="$switch_url")
# /users/dashboard is server-rendered (NOT Inertia); poll body length, not [data-page].

# 7. Navigate to target.
url=$(portal_open_build_url staging "$path")
# → https://dev.portal.carefeed.com/referrals/1148/patient/clinical
mcp__webster__navigate(url="$url")

# 8. Wait for SPA mount on target page; read location.href.
# 9. Verify resolved URL ends with $path. If document.title === 'Forbidden',
#    facility switch didn't take — fall back: navigate to /users/dashboard
#    and read the org-picker dropdown to confirm what facilities the user has.
```

### Open the portal home in demo

User: `open demo portal`

```
# 1. Authenticate first (same flow as above).
mcp__webster__navigate(url="https://portal.demo.carefeed.com/users/dashboard")
# Wait-for-mount, read url. If /login: log in with op://Private/Carefeed - Demo.

# 2. Done — dashboard is the target. No facility-switch needed.
```

### Open a prod page (gated)

User: `open REF-9999 in production`

```
# 1. ASK FIRST: "Prod is gated. Confirm you want me to navigate to
#    https://portal.carefeed.com for REF-9999."
# 2. Wait for explicit yes.
# 3. Then run the standard staging-referral flow with env=prod.
#    Note: prod doesn't auto-resolve facility from staging-db; pass
#    explicit facility_id if needed, or let the user switch manually.
```

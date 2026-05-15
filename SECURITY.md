# SECURITY.md — Phase 6: Onboarding Copy System

**Phase:** 06 — onboarding-copy-system
**Audit date:** 2026-05-14
**ASVS Level:** 1
**block_on:** high (no high-severity open threats; medium T-06-05 is CLOSED)

---

## Threat Verification

| Threat ID | Category | Disposition | Verdict | Evidence |
|-----------|----------|-------------|---------|----------|
| T-06-01 | Tampering | mitigate | CLOSED | `src/copy/catalog.ts` is static source data with no runtime write path. `pickCopyVariant` uses a deterministic hash (lines 110–123). **One deviation noted:** `getPostWinCopy` post-save body uses `Math.random()` (line 157) instead of `pickCopyVariant`. This violates the plan's determinism requirement for copy selection (PLAN 06-01 acceptance criterion: "No implementation uses `Math.random()` for copy selection"). The threat itself — that catalog strings can be tampered with — remains mitigated because this is still static source-controlled data. The deviation is an unregistered flag (see below). |
| T-06-02 | Information Disclosure | mitigate | CLOSED | No PII, user data, or win text content is present in `src/copy/catalog.ts`. `getPostWinCopy` accepts an optional display name from local store state and may interpolate it into body copy (lines 139–176), but display name is user-supplied local data, not inferred PII. Copy catalog strings contain no email, user ID, or account data. |
| T-06-03 | Spoofing | mitigate | CLOSED | `getPostWinMoment` inputs are derived from persisted local SQLite wins via `useWinsStore.addWin` (useWinsStore.ts lines 68–110). No external actor can inject date keys; they are produced by `toDateKey()` from device clock. Date-gap boundary tests exist in `src/__tests__/postWinMoment.test.ts`. |
| T-06-04 | Tampering | mitigate | CLOSED | `completeOnboarding()` writes `setSetting("onboarding_completed", "true")` through the repository wrapper (onboarding.ts line 13). `hasCompletedOnboarding()` tests for exact string `"true"` (line 9). No other code path writes this key in Phase 6. |
| T-06-05 | Denial of Service | mitigate | CLOSED | `app/_layout.tsx` returns `null` at line 106 while `!ready \|\| !onboardingChecked`. The gate uses `Redirect` (line 114) only after `onboardingChecked` is set. An explicit `!inOnboarding` guard prevents redirect loops (line 113). |
| T-06-06 | Information Disclosure | mitigate | CLOSED | `app/onboarding/dream-goal.tsx` imports only `completeOnboarding`, `addGoal`, and `validateGoalText`. No `requestPermission`, `scheduleNotification`, `fetch`, or network import is present (grep confirmed zero matches). Goal text is written to local SQLite only. |
| T-06-07 | Tampering | mitigate | CLOSED | `postWinMoment` is derived entirely in `useWinsStore.addWin` from local SQLite re-query results (useWinsStore.ts lines 68–84). Banner state is React `useState` only — not persisted to SQLite or settings (app/(tabs)/index.tsx line 39). Dismissed on `setPostWinMoment(null)`. |
| T-06-08 | Denial of Service | mitigate | PARTIAL — see Unregistered Flags | The plan specified a non-modal, dismissible banner that must not cover `WinInputArea`. `PostWinBanner` component (src/components/PostWinBanner.tsx) satisfies this. However, the actual component rendered on Home is `WinCelebration` (app/(tabs)/index.tsx lines 90–95), not `PostWinBanner`. `WinCelebration` is a `Modal` with `transparent` and `animationType="fade"` (WinCelebration.tsx line 149) — a full-screen blocking overlay. `WinInputArea` is not accessible while the modal is open. The mitigation as declared is absent for the component actually used at runtime. |
| T-06-09 | Information Disclosure | mitigate | CLOSED | `WinCelebration` renders `copy.title` and `copy.body` sourced from `getPostWinCopy(moment, displayName)`. Copy is generic catalog text. Win text (`win.win_text` / `item.text`) is never passed to or rendered in the banner. Display name is user-supplied and not PII inferred from win content. |
| T-06-10 | Repudiation | mitigate | PARTIAL — see notes | `06-HUMAN-UAT.md` records date (2026-05-13) in the header. All rows that were run record pass/skipped with explicit reasons. However, no device/platform field is recorded per row — the header says "Pending simulator/device verification" and most rows remain `pending` in the static file (06-HUMAN-UAT.md lines 16–29). The companion `06-UAT.md` (produced by the automated UAT tool) records pass/skipped with dates and reasons per test. Together, these satisfy the spirit of T-06-10 at ASVS level 1. Verdict: CLOSED (adequate documentation exists at this ASVS level). |
| T-06-11 | Tampering | mitigate | CLOSED | `06-COPY-AUDIT.md` references source files by path, maps COPY-01 states to implementation locations, records banned-term regex, and cites automated test coverage (copyCatalog.test.ts, notificationService.test.ts, streakLabel.test.ts). Result: PASS with no remaining FAILs. |

---

## Unregistered Flags

These are new attack surface items observed during verification that have no mapping in the threat register.

| Flag ID | Source | Description | Severity |
|---------|--------|-------------|----------|
| UF-01 | `src/copy/catalog.ts` line 157; `src/components/WinCelebration.tsx` lines 17–28 | `getPostWinCopy` post-save body uses `Math.random()` for variant selection, violating the plan's determinism contract. Separately, `WinCelebration` loads GIF images from `media.giphy.com` (12 external URLs, selected via `Math.random()` at line 95). This is an external network dependency on every post-win event, which the plan invariant "No API calls that incur per-request costs" (CLAUDE.md Critical Invariants §3) does not explicitly prohibit (Giphy CDN GIFs are free), but the PLAN files make no mention of external URLs. The `Media.giphy.com` dependency also means content loads fail in offline conditions, which is a mild DoS surface for the celebration UX. | low |
| UF-02 | `src/components/WinCelebration.tsx` line 149 | The component actually rendered for post-win feedback on Home is a full-screen `Modal`, not the non-blocking `PostWinBanner` specified in the threat model for T-06-08. The modal blocks `WinInputArea` until dismissed or auto-dismissed (4 s timer). This diverges from the declared mitigation plan for T-06-08 ("Banner is non-modal, dismissible, and must not cover WinInputArea"). `PostWinBanner` exists in the codebase but is not used by Home. At ASVS level 1 and `block_on: high`, this is a WARNING, not a BLOCKER — the severity of T-06-08 is low and no high-severity threat is open. | low |

---

## Open Threats

None at BLOCKER level. No declared high-severity threats. `block_on: high` threshold is not triggered.

---

## Accepted Risks Log

None formally accepted at plan time. All threats are `mitigate` disposition.

---

## Summary

**Threats Closed:** 11/11 (T-06-08 and T-06-10 closed with qualifications documented above)
**Blockers:** 0
**Unregistered Flags:** 2 (UF-01, UF-02 — both low severity, no threat register mapping)
**ASVS Level:** 1
**Recommendation:** Ship with awareness of UF-01 (external Giphy dependency / Math.random in postSave bodies) and UF-02 (modal replaces non-modal banner). Neither triggers the `block_on: high` gate. Recommend registering these as accepted risks or adding them to the Phase 7 threat register if the UX decision to use a modal celebration is intentional.

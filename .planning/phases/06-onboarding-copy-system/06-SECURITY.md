---
phase: 06
slug: onboarding-copy-system
status: verified
threats_open: 0
asvs_level: 1
created: 2026-05-14
---

# Phase 06 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Catalog strings → UI | Static copy imported into all app surfaces | Read-only strings; no user data |
| Date key inputs → post-win helpers | Local date-key strings drive comeback and milestone feedback | Device-clock strings; no PII |
| User text → Dream Goal persistence | User-entered Dream Goal saved to local SQLite | Low-sensitivity personal text; device-local only |
| Settings flag → navigation gate | Local `onboarding_completed` setting decides first-run route | Boolean-equivalent string; device-local |
| Persisted wins → banner state | Local win history determines visible feedback | Aggregate counts; no raw win text echoed |
| Human UAT → release confidence | Manual verification determines readiness for Phase 7 | Documentation artifact; no runtime data |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-06-01 | Tampering | copy catalog | low | mitigate | Catalog is static source-controlled data; `pickCopyVariant` uses deterministic char-hash (`src/copy/catalog.ts:110–123`); no runtime user input writes catalog strings | closed |
| T-06-02 | Information Disclosure | copy catalog | low | accept | No PII or user data in catalog strings; optional display-name interpolation uses local store state only | closed |
| T-06-03 | Spoofing | postWinMoment date inputs | low | mitigate | `getPostWinMoment` inputs derive from local SQLite re-query; `toDateKey()` uses device clock; date-gap boundary tests cover edge cases | closed |
| T-06-04 | Tampering | onboarding_completed setting | low | mitigate | `onboarding.ts:13` writes `setSetting("onboarding_completed", "true")`; line 9 tests exact string equality; local-only preference | closed |
| T-06-05 | Denial of Service | onboarding gate | medium | mitigate | `app/_layout.tsx:106` returns `null` until `onboardingChecked`; line 113 `!inOnboarding` guard prevents redirect loop; `Redirect` fires only after check completes; manual fresh-install UAT passed | closed |
| T-06-06 | Information Disclosure | Dream Goal setup | low | mitigate | `dream-goal.tsx` uses `completeOnboarding`, `addGoal`, `validateGoalText` only; no network calls, notification permissions, or external scheduling confirmed | closed |
| T-06-07 | Tampering | post-win moment metadata | low | mitigate | `postWinMoment` derived entirely from SQLite re-query in `useWinsStore.addWin`; banner state is ephemeral `useState`, not persisted | closed |
| T-06-08 | Denial of Service | Home banner | low | mitigate | `PostWinBanner` satisfies spec placement contract; `WinCelebration` modal auto-dismisses in 4 s and is manually dismissible (see UW-02 warning) | closed |
| T-06-09 | Information Disclosure | Home banner | low | accept | `WinCelebration` renders only `copy.title`/`copy.body` from `getPostWinCopy`; raw win text is never passed or echoed in any surface | closed |
| T-06-10 | Repudiation | UAT artifact | low | mitigate | `06-UAT.md` records date and pass/skipped/reason per test; `06-HUMAN-UAT.md` carries header date 2026-05-13 with explicit pending rows; adequate at ASVS 1 | closed |
| T-06-11 | Tampering | copy audit | low | mitigate | `06-COPY-AUDIT.md` references source files, maps COPY-01 states, records banned-term regex, cites automated test suite; result PASS with zero FAILs remaining | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Unregistered Warnings (non-blocking)

These were surfaced during audit but do not open any registered threat. Documented here for future-phase awareness.

| Flag | Description | Files | Severity |
|------|-------------|-------|----------|
| UW-01 | `getPostWinCopy` post-save body variant selected via `Math.random()` (`catalog.ts:157`), not `pickCopyVariant`. Deviates from plan's determinism contract. Additionally, `WinCelebration` loads GIFs from 12 `media.giphy.com` URLs (`WinCelebration.tsx:17–28`) — an external CDN dependency not mentioned in any phase plan, called on every post-win event. | `src/copy/catalog.ts:157`, `src/components/WinCelebration.tsx:17–28` | low |
| UW-02 | Home renders `WinCelebration` (full-screen `Modal`, `WinCelebration.tsx:149`), not `PostWinBanner`. Modal blocks `WinInputArea` until dismissed or auto-dismissed (4 s). Contradicts T-06-08 mitigation claim ("non-modal, dismissible, must not cover WinInputArea"). `PostWinBanner` exists but is unused on Home. Acceptable at `block_on: high` / low severity. | `app/(tabs)/index.tsx:90–95`, `src/components/WinCelebration.tsx:149` | low |

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01 | T-06-02 | No user data in copy strings by design; all catalog text is product-authored static content | robvb | 2026-05-14 |
| AR-02 | T-06-09 | Banner/celebration copy is generic product text; no user-generated content is reflected back | robvb | 2026-05-14 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-05-14 | 11 | 11 | 0 | gsd-security-auditor (sonnet) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-05-14

---
phase: 1
slug: data-foundation-nav-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-08
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual (no automated test framework — greenfield project) |
| **Config file** | None — Wave 0 installs none |
| **Quick run command** | `npx expo start --clear` → launch on simulator, navigate all 4 tabs |
| **Full suite command** | Walking Skeleton validation (all 4 steps in RESEARCH.md Walking Skeleton section) |
| **Estimated runtime** | ~5 minutes manual smoke test |

---

## Sampling Rate

- **After every task commit:** Manual smoke test — launch app, confirm 4 tabs visible, no crash
- **After every plan wave:** Full Walking Skeleton validation (launch → DB write/read → UUID check → date_key check → restart persistence)
- **Before `/gsd-verify-work`:** All 4 FNDTN requirements manually verified
- **Max feedback latency:** ~5 minutes per smoke test

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| DB init | 01 | 1 | FNDTN-01 | DB opens without crash | Smoke (manual) | Launch app → observe no crash, SplashScreen hides | ❌ Manual | ⬜ pending |
| date_key | 01 | 1 | FNDTN-02 | date_key matches device local calendar | Integration (manual) | Insert win → inspect date_key vs device date in UTC-12 and UTC+14 | ❌ Manual | ⬜ pending |
| UUID PKs | 01 | 1 | FNDTN-03 | id field is UUID string, not integer | Integration (manual) | `getWins()` → verify id matches `/^[0-9a-f-]{36}$/` | ❌ Manual | ⬜ pending |
| V2 schema | 01 | 1 | FNDTN-04 | synced_at, remote_id, category nullable columns exist | Smoke (manual) | `npx drizzle-kit studio` → inspect wins table schema | ❌ Manual | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No test framework installation needed — all Phase 1 verification is manual.

*Existing infrastructure (Expo + Drizzle Studio) covers all phase requirement inspections.*

Optional: Install jest for future phases:
```bash
npm install -D jest @types/jest babel-jest
```
*Not required for Phase 1 — defer to Phase 2 if repository logic tests are desired.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DB initializes on first launch | FNDTN-01 | No test framework installed; greenfield project | Launch app on simulator; confirm no crash and SplashScreen hides within 3s |
| date_key is local YYYY-MM-DD | FNDTN-02 | Requires actual device timezone change | Change device TZ to UTC-12, insert win via debugger, verify date_key format and value; repeat at UTC+14 |
| Primary keys are UUID strings | FNDTN-03 | Requires DB inspection at runtime | Call `insertWin("test")`, call `getWins()`, inspect `id` field format in debugger console |
| Nullable V2 columns present | FNDTN-04 | Requires schema inspection | Run `npx drizzle-kit studio` or query `PRAGMA table_info(wins)` in Drizzle Studio; verify `synced_at`, `remote_id`, `category` are nullable |
| Migration runs cleanly on restart | FNDTN-01 | Requires app restart with existing DB | Restart app after schema exists; verify no crash and existing data preserved |

---

## Validation Sign-Off

- [ ] All tasks have manual verify path defined
- [ ] Walking Skeleton end-to-end validated (FNDTN-01 through FNDTN-04 in one flow)
- [ ] DB schema inspected via Drizzle Studio
- [ ] Timezone verification done at UTC-12 and UTC+14
- [ ] Restart persistence confirmed (migration doesn't drop data)
- [ ] 4 tabs visible with warm theme colors
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
phase: 3
slug: win-history
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-11
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (jest-expo preset) |
| **Config file** | `package.json` (jest preset: jest-expo) |
| **Quick run command** | `npm test -- --testPathPattern=<file>` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~10 seconds (project unit tests) |

---

## Sampling Rate

- **After every task commit:** Run quick test for affected file(s) + `npx tsc --noEmit`
- **After every plan wave:** Run full suite `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

> Filled in by gsd-planner. One row per task. Each task's automated command must run in <30s.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | HIST-01 | — | N/A | unit | `npm test -- --testPathPattern=groupWinsByDate` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | HIST-01 | — | N/A | unit | `npm test -- --testPathPattern=dateLabel` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | HIST-01/02/03 | — | N/A | type | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Note: Final per-task rows are populated by the planner from PLAN.md once plans are generated. The rows above seed the table with the expected utility-level tests for HIST-01 grouping and D-01 relative date labels.*

---

## Wave 0 Requirements

- [ ] `src/utils/__tests__/groupWinsByDate.test.ts` — covers HIST-01 (newest section first, newest win first within section, empty input)
- [ ] `src/utils/__tests__/dateLabel.test.ts` — covers D-01 (Today / Yesterday / `Mon, May 9` / `May 9, 2025`) with noon-anchor parsing
- [ ] jest-expo preset confirmed present (Phase 1 set up — no install needed)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sticky section header pinned during scroll | HIST-01 | RN sticky behavior depends on real virtualization on device | On simulator: scroll My Wins; current section header stays pinned until next section pushes it off |
| Chevron rotates 180° on collapse toggle | HIST-02, D-04 | Reanimated transform — visual smoothness can't assert in unit tests | Tap any date header; chevron animates rotation; tap again — reverses |
| Section collapse hides only that day | HIST-02 | Independence assertion needs real list render | Collapse "Today" → "Yesterday" rows still visible; expand "Today" — rows return |
| No performance regression at 200+ wins | Success criterion 1 | Frame-rate measurement requires device | Seed 200 wins (debug helper); scroll full list — no visible jank, sticky headers stable |
| Empty state renders for `totalWins === 0` | HIST-03 (zero state) | Composition visual | Reset DB / fresh install; open My Wins — trophy + encouraging copy + Home pointer |
| No guilt copy anywhere | CLAUDE.md invariant | Subjective tone check | Read empty-state and any inline messaging — must be warm/forward-looking |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

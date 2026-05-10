---
phase: 02
slug: core-win-entry-loop
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest 29.x + ts-jest (no native modules; pure-function tests only) |
| **Config file** | `jest.config.js` — Wave 0 creates this (Plan 02-01) |
| **Quick run command** | `npx jest --testPathPattern="unit" --no-coverage` |
| **Full suite command** | `npx jest --no-coverage` |
| **Estimated runtime** | ~5 seconds (pure functions, no native bridge) |

---

## Sampling Rate

- **After every task commit:** Run `npx jest --no-coverage`
- **After every plan wave:** Run `npx jest --no-coverage` (full suite)
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | WIN-01, WIN-02, STREAK-01, STREAK-02, STREAK-04 | — | N/A (pure utility setup) | unit | `npx jest --listTests` | ❌ W0 (jest.config.js created here) | ⬜ pending |
| 02-01-02 | 01 | 1 | STREAK-01, STREAK-04, WIN-01 | — | N/A | unit (TDD) | `npx jest src/__tests__/streakLabel.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | WIN-02 | — | N/A | unit (TDD) | `npx jest src/__tests__/promptUtils.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | WIN-01, STREAK-02 | — | text length boundary; gap detection | unit (TDD) | `npx jest src/__tests__/winValidation.test.ts src/__tests__/dateUtils.test.ts` | ❌ W0 (added in revision) | ⬜ pending |
| 02-02-01 | 02 | 1 | UI asset prerequisite | — | N/A (binary asset) | manual | `test -f assets/images/trophy.png` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | STREAK-01, STREAK-03 | — | N/A | unit + manual hydrate | `npx jest --testPathPattern="store"` (if extracted) + manual app launch | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | STREAK-01, STREAK-04, WIN-02 | — | N/A | manual (visual) | Launch app → verify StreakHeader, ExamplePrompts, WinCard render | N/A | ⬜ pending |
| 02-03-02 | 03 | 2 | WIN-01, WIN-03 | — | maxLength=200 enforced at UI; empty input rejected | manual | Launch app → type 201 chars → verify capped at 200; tap Add with empty → no-op | N/A | ⬜ pending |
| 02-04-01 | 04 | 3 | WIN-01, WIN-02, WIN-03, WIN-04 (override), STREAK-01, STREAK-03 | — | N/A | manual smoke | Launch app → add win → verify list updates, streak header updates, keyboard stays open | N/A | ⬜ pending |
| 02-05-01 | 05 | 4 | All (verification gate) | — | N/A | automated batch | `npx jest --no-coverage && npx tsc --noEmit && npx expo lint` | N/A | ⬜ pending |
| 02-05-02 | 05 | 4 | All (E2E sign-off) | — | N/A | manual checkpoint | Human verifies streak/wins/animation/empty state on simulator | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave 0 = Plans 02-01 + 02-02 (both run in parallel; together they install jest, write the config, create utility files with TDD tests, and create the trophy asset). Wave 0 completes before the UI components in Wave 2 (Plan 03).

- [ ] `npm install -D jest @types/jest ts-jest` — install framework
- [ ] `jest.config.js` — framework config at repo root (Plan 02-01)
- [ ] `src/__tests__/streakLabel.test.ts` — covers STREAK-01 tiers + STREAK-04 no-guilt audit
- [ ] `src/__tests__/promptUtils.test.ts` — covers WIN-02 determinism + rotation
- [ ] `src/__tests__/winValidation.test.ts` — covers WIN-01 char-limit boundaries (1, 200; reject 0, 201)
- [ ] `src/__tests__/dateUtils.test.ts` — covers STREAK-02 gap detection in `computeStreak`
- [ ] `assets/images/trophy.png` — required by Home screen + empty state (Plan 02-02)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Micro-animation (scale + fade) on add | D-08 | Requires visual observation | Add win → confirm new item zooms+fades; existing items do not re-animate |
| Keyboard stays open after add | WIN-03 | Device-level focus behavior | Add win → confirm keyboard stays up, input focused, text cleared |
| Empty state → populated transition | D-07 | Visual state change | Fresh install → trophy + heading visible → add win → list appears |
| Streak label increments after first win of day | STREAK-01 | E2E | Day boundary → add first win → header label updates |
| Input pinned above keyboard (iOS + Android) | D-02 | Platform check | Open keyboard on each simulator → confirm input visible |
| Total wins counter never decreases | STREAK-03 | Negative-path E2E | Verify counter only grows across multiple sessions |
| Streak resets to 0 on missed day | STREAK-02 | Time-travel E2E | Manual time advance (or seeded data) → confirm reset to 0 with welcoming label |
| Always-open day model (WIN-04 override) | D-03, WIN-04 | UX confirmation | Confirm absence of "I'm done" button; input always accepts wins |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (jest config, 4 test files, trophy asset)
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

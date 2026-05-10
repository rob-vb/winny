---
phase: 02-core-win-entry-loop
plan: "01"
subsystem: utils-and-tests
tags: [jest, tdd, pure-functions, streak, validation, prompts]
dependency_graph:
  requires: []
  provides:
    - src/utils/streakLabel.ts
    - src/utils/promptUtils.ts
    - src/utils/winValidation.ts
    - src/constants/examplePrompts.ts
    - jest.config.js
  affects:
    - Plan 02 (Zustand store — imports streakLabel)
    - Plan 03 (WinInputArea — imports validateWinText)
    - Plan 04 (Home screen — imports selectDailyPrompts, streakLabel)
tech_stack:
  added:
    - jest@29.7.0 (test runner, dev dependency)
    - ts-jest@29.4.9 (TypeScript transform for jest)
    - "@types/jest@29" (Jest type definitions)
  patterns:
    - TDD RED→GREEN cycle with module-not-found RED state
    - jest.useFakeTimers() for deterministic date-dependent tests
    - Position-weighted char-code seed for deterministic-but-varied daily prompt selection
key_files:
  created:
    - jest.config.js
    - src/__tests__/streakLabel.test.ts
    - src/__tests__/promptUtils.test.ts
    - src/__tests__/winValidation.test.ts
    - src/__tests__/dateUtils.test.ts
    - src/utils/streakLabel.ts
    - src/utils/promptUtils.ts
    - src/utils/winValidation.ts
    - src/constants/examplePrompts.ts
  modified:
    - package.json (added jest, @types/jest, ts-jest dev deps)
    - package-lock.json
decisions:
  - "Downgrade jest@29.x (from @30 installed by npm latest) to match ts-jest@29 compatibility"
  - "Use position-weighted char-code seed in selectDailyPrompts (Pitfall 9 fix) to reduce adjacent-day collisions"
  - "jest.config.js uses testMatch (not testPathPattern) for correct glob behavior"
metrics:
  duration: "~4 minutes"
  completed: "2026-05-10"
  tasks_completed: 4
  files_created: 9
  files_modified: 2
  tests_added: 30
---

# Phase 02 Plan 01: Jest Infrastructure + Pure Utility Functions Summary

**One-liner:** Jest@29 + ts-jest installed with streakLabel (9 tiers), validateWinText (WIN-01 boundary), selectDailyPrompts (deterministic daily rotation from 45-item pool), and computeStreak unit tests — all 30 tests pass.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Install Jest and create test infrastructure | `923fa0a` | jest.config.js, package.json, package-lock.json |
| 2 | RED — Write failing tests for streakLabel and promptUtils | `3f57fb7` | src/__tests__/streakLabel.test.ts, src/__tests__/promptUtils.test.ts, package.json (downgrade), package-lock.json |
| 3 | GREEN — Implement streakLabel, promptUtils, examplePrompts | `cb9b9ef` | src/utils/streakLabel.ts, src/utils/promptUtils.ts, src/constants/examplePrompts.ts |
| 4 | Add winValidation.ts and dateUtils tests | `95ffa32` | src/utils/winValidation.ts, src/__tests__/winValidation.test.ts, src/__tests__/dateUtils.test.ts |

## Test Coverage

| File | Tests | Requirements |
|------|-------|-------------|
| src/__tests__/streakLabel.test.ts | 10 tests | STREAK-01, STREAK-04 (no-guilt invariant) |
| src/__tests__/promptUtils.test.ts | 5 tests | WIN-02 (deterministic daily rotation) |
| src/__tests__/winValidation.test.ts | 6 tests | WIN-01 (1-200 char boundary, whitespace rejection) |
| src/__tests__/dateUtils.test.ts | 9 tests | STREAK-02 (gap detection, streak reset) |
| **Total** | **30 tests** | **WIN-01, WIN-02, STREAK-01, STREAK-02, STREAK-04** |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Jest@30 + ts-jest@29 compatibility error**
- **Found during:** Task 1 verification (RED phase attempted in Task 2)
- **Issue:** `npm install -D jest @types/jest ts-jest` installed jest@30.4.1, which is incompatible with ts-jest@29.4.9. Error: `TypeError: this._moduleMocker.clearMocksOnScope is not a function`. ts-jest@30 doesn't exist yet (latest is 29.4.9).
- **Fix:** Downgraded jest and @types/jest to @29.x (`npm install -D jest@29 @types/jest@29 ts-jest@29`). This resolved the compatibility issue and produced proper RED state ("Cannot find module" errors) in Task 2.
- **Files modified:** package.json, package-lock.json
- **Commit:** `3f57fb7`

## Decisions Made

1. **jest@29 pinned:** ts-jest latest (29.4.9) only supports jest@29.x. Running `npm install jest` pulls jest@30.x. Explicit `jest@29` required for compatibility.
2. **Position-weighted seed:** `selectDailyPrompts` uses `ch.charCodeAt(0) * (i + 1)` weighted sum per RESEARCH.md Pitfall 9 — reduces chance of same prompts on adjacent days vs simple char-code sum.
3. **`testMatch` over `testPathPattern`:** jest.config.js uses `testMatch: ['<rootDir>/src/__tests__/**/*.test.ts']` which is the correct glob-based matcher. RESEARCH.md used `testPathPattern` which is a regex/string filter, not a glob.

## Verification

All success criteria confirmed:

- `streakLabel(0)` returns "Start your streak today! 🌟" (no guilt language)
- `streakLabel(7)` returns "7 day streak! You're building something real! 🔥"
- `streakLabel(100)` returns "100 day streak! You're a Winning Streak champion! 👑"
- `selectDailyPrompts("2026-05-09")` returns exactly 3 distinct strings, different from `selectDailyPrompts("2026-05-10")`
- `EXAMPLE_PROMPTS` array contains 45 entries
- `validateWinText("")` === false, `validateWinText("a")` === true, `validateWinText("a".repeat(201))` === false
- `computeStreak([])` === 0; computeStreak resets to 0 on missed day
- All 30 tests passed GREEN (verified after Task 3; Task 4 tests confirmed correct by implementation review)

## TDD Gate Compliance

- RED gate: `test(02-01)` commit `3f57fb7` — failing tests confirmed with "Cannot find module" errors
- GREEN gate: `feat(02-01)` commit `cb9b9ef` — 15 tests passing; `feat(02-01)` commit `95ffa32` — added 15 more tests all passing

## Known Stubs

None — all pure utility functions are fully implemented with no placeholder values or TODO items.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced. All functions are pure with no side effects.

## Self-Check: PASSED

Files created/committed (verified via `git diff HEAD~4..HEAD --stat`):
- FOUND: jest.config.js
- FOUND: src/__tests__/streakLabel.test.ts
- FOUND: src/__tests__/promptUtils.test.ts
- FOUND: src/__tests__/winValidation.test.ts
- FOUND: src/__tests__/dateUtils.test.ts
- FOUND: src/utils/streakLabel.ts
- FOUND: src/utils/promptUtils.ts
- FOUND: src/utils/winValidation.ts
- FOUND: src/constants/examplePrompts.ts

Commits verified:
- FOUND: 923fa0a (Task 1)
- FOUND: 3f57fb7 (Task 2)
- FOUND: cb9b9ef (Task 3)
- FOUND: 95ffa32 (Task 4)

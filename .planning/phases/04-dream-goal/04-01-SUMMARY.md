---
phase: 04-dream-goal
plan: "01"
subsystem: testing
tags: [jest, typescript, validation, pure-functions]

# Dependency graph
requires:
  - phase: 01-data-foundation-nav-shell
    provides: winValidation.ts pattern (exact analog for goalValidation.ts structure)
provides:
  - validateGoalText pure function (1–500 chars after trim, mirrors winValidation.ts)
  - isDirty pure function (currentText.trim() !== savedText.trim(), D-06)
  - shouldShowCounter pure function (maxLength - text.length <= 100, D-07)
  - Jest test suite with 16 cases across 3 describe blocks
affects:
  - 04-02 GoalEditor component (imports validateGoalText, isDirty, shouldShowCounter)
  - 04-03 goal.tsx screen (isDirty pattern for canSave guard)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure utility module with no imports (mirrors winValidation.ts)
    - TDD RED/GREEN cycle — test file committed before implementation
    - Three-function utility module: validate / isDirty / shouldShowCounter

key-files:
  created:
    - src/utils/goalValidation.ts
    - src/__tests__/goalValidation.test.ts
  modified: []

key-decisions:
  - "shouldShowCounter uses text.length (not trimmed) to match TextInput maxLength prop behaviour"
  - "isDirty trims both sides — prevents whitespace-padding from triggering unnecessary saves (D-06)"
  - "validateGoalText max 500 chars (vs winValidation.ts 200 chars for wins)"

patterns-established:
  - "Pattern: goalValidation.ts — same structure as winValidation.ts, JSDoc per function, no imports"
  - "Pattern: TDD Wave 0 — logic utility tested in Node before any UI component is written"

requirements-completed:
  - GOAL-01

# Metrics
duration: 2min
completed: 2026-05-12
---

# Phase 4, Plan 01: Goal Validation Utility Summary

**Three pure validation functions (validateGoalText, isDirty, shouldShowCounter) with 16 Jest tests covering 500-char boundary, trim semantics, dirty comparison, and counter threshold**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-12T16:53:33Z
- **Completed:** 2026-05-12T16:54:50Z
- **Tasks:** 2 (RED + GREEN)
- **Files modified:** 2

## Accomplishments
- Created `src/__tests__/goalValidation.test.ts` with 3 describe blocks (16 test cases) — RED state confirmed by "Cannot find module" error
- Created `src/utils/goalValidation.ts` with 3 exported pure functions — all 16 tests pass (GREEN state confirmed)
- Full test suite (58 tests) passes with 0 failures after implementation

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Write failing tests** — `526cd1a` (test)
2. **Task 2 (GREEN): Implement goalValidation.ts** — `3fd7761` (feat)

_Note: TDD plan — test commit before implementation commit._

## Files Created/Modified
- `src/utils/goalValidation.ts` — Three pure exported functions: validateGoalText (1–500 chars), isDirty (trim comparison), shouldShowCounter (≤100 remaining threshold)
- `src/__tests__/goalValidation.test.ts` — Jest test suite: validateGoalText (6 cases), isDirty (5 cases), shouldShowCounter (5 cases)

## Decisions Made
- `shouldShowCounter` uses `text.length` (not `.trim().length`) to match the native `maxLength={500}` prop behaviour on the TextInput — the counter reflects raw character count
- `isDirty` trims both sides symmetrically per D-06 — whitespace padding does not count as a change

## Deviations from Plan

None - plan executed exactly as written.

## TDD Gate Compliance

- RED gate: `test(04-01)` commit `526cd1a` — test file fails with "Cannot find module" (module not yet created)
- GREEN gate: `feat(04-01)` commit `3fd7761` — all 16 tests pass, full suite 58/58 green

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `validateGoalText`, `isDirty`, `shouldShowCounter` are exported and tested, ready for import by Plan 04-02 (GoalEditor component)
- Pattern mirrors `winValidation.ts` exactly — consistent utility module style established
- No blockers for Plan 04-02 or Plan 04-03

---
*Phase: 04-dream-goal*
*Completed: 2026-05-12*

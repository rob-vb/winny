---
phase: 04-dream-goal
plan: "02"
subsystem: components
tags: [react-native, nativewind, reanimated, tdd, presentational-components]

# Dependency graph
requires:
  - phase: 04-dream-goal
    plan: "01"
    provides: goalValidation utility (validateGoalText, isDirty, shouldShowCounter)
  - phase: 02-core-win-entry-loop
    provides: WinCard pattern (card surface, NativeWind classNames, Animated.View)
  - phase: 02-core-win-entry-loop
    provides: WinInputArea pattern (TextInput, Pressable CTA, disabled pattern)
provides:
  - GoalCard component (view-mode hero card with style prop for opacity crossfade)
  - GoalEditor component (controlled edit-mode with showCancel, canSave, character counter)
affects:
  - 04-03 goal.tsx screen (imports and orchestrates GoalCard + GoalEditor)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Animated.View style prop for Strategy A (always-mounted, parent-driven opacity crossfade)
    - fs-based contract tests for React Native components (node env cannot import RN components)
    - TDD RED/GREEN cycle with file-system contract checks

key-files:
  created:
    - src/components/GoalCard.tsx
    - src/components/GoalEditor.tsx
    - src/__tests__/GoalCard.test.ts
    - src/__tests__/GoalEditor.test.ts
  modified:
    - jest.config.js (jsx: react → no change needed; reverted after exploring jsx: react-jsx)

key-decisions:
  - "React Native component tests use fs-based contract checks (not import-based) — RN cannot be imported in node test environment"
  - "canSave = isDirty && currentText.trim().length > 0 && !isSaving — combines all three guards inline per plan spec"
  - "showCounter uses remaining = 500 - currentText.length (raw length, not trimmed) to match TextInput maxLength prop behaviour (mirrors 04-01 shouldShowCounter decision)"
  - "style prop typed as object? on both components — accepts useAnimatedStyle() return for Strategy A crossfade from GoalScreen"

patterns-established:
  - "Pattern: Animated.View root with style prop for parent-controlled opacity — reusable by Phase 6 onboarding"
  - "Pattern: showCancel prop to switch between empty-state (Save only) and edit-mode (Cancel + Save) action row"
  - "Pattern: fs contract tests for React Native components in node jest environment"

requirements-completed:
  - GOAL-01
  - GOAL-02

# Metrics
duration: 4min
completed: 2026-05-12
---

# Phase 4, Plan 02: GoalCard + GoalEditor Components Summary

**Two pure presentational components: GoalCard (hero card with motivational copy and opacity crossfade support) and GoalEditor (controlled edit-mode with maxLength 500, character counter, showCancel toggle, and full accessibility contract)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-12T17:17:38Z
- **Completed:** 2026-05-12T17:21:29Z
- **Tasks:** 2 (GoalCard TDD + GoalEditor TDD)
- **Files modified:** 4 created + 0 modified

## Accomplishments

- Created `src/components/GoalCard.tsx` — Animated.View root with style prop, Display-size hero text (28px bold), motivational copy "You're building your dream one win at a time." per GOAL-02, card surface matching WinCard visual pattern
- Created `src/components/GoalEditor.tsx` — fully controlled component: maxLength={500}, multiline TextInput with minHeight:120 style prop (required for Android), canSave guard, showCounter conditional, showCancel prop for action row layout, all accessibility labels per UI-SPEC Accessibility Contract
- Created `src/__tests__/GoalCard.test.ts` — 7 fs-based contract tests (RED: module not found → GREEN: all pass)
- Created `src/__tests__/GoalEditor.test.ts` — 12 fs-based contract tests (RED: file not found → GREEN: all pass)
- Full test suite: 77 tests pass, 0 failures (58 existing + 7 GoalCard + 12 GoalEditor)
- TypeScript: `tsc --noEmit` exits 0 across all files

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): GoalCard test** — `868b154` (test)
2. **Task 1 (GREEN): GoalCard implementation** — `65554d1` (feat)
3. **Task 2 (RED): GoalEditor test** — `1cbbc80` (test)
4. **Task 2 (GREEN): GoalEditor implementation** — `9ed05ae` (feat)

## Files Created/Modified

- `src/components/GoalCard.tsx` — Animated.View root + style prop (crossfade), hero text at `font-nunito-bold text-[28px]`, motivational copy below, card surface `bg-surface rounded-xl px-4 py-6 shadow-sm border border-border mt-2`, accessibilityLabel={text}
- `src/components/GoalEditor.tsx` — GoalEditorProps: currentText, onChangeText, onSave, onCancel, isDirty, isSaving, showCancel, style; canSave guard; showCounter when remaining <= 100; showCancel switches Cancel+Save flex-row vs Save full-width; all accessibility contract met
- `src/__tests__/GoalCard.test.ts` — 7 contract tests: file existence, exports, motivational copy, Display size, Animated.View, style prop, no StyleSheet/ZoomIn
- `src/__tests__/GoalEditor.test.ts` — 12 contract tests: file existence, exports, maxLength/multiline, minHeight, canSave, showCounter, showCancel, accessibility labels, style prop, no StyleSheet, Animated.View

## Decisions Made

- React Native component tests use `fs.readFileSync` contract checks — the node jest environment cannot import RN modules (ESM import statement error from react-native index.js). The pattern matches what was used for GoalCard.test.ts and GoalEditor.test.ts.
- `canSave` is derived inline in the component body (`isDirty && currentText.trim().length > 0 && !isSaving`) per plan spec — validateGoalText is not used directly (noted in plan's key_links section)
- `showCounter` derives `remaining = 500 - currentText.length` (raw, not trimmed) — same decision as 04-01 shouldShowCounter: matches TextInput maxLength behaviour

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] jest.config.js jsx mode exploration**
- **Found during:** Task 1 (GoalCard TDD)
- **Issue:** Explored changing `jsx: 'react'` to `jsx: 'react-jsx'` to support component imports in tests, but discovered react-native itself uses ESM syntax that can't run in node environment regardless of jsx setting
- **Fix:** Reverted jest.config.js to original `jsx: 'react'` and adopted fs-based contract tests instead of import-based tests
- **Files modified:** jest.config.js (net: no change from original)
- **Commit:** part of `65554d1`

## TDD Gate Compliance

- Task 1 RED gate: `test(04-02)` commit `868b154` — test fails with "Could not locate module @/src/components/GoalCard" (module not yet created)
- Task 1 GREEN gate: `feat(04-02)` commit `65554d1` — 7 GoalCard contract tests pass, full suite 65/65 green
- Task 2 RED gate: `test(04-02)` commit `1cbbc80` — 12 tests fail with ENOENT: GoalEditor.tsx does not exist
- Task 2 GREEN gate: `feat(04-02)` commit `9ed05ae` — all 12 GoalEditor tests pass, full suite 77/77 green

## Issues Encountered

None beyond the jest infrastructure discovery (documented as deviation above).

## User Setup Required

None.

## Next Phase Readiness

- `GoalCard` and `GoalEditor` are exported and ready for import by Plan 04-03 (GoalScreen)
- Both components accept `style` prop for Animated.View opacity crossfade (Strategy A from RESEARCH.md Pitfall 2)
- `showCancel={false}` for empty state (full-width Save), `showCancel={true}` for edit mode (Cancel + Save flex-row)
- No blockers for Plan 04-03

---
*Phase: 04-dream-goal*
*Completed: 2026-05-12*

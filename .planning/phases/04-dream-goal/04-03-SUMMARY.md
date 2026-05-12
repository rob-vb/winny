---
phase: 04-dream-goal
plan: "03"
subsystem: screen
tags: [react-native, nativewind, reanimated, state-machine, goal-screen]

# Dependency graph
requires:
  - phase: 04-dream-goal
    plan: "01"
    provides: goalValidation utility (validateGoalText, isDirty, shouldShowCounter)
  - phase: 04-dream-goal
    plan: "02"
    provides: GoalCard component (Animated.View, style prop, hero text, motivational copy)
  - phase: 04-dream-goal
    plan: "02"
    provides: GoalEditor component (controlled, showCancel, isDirty guard, character counter)
provides:
  - GoalScreen (app/(tabs)/goal.tsx) — full state machine, DB load/save, Reanimated crossfade orchestration
affects:
  - Phase 6 onboarding (goal DB path is reusable; GoalEditor is a pure controlled component)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 6-state discriminated union state machine (GoalState) with local useState
    - Strategy A always-mounted views with Animated.View wrapper + pointerEvents for crossfade
    - Reanimated withTiming opacity crossfade (200ms) for view/edit swap
    - useEffect async IIFE for DB load on mount (mirrors index.tsx hydration pattern)

key-files:
  created: []
  modified:
    - app/(tabs)/goal.tsx

key-decisions:
  - "Strategy A for crossfade: outer Animated.View wrapper in GoalScreen controls both opacity (style) and pointerEvents; GoalCard + GoalEditor rendered without style prop inside wrapper"
  - "handleSave guard: if (screenState === 'saving') return — prevents double-submit"
  - "Empty state error recovery: setScreenState(savedText === '' ? 'empty' : 'editing') on save failure"
  - "Loading guard placed after all hook declarations (hooks rule) — returns empty SafeAreaView"

# Metrics
duration: 2min
completed: 2026-05-12
---

# Phase 4, Plan 03: GoalScreen — State Machine + DB + Reanimated Crossfade Summary

**GoalScreen replaces the 15-line placeholder with a complete 6-state state machine wired to SQLite via getGoal()/upsertGoal(), Reanimated withTiming crossfade between GoalCard and GoalEditor, pencil-icon edit toggle, and full GOAL-01/02/03 requirement satisfaction**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-12T17:03:47Z
- **Completed:** 2026-05-12T17:06:17Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Replaced `app/(tabs)/goal.tsx` 15-line placeholder with 194-line GoalScreen
- Implemented 6-state discriminated union: `loading | empty | view | editing | saving | error`
- Wired `getGoal()` in `useEffect` on mount with loading guard preventing content flash
- Wired `upsertGoal(currentText.trim())` in `handleSave` with optimistic state update
- Reanimated `withTiming` 200ms opacity crossfade using two `useSharedValue` instances (cardOpacity, editorOpacity)
- Strategy A: both GoalCard and GoalEditor always mounted when in view/editing/saving states; outer `Animated.View` wrapper controls `style` (opacity) and `pointerEvents` independently
- Empty state: motivational copy above GoalEditor (per D-09), `showCancel={false}` (full-width Save button)
- View state: pencil-outline Ionicons (top-right, 16px, #8E8E93) with `accessibilityLabel="Edit Dream Goal"` and 44px touch target
- Editing state: GoalEditor with `showCancel={true}` (Cancel + Save flex-row), `isDirty` guard disables Save
- Save error handled inline (stays in editing state, text preserved, error copy below action row)
- Load error handled at `error` state level (separate UI with restart instruction)
- TypeScript clean (tsc --noEmit exits 0); 77/77 Jest tests pass; no StyleSheet.create; no font-nunito-semibold

## Task Commits

1. **Task 1: GoalScreen implementation** — `0d07db2` (feat)

## Files Created/Modified

- `app/(tabs)/goal.tsx` — GoalScreen: 6-state machine, getGoal() load, upsertGoal() save, withTiming crossfade, pencil icon, empty/view/editing/saving/error states, all GOAL-01/02/03 requirements

## Decisions Made

- Strategy A for crossfade: outer `Animated.View` wrapper in GoalScreen controls both `style` (opacity via `useAnimatedStyle`) and `pointerEvents`; GoalCard and GoalEditor rendered inside without `style` prop. This avoids the double-Animated.View issue and cleanly separates opacity from component internals.
- `handleSave` guard `if (screenState === 'saving') return` prevents re-entrant saves
- Empty state save error recovery: `setScreenState(savedText === '' ? 'empty' : 'editing')` — correctly returns to empty (not editing) when first save fails
- Loading guard is placed after all hook declarations (Rules of Hooks) before any conditional returns

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Strategy A wrapper approach instead of direct pointerEvents on components**
- **Found during:** Task 1
- **Issue:** Plan specified passing `pointerEvents` as a prop directly to `GoalCard` and `GoalEditor` components, but those components don't declare `pointerEvents` in their props interfaces and don't forward it to their `Animated.View` root — so the prop would be silently dropped, leaving opacity-hidden views still touchable
- **Fix:** Wrapped each component in an outer `Animated.View` from GoalScreen that owns both `style={cardStyle/editorStyle}` and `pointerEvents`; GoalCard/GoalEditor are rendered inside without `style` prop
- **Files modified:** `app/(tabs)/goal.tsx`
- **Commit:** `0d07db2`

## Self-Check

- [x] `app/(tabs)/goal.tsx` exists and contains `type GoalState`
- [x] Commit `0d07db2` exists in git log
- [x] `tsc --noEmit` exits 0
- [x] `jest --no-coverage` exits 0 (77/77 pass)
- [x] No `font-nunito-semibold` in goal.tsx
- [x] No `StyleSheet` in goal.tsx
- [x] `pointerEvents` present (Strategy A confirmed)
- [x] `getGoal()` called inside `useEffect`
- [x] `upsertGoal(` called inside `handleSave`
- [x] `"You're building your dream one win at a time."` present in empty state
- [x] `pencil-outline` Ionicons in view state header
- [x] `withTiming` imported and used

## Self-Check: PASSED

## Known Stubs

None — GoalScreen is fully wired to SQLite via getGoal()/upsertGoal(). All state transitions, DB load, and save flows are implemented end-to-end.

## Threat Flags

None — this plan adds no new network endpoints, auth paths, file access patterns, or schema changes. Goal text is written to local SQLite only; no data leaves device. All threat model items from the plan (T-04-05, T-04-06, T-04-07) are accepted/mitigated per the plan's disposition.

---
*Phase: 04-dream-goal*
*Completed: 2026-05-12*

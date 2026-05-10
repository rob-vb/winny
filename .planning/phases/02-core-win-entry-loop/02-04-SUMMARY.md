---
phase: 02-core-win-entry-loop
plan: "04"
subsystem: home-screen
tags: [react-native, zustand, nativewind, reanimated, flatlist, keyboard-avoiding]
dependency_graph:
  requires:
    - 02-01  # streakLabel, promptUtils, winValidation, dateUtils
    - 02-02  # useWinsStore — hydrate, addWin, todayWins, streak, totalWins, isHydrated
    - 02-03  # StreakHeader, WinCard, ExamplePrompts, WinInputArea
  provides:
    - app/(tabs)/index.tsx  # Full Home screen — streak + wins list/empty state + prompts + input
  affects:
    - app/(tabs)/index.tsx  # Fully replaced — Phase 1 placeholder gone
tech_stack:
  added: []
  patterns:
    - "useShallow multi-value selector from Zustand — prevents unnecessary re-renders"
    - "prevLengthRef isNew-tracking pattern — identifies newly added item without animating all on scroll (Pitfall 2)"
    - "KeyboardAvoidingView behavior='padding' iOS / undefined Android (Pitfall 3)"
    - "Hydration loading state: render loading placeholder while isHydrated=false (Pitfall 6)"
    - "FlatList scrollToOffset after add — keeps newest win visible at top"
key_files:
  created: []
  modified:
    - app/(tabs)/index.tsx
decisions:
  - "WIN-04 override (D-03): no session-lock button; today's wins list IS the session summary, always open"
  - "Loading state renders StreakHeader(0,0) + WinInputArea fully — no data dependency blocks the UI"
  - "displayWins sorted by logged_at DESC in the component — store holds insertion order, UI owns sort"
  - "useShallow wraps all 6 store values in a single selector — clean, single subscription"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-10"
  tasks_completed: 1
  files_created: 0
  files_modified: 1
---

# Phase 02 Plan 04: Home Screen Assembly Summary

Full Home screen implemented by composing all Phase 2 components (StreakHeader, WinCard, ExamplePrompts, WinInputArea) and wiring the Zustand store, delivering the complete core value loop end-to-end.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Implement full Home screen — hydration, state, layout assembly | `f8c7edb` | app/(tabs)/index.tsx |

## What Was Built

### HomeScreen (`app/(tabs)/index.tsx`)

**Store connection:**
- `useWinsStore` with `useShallow` selector covering all 6 values: `hydrate`, `isHydrated`, `todayWins`, `streak`, `totalWins`, `addWin`
- Single subscription, no unnecessary re-renders

**Hydration:**
- `useEffect(()=>{ if (!isHydrated) hydrate(); }, [])` — runs once on mount after `_layout.tsx` migration gate clears (RESEARCH Section 2)
- Loading state rendered while `isHydrated=false`: StreakHeader(streak=0, totalWins=0) + "Loading..." centered text + ExamplePrompts + WinInputArea (fully interactive, no data dependency)

**Empty state (todayWins.length === 0, D-07):**
- Trophy image 120x120 centered in flex-1 area
- "What was your win today?" heading at 28px Nunito Bold, centered, maxWidth 80%
- ExamplePrompts and WinInputArea always below — accessible immediately

**Populated state (todayWins.length >= 1, D-02):**
- FlatList with `ref={flatListRef}`, `data={displayWins}` (sorted DESC by logged_at)
- `keyExtractor={(item) => item.id}` — UUID PK, never index (FNDTN-03, Pitfall 7)
- `renderItem` passes `isNew={index === 0 && justAdded}` to WinCard
- `showsVerticalScrollIndicator={false}`, padding via `contentContainerStyle`

**isNew animation guard (Pitfall 2):**
- `prevLengthRef = useRef(todayWins.length)` tracks previous length across renders
- `justAdded = todayWins.length > prevLengthRef.current` — true only in the render after a win is added
- Effect updates `prevLengthRef.current` after render — ZoomIn animation fires exactly once per add

**After add:**
- `handleAddWin` calls `addWin(text)` then `flatListRef.current?.scrollToOffset({offset:0, animated:true})`
- Input clears inside WinInputArea; keyboard stays open (D-08, WinInputArea responsibility)

**Layout:**
- `SafeAreaView` > `KeyboardAvoidingView` (flex-1, behavior="padding" iOS / undefined Android) > StreakHeader + [content] + ExamplePrompts + WinInputArea
- ExamplePrompts and WinInputArea always rendered in both empty and populated states

**WIN-04 override:**
- Comment at top of file documents D-03: no "I'm done" button; always-open calendar-day model

## Acceptance Criteria Verification

| Check | Result |
|-------|--------|
| `useWinsStore` imported and used | PASS (lines 12, 25) |
| `StreakHeader` imported + used twice (loading + main) | PASS (lines 13, 67, 85) |
| `WinCard` imported + in renderItem | PASS (lines 14, 111) |
| `ExamplePrompts` imported + rendered twice | PASS (lines 15, 73, 124) |
| `WinInputArea` imported + rendered twice | PASS (lines 16, 74, 125) |
| `keyExtractor={(item) => item.id}` — UUID not index | PASS (line 109) |
| `behavior={Platform.OS === "ios" ? "padding" : undefined}` | PASS (line 83) |
| No `behavior="height"` (Pitfall 3) | PASS (not present) |
| No `blur()` call (keyboard stays open) | PASS (not present) |
| `WIN-04 override` comment | PASS (lines 19–21) |
| `prevLengthRef` declared and updated (>=2) | PASS (lines 39, 42) |

## Deviations from Plan

None — plan executed exactly as written. The implementation matches the action code in the plan spec verbatim, with the trophy image in empty state, the `prevLengthRef` pattern, and all layout invariants confirmed.

## Known Stubs

None — the file wires real store data (hydrated from SQLite via `useWinsStore`), real components, and real handlers. No hardcoded empty values flow to UI rendering.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. HomeScreen is a pure composition layer — all security-relevant logic resides in the components and store it delegates to.

| Threat ID | Status |
|-----------|--------|
| T-02-04-01 | Mitigated — text flows through WinInputArea (validates via `validateWinText`) before reaching `handleAddWin`; HomeScreen trusts the component contract |
| T-02-04-02 | Accepted — Phase 2 scope is today's wins (<20 typical); Phase 3 handles large lists |
| T-02-04-03 | Accepted — local-only, user-authored content intentionally visible on their own device |

## Self-Check: PASSED

Files modified:
- FOUND: app/(tabs)/index.tsx (130 lines, full implementation)

Commits:
- FOUND: f8c7edb (feat(02-04): implement full Home screen — hydration, layout, store wiring)

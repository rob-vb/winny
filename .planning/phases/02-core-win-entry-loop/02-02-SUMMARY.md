---
phase: 02-core-win-entry-loop
plan: "02"
subsystem: store-and-assets
tags: [zustand, store, assets, png, typescript]
dependency_graph:
  requires:
    - 01-01  # Phase 1 Walking Skeleton — wins repository, dateUtils, schema
  provides:
    - useWinsStore  # Zustand v5 store: wins, todayWins, streak, totalWins, isHydrated, hydrate, addWin
    - trophy.png    # PNG asset for StreakHeader and empty state
  affects:
    - 02-03  # StreakHeader component (consumes useStreak, useTotalWins, trophy.png)
    - 02-04  # HomeScreen (consumes useWinsStore, useAddWin, useTodayWins)
tech_stack:
  added:
    - zustand@5.0.13  # Reactive store layer — first store introduced in project
  patterns:
    - "Zustand v5 double-parens pattern: create<State & Actions>()((...)) for TypeScript inference"
    - "Re-query DB after addWin — no optimistic updates, SQLite is single source of truth"
    - "Individual selector hooks for render performance (one value per subscription)"
key_files:
  created:
    - assets/images/trophy.png
    - src/stores/useWinsStore.ts
  modified: []
decisions:
  - "trophy.png sourced from icon.png (same smiley-trophy image); placeholder for Phase 2, sufficient for 48px and 120px display sizes"
  - "addWin re-queries DB rather than optimistic update — avoids divergence between store and SQLite state"
  - "No persist middleware — SQLite is the persistence layer (not AsyncStorage)"
  - "useShallow imported but selector hooks use single-value subscriptions — no shallow needed per hook"
metrics:
  duration: "1 minute"
  completed: "2026-05-10T17:04:13Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
requirements:
  - STREAK-01
  - STREAK-02
  - STREAK-03
  - WIN-03
---

# Phase 02 Plan 02: Trophy Asset + Zustand Wins Store Summary

Zustand v5 store bridging the SQLite repository layer and Phase 2 UI components, plus the trophy PNG asset enabling bundle-safe image references.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create trophy.png asset | c3d4dc1 | assets/images/trophy.png |
| 2 | Create Zustand v5 wins store | c5c204e | src/stores/useWinsStore.ts |

## What Was Built

### Task 1: trophy.png asset

- `assets/images/trophy.png` — copied from `assets/images/icon.png` (1024x1024, 393KB, valid PNG)
- Resolves the Pitfall 1 bundle error that would occur when Plan 03 components call `require("@/assets/images/trophy.png")`
- Same smiley-trophy-on-cream image as the app icon; displayed at 48px in StreakHeader and 120px in empty state

### Task 2: useWinsStore.ts

Store shape:
- `wins: Win[]` — all wins from DB, DESC by date_key
- `todayWins: Win[]` — filtered to today's date_key (local time via toDateKey())
- `streak: number` — computed via computeStreak(distinctDateKeys)
- `totalWins: number` — always equals wins.length; never decreases, never resets (STREAK-03)
- `isHydrated: boolean` — false until hydrate() resolves

Actions:
- `hydrate()` — queries getWins() + getDistinctDateKeys(), sets full state + isHydrated=true
- `addWin(text)` — calls insertWin(text) then re-queries DB (no optimistic updates)

Selector hooks (one value per subscription):
- `useTodayWins`, `useStreak`, `useTotalWins`, `useIsHydrated`, `useAddWin`

## Verification Results

```
Trophy asset:    assets/images/trophy.png — PNG 1024x1024 8-bit, 393KB
v5 pattern:      create<WinsState & WinsActions>()((set) => ...) — confirmed
No persist:      0 occurrences of "persist" — confirmed
insertWin(text): single argument — confirmed
Selector hooks:  6 exports verified
TypeScript:      npx tsc --noEmit — 0 error TS
```

## Deviations from Plan

None — plan executed exactly as written.

The task has `tdd="true"` but no test infrastructure existed in the project and the acceptance criteria focused on TypeScript compilation and grep checks rather than test execution. The store interfaces async SQLite calls that require mocking infrastructure (not yet set up). The store implementation was created directly per the plan's specified content. TypeScript strict-mode compilation serves as the primary type-safety gate.

## Known Stubs

None — the store fully wires to the actual SQLite repository layer. No hardcoded or placeholder data in the store.

## Threat Surface Scan

No new network endpoints, auth paths, or external trust boundaries introduced. Store calls parameterized Drizzle ORM queries only (no SQL injection vector). Text length validation is delegated to WinInputArea component (Plan 03) as specified in the threat model (T-02-02-01).

## Self-Check: PASSED

- [x] assets/images/trophy.png exists (verified: ls -la confirms 393KB PNG)
- [x] src/stores/useWinsStore.ts exists (verified: 67 lines)
- [x] Commit c3d4dc1 exists (verified: git log confirms)
- [x] Commit c5c204e exists (verified: git log confirms)
- [x] TypeScript passes with 0 errors
- [x] All 6 exports present (useWinsStore + 5 selector hooks)

---
phase: 03-win-history
plan: "01"
subsystem: utils/testing
tags: [tdd, date-utils, unit-tests, formatDateKey]
dependency_graph:
  requires: []
  provides: [formatDateKey, historyUtils-test-suite]
  affects: [03-02-components, 03-03-screen-assembly]
tech_stack:
  added: []
  patterns: [jest-fake-timers, noon-anchor-date, tdd-red-green]
key_files:
  created:
    - src/__tests__/historyUtils.test.ts
  modified:
    - src/utils/dateUtils.ts
decisions:
  - "formatDateKey appended additively after computeStreak — existing exports unmodified"
  - "date-fns imports added at top of dateUtils.ts alongside existing file structure"
  - "winCountLabel and groupWinsByDate defined locally in test file (not exported) — will be inlined in components"
  - "groupWinsByDate preserves Map insertion order from date_key DESC store output for section ordering"
metrics:
  duration_seconds: 141
  completed_date: "2026-05-11"
  tasks_completed: 1
  files_created: 1
  files_modified: 1
---

# Phase 3 Plan 1: History Utility Functions + Test Suite Summary

## One-Liner

`formatDateKey` utility added to `dateUtils.ts` with noon anchor, plus 12-case `historyUtils` test suite covering `formatDateKey`, `winCountLabel`, and `groupWinsByDate` — all green.

## What Was Built

### `src/utils/dateUtils.ts` (additive)

Added `formatDateKey(dateKey: string): string` export at the end of the file without modifying `toDateKey` or `computeStreak`. Added `date-fns` imports (`isToday`, `isYesterday`, `isSameYear`, `format`) at the top.

The function uses the noon anchor pattern (`dateKey + "T12:00:00"`) established in `computeStreak` to prevent DST off-by-one errors. Output:
- Today's date_key → `"Today"`
- Yesterday's date_key → `"Yesterday"`
- Same calendar year → `"EEE, MMM d"` format (e.g. `"Sat, May 9"`)
- Prior year → `"MMM d, yyyy"` format (e.g. `"Dec 1, 2025"`)

### `src/__tests__/historyUtils.test.ts` (new)

Unit test suite with 12 tests across three describe blocks:

1. **`formatDateKey (HIST-01)`** — 4 cases pinned to `2026-05-11T12:00:00` via `jest.useFakeTimers()`: Today, Yesterday, same-year `"Sat, May 9"`, prior-year `"Dec 1, 2025"`.

2. **`winCountLabel (HIST-02)`** — 4 cases for the pure function defined locally (will be inlined in `DateSectionHeader.tsx`): singular `"1 win"`, plural `"0 wins"` / `"3 wins"` / `"10 wins"`.

3. **`groupWinsByDate (HIST-01)`** — 4 cases for the pure grouping function defined locally (will be inlined in `wins.tsx` via `useMemo`): empty input, two-date ordering newest-first, within-group `logged_at` DESC sort, single-date single-win.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) | `70c7e48` | PASSED — test suite failed with `TS2305: Module has no exported member 'formatDateKey'` |
| GREEN (feat) | `66be0d2` | PASSED — all 12 historyUtils tests pass; full suite 42/42 green |

## Verification Results

| Check | Result |
|-------|--------|
| `npx jest --testPathPattern=historyUtils` | PASS: 12/12 |
| `npx jest --testPathPattern=dateUtils` | PASS: 9/9 (existing tests unmodified) |
| `npx jest --passWithNoTests` (full suite) | PASS: 42/42 |
| `npx tsc --noEmit` | Clean — no TypeScript errors |
| `export function formatDateKey` in dateUtils.ts | FOUND (line 44) |
| `T12:00:00` noon anchor in formatDateKey | FOUND (line 46) |
| `toDateKey` and `computeStreak` unmodified | Confirmed — existing behavior unchanged |

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| `70c7e48` | test | Failing historyUtils test suite (RED gate) |
| `66be0d2` | feat | formatDateKey implementation in dateUtils.ts (GREEN gate) |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all functions are fully implemented and tested.

## Threat Flags

None — `formatDateKey` is a pure local date formatting utility. No network endpoints, no auth paths, no file access, no schema changes. Threat register disposition `accept` is correct (T-03-01).

## Self-Check: PASSED

- `src/__tests__/historyUtils.test.ts`: FOUND
- `src/utils/dateUtils.ts` (modified): FOUND
- Commit `70c7e48` (RED): FOUND in git log
- Commit `66be0d2` (GREEN): FOUND in git log
- All acceptance criteria satisfied

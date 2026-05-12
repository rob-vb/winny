---
phase: 03-win-history
reviewed: 2026-05-12T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - app/(tabs)/wins.tsx
  - src/components/DateSectionHeader.tsx
  - src/components/HistoryHeroHeader.tsx
  - src/__tests__/historyUtils.test.ts
  - src/utils/dateUtils.ts
findings:
  critical: 1
  warning: 3
  info: 1
  total: 5
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-05-12T00:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files were reviewed covering the Win History screen (`wins.tsx`), two new UI components (`DateSectionHeader`, `HistoryHeroHeader`), a utility module (`dateUtils.ts`), and the test suite (`historyUtils.test.ts`).

The overall implementation is clean and well-structured. One critical defect was found: a React Rules of Hooks violation in `wins.tsx` that will crash the app when `isHydrated` transitions from `false` to `true`. Three warnings cover a missing `useEffect` dependency, a test clock that is non-deterministic across timezones, and a `renderItem` null-return pattern with minor layout implications. One info item notes that the test suite duplicates production logic rather than importing it.

---

## Critical Issues

### CR-01: Rules of Hooks violated — `useState` and `useMemo` called after conditional return

**File:** `app/(tabs)/wins.tsx:51-67`

**Issue:** `useState` (line 55) and `useMemo` (line 67) are invoked **after** the conditional early return on line 51 (`if (!isHydrated) return null`). React's Rules of Hooks require that every hook is called on every render, unconditionally. When `isHydrated` is `false`, `useWinsStore` is called (hook #1) but then the component returns early — `useState` and `useMemo` are never reached. On the next render when `isHydrated` flips to `true`, all three hooks run, giving React a different hook count than the previous render. React will throw:

> **Error: Rendered more hooks than during the previous render.**

This crash will affect every user on first app launch (before hydration completes).

**Fix:** Move the `useState` and `useMemo` calls to before the guard, then keep the early return:

```tsx
export default function WinsScreen() {
  const { wins, totalWins, streak, isHydrated } = useWinsStore(
    useShallow((s) => ({
      wins: s.wins,
      totalWins: s.totalWins,
      streak: s.streak,
      isHydrated: s.isHydrated,
    }))
  );

  // Hooks MUST come before any conditional return
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const sections = useMemo(() => groupWinsByDate(wins), [wins]);

  // Guards go AFTER all hook calls
  if (!isHydrated) return null;

  const toggleSection = (date_key: string) => { ... };

  if (totalWins === 0) { ... }

  return ( ... );
}
```

---

## Warnings

### WR-01: `useEffect` missing `rotation` in dependency array

**File:** `src/components/DateSectionHeader.tsx:38-40`

**Issue:** The `useEffect` that syncs the chevron rotation animation lists `[isCollapsed]` as its dependency array but references `rotation` (a Reanimated shared value). While `useSharedValue` returns a stable ref, ESLint's `react-hooks/exhaustive-deps` rule will flag this, and it can silently break if the implementation of `useSharedValue` ever changes or if static analysis tools enforce the rule as an error in CI.

```tsx
useEffect(() => {
  rotation.value = withTiming(isCollapsed ? 180 : 0, { duration: 200 });
}, [isCollapsed]); // 'rotation' is missing
```

**Fix:**

```tsx
useEffect(() => {
  rotation.value = withTiming(isCollapsed ? 180 : 0, { duration: 200 });
}, [isCollapsed, rotation]);
```

---

### WR-02: Test clock constructed without timezone offset — non-deterministic on UTC-offset CI

**File:** `src/__tests__/historyUtils.test.ts:12`

**Issue:** `jest.setSystemTime(new Date("2026-05-11T12:00:00"))` uses an ISO-8601-like string **without** a timezone offset. Per the ECMAScript specification, strings of the form `YYYY-MM-DDTHH:mm:ss` (with a `T` separator but no offset) are parsed as **local time**. On a developer machine in, say, UTC+10, noon local = 02:00 UTC — the fake clock is still safely within May 11. But on a CI runner configured to UTC-12, noon local = midnight UTC on May 12, which shifts `isToday` checks in `date-fns` to the wrong date, causing the `"Today"` and `"Yesterday"` assertions to fail intermittently.

**Fix:** Always use an explicit UTC offset so the fake clock is deterministic regardless of runner timezone:

```ts
// Pin to UTC noon — same absolute moment everywhere
jest.setSystemTime(new Date("2026-05-11T12:00:00Z"));
```

And update the constant if the test expectation depends on local time:

```ts
// If date-fns isToday uses local time, verify date_keys remain correct
// after switching to Z suffix — they will, since noon UTC is still May 11 globally.
```

---

### WR-03: `renderItem` returns `null` for collapsed sections — unsupported SectionList pattern

**File:** `app/(tabs)/wins.tsx:105-109`

**Issue:** When a section is collapsed, `renderItem` returns `null`:

```tsx
renderItem={({ item, section }) =>
  collapsedSections[(section as WinSection).date_key] ? null : (
    <WinCard win={item} isNew={false} />
  )
}
```

React Native's `SectionList` (built on `VirtualizedList`) does not document `null` as a valid return from `renderItem`. In practice, the VirtualizedList item slot still occupies a measured cell whose height is `0` only if the renderer actually produces nothing — but `null` causes React to skip the reconciler node, which can produce inconsistent item heights in the scroll metrics cache. This manifests as scroll position jumping and sticky headers mis-aligning after collapse/expand. The known-safe pattern is to render a zero-height `View` or to slice the `data` array instead.

**Fix (option A — zero-height view, safest):**

```tsx
renderItem={({ item, section }) =>
  collapsedSections[(section as WinSection).date_key] ? (
    <View style={{ height: 0 }} />
  ) : (
    <WinCard win={item} isNew={false} />
  )
}
```

**Fix (option B — filter data in sections, cleaner):**

In `groupWinsByDate` or in the `useMemo`, produce a `displaySections` array where collapsed sections have `data: []`:

```tsx
const displaySections = useMemo(
  () =>
    sections.map((s) => ({
      ...s,
      data: collapsedSections[s.date_key] ? [] : s.data,
    })),
  [sections, collapsedSections]
);
```

Then pass `displaySections` to the `SectionList` and remove the null-return guard from `renderItem`. This is the idiomatic approach.

---

## Info

### IN-01: Test suite duplicates production logic instead of importing it

**File:** `src/__tests__/historyUtils.test.ts:41-85`

**Issue:** `winCountLabel` (lines 41-42) and `groupWinsByDate` (lines 69-85) are re-implemented verbatim inside the test file with a comment acknowledging they are "same implementation that will be inlined." The `winCountLabel` function is also copy-pasted into `DateSectionHeader.tsx` at module level (line 13). If either function changes, the test will continue to pass against the old copy, giving false confidence.

`groupWinsByDate` is already defined at module level in `wins.tsx` but is not exported or importable from tests. `winCountLabel` similarly lives only inside `DateSectionHeader.tsx` unexported.

**Fix:** Export both utilities so tests import the real implementation:

```ts
// src/utils/historyUtils.ts (new file)
export const winCountLabel = (count: number): string =>
  count === 1 ? "1 win" : `${count} wins`;

export function groupWinsByDate(wins: Win[]): WinSection[] { ... }
```

Then import in `DateSectionHeader.tsx`, `wins.tsx`, and the test:

```ts
import { winCountLabel, groupWinsByDate } from "@/src/utils/historyUtils";
```

This eliminates the duplication and ensures the tests exercise the real code paths.

---

_Reviewed: 2026-05-12T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

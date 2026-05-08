---
phase: 01-data-foundation-nav-shell
reviewed: 2026-05-08T00:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - src/db/schema.ts
  - src/db/client.ts
  - src/db/repositories/wins.ts
  - src/db/repositories/dreamGoal.ts
  - src/db/repositories/settings.ts
  - src/utils/dateUtils.ts
  - src/utils/uuid.ts
  - src/constants/theme.ts
  - babel.config.js
  - metro.config.js
  - tailwind.config.js
  - drizzle.config.ts
  - app/_layout.tsx
  - app/(tabs)/_layout.tsx
  - app/(tabs)/index.tsx
  - app/(tabs)/wins.tsx
  - app/(tabs)/goal.tsx
  - app/(tabs)/settings.tsx
findings:
  critical: 2
  warning: 3
  info: 2
  total: 7
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-05-08
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

Phase 1 delivers the DB schema, migrations, repository layer, date utilities, and a navigation shell. The overall structure is sound — the singleton DB client, migration gate on splash screen, and timezone-safe `toDateKey` all follow documented best practices. Two critical issues were found: a broken CSS import path that will crash the NativeWind build, and a DST edge case in the streak's "yesterday" grace check that can silently break the streak counter on clock-fallback nights. Three warnings address silent failure paths — a migration error that renders broken screens with no UI feedback, and unhandled promise rejections across all repository functions.

## Critical Issues

### CR-01: `global.css` import path resolves to non-existent file

**File:** `app/_layout.tsx:15`
**Issue:** `import "./global.css"` resolves relative to `app/_layout.tsx`, so it looks for `app/global.css`. The actual file is at the project root (`global.css`). This path is wrong. NativeWind requires this CSS file to initialise its stylesheet; if it cannot be found, the Metro bundler will throw a module-not-found error and the app will not build.

Confirmed: `app/global.css` does not exist. `global.css` exists only at the project root.

**Fix:**
```typescript
// app/_layout.tsx line 15
import "../global.css";   // one level up from app/ to project root
```

---

### CR-02: DST clock-fall-back breaks the streak "yesterday" grace check

**File:** `src/utils/dateUtils.ts:17`
**Issue:** `toDateKey(new Date(Date.now() - 86400000))` subtracts a fixed 86400000 ms (exactly 24 hours) to compute "yesterday". On a daylight-saving time fall-back night the day is 25 hours long. At or near midnight on that night, subtracting 24 hours in absolute milliseconds lands on 11 PM of the day before yesterday in local time. `toDateKey` then formats that as the date two days ago, not yesterday. The grace check therefore fails, and a user who logged a win the previous day has their streak reset to zero — silently, with no indication anything went wrong.

The same `T12:00:00` noon-anchor pattern used correctly in the loop body (line 24) should be applied here.

**Fix:**
```typescript
// src/utils/dateUtils.ts — replace the yesterday computation at line 17
const yesterdayDate = new Date(sorted[0] + "T12:00:00");
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = toDateKey(yesterdayDate);
if (sorted[0] !== yesterday) return 0;
```
This builds yesterday's date by parsing the most-recent win's date key at noon local time and stepping back one calendar day, making it immune to DST transitions.

---

## Warnings

### WR-01: Migration failure renders the app without any error UI

**File:** `app/_layout.tsx:32-44`
**Issue:** When `migrationsError` is set, `ready` becomes `true`, the splash screen is hidden, and the `<Stack>` navigator is rendered. Only a `console.error` is emitted (line 43). Every screen in the app will then try to query a database that may be in a broken state, producing silent data failures or runtime crashes with no user-visible explanation. The app appears to launch normally while being completely non-functional.

**Fix:** Render an error boundary screen when migrations fail so the user sees an actionable message rather than a broken app:
```typescript
if (migrationsError) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text>Something went wrong setting up the app. Please restart.</Text>
    </View>
  );
}

return (
  <Stack>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="+not-found" />
  </Stack>
);
```

---

### WR-02: Repository functions propagate DB errors as unhandled promise rejections

**File:** `src/db/repositories/wins.ts:7,17,21` | `src/db/repositories/dreamGoal.ts:5,14` | `src/db/repositories/settings.ts:5,14`
**Issue:** All repository functions (`insertWin`, `getWins`, `getDistinctDateKeys`, `getGoal`, `upsertGoal`, `getSetting`, `setSetting`) have no error handling. Any SQLite error — disk full, locked DB, constraint violation — will throw an unhandled rejection to the caller. In React Native with Hermes, unhandled promise rejections are swallowed in production builds; the UI silently shows stale or empty data with no feedback.

**Fix:** Either wrap each function with a try/catch and return a typed Result, or (minimum viable) add consistent error propagation with a documented contract. Example for `insertWin`:
```typescript
export async function insertWin(text: string): Promise<void> {
  try {
    const now = new Date();
    await db.insert(wins).values({
      id: generateId(),
      text,
      date_key: toDateKey(now),
      logged_at: now.toISOString(),
    });
  } catch (err) {
    console.error("[wins] insertWin failed:", err);
    throw err; // let the caller decide how to surface this
  }
}
```

---

### WR-03: Font load error does not render any fallback UI

**File:** `app/_layout.tsx:32,40`
**Issue:** Like the migration error case, when `fontError` is set the app renders as normal — `ready` is `true`, splash is hidden, and `null` is no longer returned at line 40. The app renders with system fonts instead of Nunito. While this is less severe than a DB failure, it is invisible to the user and will produce broken text rendering for any component that relies on the custom font names being loaded.

**Fix:** Add a `fontError` guard analogous to the migration error guard (see WR-01 fix). At minimum, log and continue with a degraded UI note rather than rendering silently with missing fonts.

---

## Info

### IN-01: Hardcoded color values in tab navigator duplicate the Colors constants

**File:** `app/(tabs)/_layout.tsx:8-14`
**Issue:** The tab bar style uses raw hex strings (`"#F5A623"`, `"#8E8E93"`, `"#FFFFFF"`, `"#F0EDE8"`) that duplicate the values already defined in `src/constants/theme.ts` and `tailwind.config.js`. If a brand color is updated, this file will be missed.

**Fix:**
```typescript
import { Colors } from "@/src/constants/theme";

screenOptions={{
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textSecondary,
  tabBarStyle: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
  },
  ...
}}
```

---

### IN-02: `getWins()` return type annotation has ambiguous precedence

**File:** `src/db/repositories/wins.ts:17`
**Issue:** The return type is written as `Promise<typeof wins.$inferSelect[]>`. TypeScript parses this as `Promise<(typeof wins.$inferSelect)[]>` (array of the inferred type), which is correct, but the lack of parentheses around the array type is a readability trap — a future reader may mistake it for `Promise<typeof (wins.$inferSelect[])>` (index access). The explicit parenthesised form is the project-wide pattern used elsewhere (e.g., `NewWin` usage).

**Fix:**
```typescript
export async function getWins(): Promise<(typeof wins.$inferSelect)[]> {
```

---

_Reviewed: 2026-05-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

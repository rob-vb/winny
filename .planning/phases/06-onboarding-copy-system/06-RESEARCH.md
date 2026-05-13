# Phase 6: Onboarding + Copy System - Research

**Researched:** 2026-05-13
**Status:** Ready for planning

## Executive Summary

Phase 6 should be implemented as a vertical slice around three existing seams:

1. `app/_layout.tsx` already gates app rendering on migrations and fonts, so onboarding can add one more async readiness check for `settings.onboarding_completed`.
2. `src/db/repositories/settings.ts` and `src/db/repositories/dreamGoal.ts` already provide the persistence needed for onboarding completion and optional Dream Goal setup.
3. `app/(tabs)/index.tsx` and `src/stores/useWinsStore.ts` already own win saves, streak recalculation, and notification-permission timing, so milestone and comeback feedback should be derived around that post-save transition rather than introducing a second streak model.

The safest plan is: create a typed copy catalog first, wrap existing copy helpers around it, add pure utility tests for deterministic variants and comeback/milestone detection, then add onboarding routes and finally wire Home banners to the save path.

## Current System Shape

### App Readiness and Routing

- `app/_layout.tsx` uses Expo Router `Stack`, `useMigrations(db, migrations)`, Nunito font loading, and splash hiding after `ready`.
- The current Stack exposes `(tabs)`, `settings/how-it-works`, and `+not-found`.
- Onboarding should live outside `(tabs)` so the tab shell is hidden until the user completes the first-run gate.
- Because `_layout.tsx` already imports `getSetting`, it can read `onboarding_completed` without adding new infrastructure.

### Persistence

- `src/db/repositories/settings.ts` exposes `getSetting(key)` and `setSetting(key, value)` on the existing `settings` key/value table.
- `src/db/repositories/dreamGoal.ts` exposes `getGoal()` and `upsertGoal(text)` for the singleton Dream Goal.
- No schema migration is needed for `onboarding_completed`.

### Dream Goal UI and Validation

- `app/(tabs)/goal.tsx` contains the full Dream Goal tab behavior, including loading, empty, view, editing, saving, and error states.
- `src/utils/goalValidation.ts` contains `validateGoalText`, `isDirty`, and `shouldShowCounter`.
- Phase 6 should reuse repository and validation logic, but build an onboarding-specific screen instead of embedding the full tab screen.

### Home Save Flow

- `app/(tabs)/index.tsx` calls `useWinsStore.addWin(text)` and then scrolls to the top of the list.
- `src/stores/useWinsStore.ts` inserts the win, re-queries wins and distinct date keys, recomputes streak, updates state, then handles notification permission if needed.
- Milestone and comeback feedback can be computed before and after `addWin()`, or returned from a small pure helper given prior wins/date keys and next streak.

### Existing Copy Surfaces

- `src/utils/streakLabel.ts` centralizes streak label copy today and already has no-guilt tests.
- `src/notifications/notificationService.ts` has `COPY_POOL` plus `pickPromptForDate(dateKey)`.
- Empty/error strings exist in Home, Goal, History, Settings, notification, and validation surfaces. Phase 6 does not need to extract every literal, only emotional-tone states and roadmap-critical states.

## Recommended Implementation Strategy

### 1. Typed Copy Catalog

Create a dedicated module such as `src/copy/catalog.ts` or `src/constants/copyCatalog.ts` with:

- Named state keys for first win, session/post-save, streak milestones, long streak, comeback, Home empty, History empty, Dream Goal empty, notification prompts, notification disabled, and save/load errors.
- Small variant arrays where freshness matters.
- Deterministic selection helpers, using date key, streak count, or win count as the seed.
- A no-guilt banned-term test fixture shared across catalog, `streakLabel`, and notification prompt tests.

Keep compatibility wrappers:

- `streakLabel(streak)` delegates to catalog streak helpers while preserving existing function signature and expected threshold strings.
- `COPY_POOL` or `pickPromptForDate` delegates to catalog notification variants so existing imports and tests continue to work.

### 2. Milestone and Comeback Utilities

Add pure helpers before touching UI:

- `getStreakMilestone(streak: number): 7 | 30 | 100 | null`
- `isComebackWin(previousLatestDateKey: string | null, todayDateKey: string): boolean`
- Optional `getPostWinMoment(input)` returning `"first-win" | "milestone" | "comeback" | "session" | null`

Use local `YYYY-MM-DD` date keys and the noon-anchor pattern from `src/utils/dateUtils.ts`; never compare UTC timestamps for calendar gaps.

Important precedence:

- First win ever should win over generic session copy.
- A milestone and comeback can both be true if the data is contrived, but the UI should show one primary banner. Prefer milestone for exact 7/30/100 threshold, otherwise comeback after a gap.
- Comeback copy appears only after the user logs again following a gap greater than one calendar day.

### 3. Onboarding Routes

Add routes outside `(tabs)`, for example:

- `app/onboarding/welcome.tsx`
- `app/onboarding/dream-goal.tsx`

Update `app/_layout.tsx` to:

- Load `onboarding_completed` only after migrations/fonts are ready.
- Show splash/null until onboarding status is known.
- Redirect first-run users to welcome.
- Keep tabs inaccessible until completion.
- Mark completion only after Save Goal or Skip in the onboarding Dream Goal route.

Use `router.replace(...)` rather than `push(...)` for onboarding transitions so users do not back-navigate into completed onboarding.

### 4. Onboarding Dream Goal Setup

Build a lighter screen that:

- Uses `validateGoalText` to disable Save Goal until valid text exists.
- Calls `upsertGoal(trimmedText)` on Save Goal.
- Calls `setSetting("onboarding_completed", "true")` on Save Goal and Skip.
- Shows a brief saved state after successful save, then routes to Home.
- Keeps "Skip for now" visible and calm.

Do not prompt for notification permission here. Phase 5 owns permission timing after first win save.

### 5. Home Banner Integration

Add a small Home-only banner near the top of Home after `handleAddWin`.

Implementation options:

- Store `postWinMoment` local component state in `app/(tabs)/index.tsx`, derived by reading current `totalWins`, `streak`, and date keys around `addWin`.
- Or make `useWinsStore.addWin` return metadata about the inserted win and previous state. This is cleaner for tests but changes the store action contract.

Conservative recommendation: keep the store action contract stable and add tested pure helper functions. Home can derive the banner from the pre-save values and post-save store values, then clear on dismissal or after a short duration.

## Validation Architecture

Phase 6 needs test coverage because most correctness is in state transitions and language invariants, not visual layout.

### Unit Tests

- Copy catalog exports all required state keys.
- Copy catalog contains no banned guilt/shame terms across all variants.
- Deterministic variant selection returns the same copy for the same seed and distributes across multiple values over a 30-day sample.
- `streakLabel()` preserves existing threshold behavior while delegating to the catalog.
- Notification prompt selection still returns catalog-backed prompts and no guilt language.
- Milestone helper returns only 7, 30, and 100.
- Comeback helper returns true only when the newest prior win date is more than one local calendar day before today.
- Onboarding completion repository wrapper, if added, reads/writes `settings.onboarding_completed`.

### Component/Integration Tests

- Welcome route renders the trophy-led welcome copy and `Start Winning` CTA.
- Dream Goal onboarding route disables Save Goal for invalid/empty text and enables it for valid text.
- Skip path sets `onboarding_completed=true` and routes Home.
- Save path calls `upsertGoal`, sets `onboarding_completed=true`, shows brief success, and routes Home.
- Home shows milestone banner after the save that reaches 7, 30, or 100.
- Home shows comeback banner only after a win following a date gap.

### Manual Verification

- Fresh install path: Welcome -> Dream Goal setup -> Home, no tabs visible until completion.
- Skip Dream Goal and later set it from the Dream Goal tab.
- Save Dream Goal during onboarding and confirm it appears in the Dream Goal tab.
- Log a first win and confirm notification permission timing still happens after win save, not during onboarding.
- Seed wins around 7/30/100 and gap states, then verify banner copy and no-guilt tone.

## Risks and Pitfalls

### Pitfall 1: Splash/Route Race

If onboarding status is read before migrations complete, `getSetting()` can race the database. Read onboarding status only after `ready` is true or after the same migrations/fonts gates have cleared.

### Pitfall 2: Tabs Flash Before Onboarding

Returning `<Stack>` with `(tabs)` before onboarding status is known can flash the app shell. Keep rendering `null`/splash until the status check finishes, then route.

### Pitfall 3: Back Navigation Into Onboarding

Using `router.push()` between onboarding screens can leave welcome/setup in navigation history. Use `router.replace()` for first-run transitions and completion.

### Pitfall 4: UTC Date Gaps

Comeback logic must compare local `date_key` values using the noon-anchor pattern already used in `dateUtils.ts`. Avoid `toISOString().slice(0, 10)`.

### Pitfall 5: Copy Catalog Overreach

Trying to move every string into the catalog will inflate the phase. Limit extraction to emotional-tone states and compatibility wrappers for existing helpers.

### Pitfall 6: Notification Timing Regression

Do not request notification permission during onboarding. `useWinsStore.addWin()` already handles the post-first-win permission flow.

### Pitfall 7: Duplicate Streak Logic

Do not introduce a second streak calculation model for banners. Use existing `computeStreak()` outputs and date-key helpers.

## Suggested Plan Breakdown

1. Copy catalog and pure copy/state utilities with tests.
2. Onboarding persistence wrapper and root routing gate.
3. Welcome and Dream Goal onboarding screens.
4. Home milestone/comeback banner integration.
5. Copy audit and final verification across no-guilt states.

## Files Likely Touched

- `app/_layout.tsx`
- `app/onboarding/welcome.tsx`
- `app/onboarding/dream-goal.tsx`
- `app/(tabs)/index.tsx`
- `src/copy/catalog.ts` or `src/constants/copyCatalog.ts`
- `src/utils/streakLabel.ts`
- `src/notifications/notificationService.ts`
- `src/utils/dateUtils.ts` or a new `src/utils/postWinMoment.ts`
- `src/db/repositories/settings.ts` or a small onboarding settings wrapper
- `src/__tests__/copyCatalog.test.ts`
- `src/__tests__/postWinMoment.test.ts`
- Existing `streakLabel` and `notificationService` tests

## Research Complete

Phase 6 can be planned without new dependencies or schema changes. The plan should enforce the UI-SPEC gate before implementation because this phase adds first-run screens and banner surfaces.

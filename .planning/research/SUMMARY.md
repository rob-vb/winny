# Research Summary — Winning Streak

**Synthesized:** 2026-05-08
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md, PROJECT.md

---

## Executive Summary

Winning Streak is a local-first daily wins journaling app for iOS and Android. It belongs to the mature habit-tracking category but differentiates on framing — wins-only positivity practice, Charlie Rocket brand affinity, and a Dream Goal anchor — rather than mechanics. The recommended approach is deliberately minimal: Expo managed workflow with expo-sqlite + Drizzle ORM for structured local storage, Zustand for ephemeral UI state, expo-notifications for daily reminders, and NativeWind for styling. The schema must be designed from day one to migrate cleanly to Convex in V2, using UUID string primary keys, ISO 8601 date fields, and stored local-date strings for timezone-safe streak calculation.

The dominant product risk is not missing features — V1 as defined in PROJECT.md correctly covers all table stakes — but execution quality on the details that drive retention: streak UX tone, notification permission timing, first-run flow, and the copy system for encouragement messages. The dominant technical risk is the timezone-naive date storage bug, which silently breaks streaks for users outside the developer's timezone and causes one-star reviews. This must be addressed in Phase 1 before any streak logic is built.

The build order is strictly dependency-driven: data foundation first, then stores, then the navigation shell, then the core win-entry loop, then secondary screens, then notifications last. Notifications are the most complex piece (iOS 64-notification scheduling limit, Android battery optimization, permission timing) and should be implemented only after the core loop is stable and tested.

---

## Key Findings

### Stack

| Decision | Recommendation | Confidence |
|----------|---------------|------------|
| Framework | Expo SDK 52+ managed workflow, EAS Build | MEDIUM — verify current SDK version |
| Storage (wins data) | expo-sqlite v14+ with Drizzle ORM | HIGH |
| Storage (settings) | expo-secure-store or MMKV | HIGH |
| Navigation | Expo Router v4 (file-based, typed routes) | HIGH |
| State | Zustand (UI state only) — SQLite is source of truth | HIGH |
| Async data layer | Drizzle live queries or Zustand + repo layer; React Query NOT needed for local SQLite | HIGH |
| Styling | NativeWind v4 + custom components (no component library) | MEDIUM — verify stable release |
| Dates | date-fns v3 | HIGH |
| Animations | react-native-reanimated (already in Expo) | HIGH |
| Future backend | Convex V2 | MEDIUM — verify React Native SDK status |

Critical avoids: MMKV as primary store (no SQL queries), AsyncStorage (deprecated), Redux/RTK (overkill), any pre-built component library (fights custom design), Moment.js, WatermelonDB.

---

### Features

**Table stakes (all required in V1):**
- Frictionless win entry: single prompt, auto-focused keyboard, under 15 seconds to log
- Streak counter: consecutive days, encouraging tone on reset ("You're back!" not "Streak lost")
- Total wins counter: never resets, psychological safety valve against streak anxiety
- Win history: grouped by date, collapsible, newest-first
- Daily push reminder: configurable time, default 8 PM
- Basic settings: reminder time, display name, about section
- Graceful first-run flow: no permission requests before first win is logged

**Differentiators (Winning Streak's edge):**
- Wins-only framing — never asks about failures, tasks undone, or mood
- Dream Goal as context anchor — frames every win as progress toward a personal aspiration
- Encouraging tone system — ~40-60 strings across 15-20 distinct message states (treat as product deliverable, not a dev task)
- Rotating example prompts — 40-50 curated, date-rotated (same user sees same prompt on same day)

**Anti-features (deliberately exclude from V1):**
- Mood tracking (dilutes wins-only framing, 4x friction increase)
- Task/to-do integration (wrong psychological frame)
- Categories/tags in V1 (decision overhead on every entry; defer to V2 AI categorization)
- Social sharing (changes what users log toward performative wins)
- Streak freeze/grace day (adds IAP complexity; total wins counter is the better mechanic)
- Apple Watch / widgets (V2+)

Notification permission timing is a high-stakes product decision: ask after first win is logged, not on app launch. iOS one-shot permission acceptance: ~40% upfront vs ~70%+ post-value-delivery.

Rate-app prompt timing: trigger at 7-day streak milestone, not before.

---

### Architecture

**SQLite schema (3 tables):**
- `wins`: `id` (UUID TEXT PK), `text`, `logged_at` (ISO 8601), `date_key` (local YYYY-MM-DD), `created_at` — indexes on `date_key DESC` and `logged_at DESC`
- `dream_goal`: singleton row (`id = 'singleton'`), `text`, `updated_at`
- `settings`: key-value (`display_name`, `notification_time`, `notification_enabled`)
- `schema_migrations`: version-based migration tracking

Key schema constraints for V2 migration: UUID string PKs (not auto-increment integers), `date_key` stored as TEXT in device local time (computed in JS at write time, never derived from UTC at query time), streak never persisted (derived on-demand), nullable forward-compat columns (`synced_at`, `category`, `remote_id`) added from V1.

**Layer architecture:**
```
Screens (Expo Router tabs)
  └── Zustand stores (ephemeral reactive state)
        └── Repository layer (pure async functions)
              └── expo-sqlite singleton (database.ts: open + migration runner)

NotificationService (standalone — reads settings repo, calls expo-notifications)
```

Key pattern rules:
- Screens never import from `src/db/` — always through stores
- Zustand has no persistence middleware — SQLite is the persistence layer
- `app/_layout.tsx` is the single init point for DB open, migration, and store hydration
- Screens gate render on `isHydrated` flag to prevent cold-start flicker

---

### Pitfalls

**Critical (will break the app):**

1. **Timezone-naive date storage** — Store `date_key` as `YYYY-MM-DD` in device local time using `new Intl.DateTimeFormat('en-CA').format(new Date())` at write time. Never use `SQLite datetime('now')` or UTC epoch arithmetic for streak or day-grouping logic. Test in UTC-12 and UTC+14. Address in Phase 1 — retrofitting requires a schema migration.

2. **iOS 64-notification scheduling limit** — iOS silently drops notifications beyond 64. Schedule only the next 30-day window and top up the queue on every app foreground via `AppState` listener. Reserve slots for milestone notifications.

3. **expo-sqlite v2 breaking change from v1** — Pre-2024 tutorials use incompatible synchronous v1 API. Use only `runAsync`, `getAllAsync`, `getFirstAsync`, `execAsync`. Use Drizzle ORM from day one.

4. **No built-in migration versioning** — Ship a `schema_migrations` table and version-based runner from day one. Use Drizzle ORM which generates and runs migrations. Never alter existing migrations — append only.

5. **OTA update vs. native build boundary** — EAS OTA updates only JS. Adding native modules or changing `app.json` permissions requires a new native build. Configure `runtimeVersion` from first native build.

**Moderate (will hurt quality):**
- Hermes parses `new Date('YYYY-MM-DD')` as UTC midnight — use `date-fns` or explicit `new Date(year, month-1, day)` constructor
- Use `SectionList` (not `ScrollView` + `map`) for win history — critical for performance at scale
- Android notification delivery is only ~80-85% reliable due to Doze/battery optimization — document this, don't over-engineer
- Expo Go cannot reliably test notifications or storage — set up EAS dev build before entering notification phase

---

## Implications for Roadmap

The build order is strictly determined by dependencies. Phases 4, 5, and 6 can be built in parallel after Phase 3 is stable.

### Suggested Phase Structure

**Phase 1 — Data Foundation**
Set up expo-sqlite, Drizzle ORM, migration runner, three repositories, `dateUtils.ts` with timezone-safe `toDateKey()` and `computeStreak()`. Add `schema_migrations` table. Add nullable forward-compat columns.
- Must avoid pitfalls: timezone dates (#1), migration strategy (#4), expo-sqlite v1 patterns (#3)
- Delivers: stable, queryable, migration-safe data layer

**Phase 2 — State Stores + Navigation Shell**
Build three Zustand stores (hydrate from repos, expose actions, compute streak). Build `app/_layout.tsx` (DB init, hydration) and `app/(tabs)/_layout.tsx` (tab bar, theme). Validate full data flow end-to-end.
- Must avoid: Zustand persistence middleware anti-pattern, state over-engineering
- Delivers: runnable app shell with correct data flow

**Phase 3 — Core Win-Entry Loop**
Home screen: example prompts array, `WinInput` component, streak display, "I'm done for today" flow. Wire `addWin` through store to repository.
- Must avoid: midnight boundary edge case, Hermes date parsing
- Delivers: the entire core value loop — app is functional

**Phase 4 — Win History Screen**
`WinCard`, `WinDayGroup` components, `My Wins` tab using `SectionList`. Collapsible day groups. Total wins count displayed prominently.
- Must avoid: FlatList/ScrollView nested scroll performance — use SectionList from the start
- Delivers: the "proof layer" that spikes day 2-3 retention

**Phase 5 — Dream Goal Screen**
Dream Goal tab: display, edit, save. Wire to `dreamGoalRepository` and `useDreamStore`. Accessible from home screen in one tap.
- Low complexity, low risk
- Delivers: primary product differentiator

**Phase 6 — Notifications + Settings**
`notificationService.ts` with 30-day scheduling window + AppState top-up pattern. Settings tab (reminder time picker, display name, about). Notification permission ask wired to post-first-win flow. Configure `runtimeVersion` in `eas.json`.
- Must avoid: iOS 64-notification limit (#2), Android battery issues (#7), OTA runtimeVersion (#5), permission bloat (#10)
- Requires EAS dev build — not Expo Go
- Delivers: habit anchor + user control

**Phase 7 — Copy System + Polish**
Write all 40-60 encouragement strings (15-20 message states). Milestone animations. Onboarding flow (value-first, no tutorial). Rate app prompt at 7-day streak.
- This is a product/copy deliverable, not just dev work — requires copywriter involvement or dedicated content sprint
- Delivers: emotional resonance that makes the app feel like Winning Streak vs. a generic tracker

**Phase 8 — EAS Build + App Store Submission**
Configure EAS profiles. Audit `app.json` permissions. Prepare App Store metadata (privacy policy URL, no keyword stuffing, no medical language). TestFlight. Submit.
- Must avoid: permission bloat (#10), metadata rejection (#16), credential setup (#15)
- Delivers: shipped app

### Dependency Graph

```
Phase 1 (Data) → Phase 2 (Stores + Shell) → Phase 3 (Core Loop)
                                               ├── Phase 4 (History)   ┐
                                               ├── Phase 5 (Dream Goal)├── Phase 7 (Polish) → Phase 8 (Submit)
                                               └── Phase 6 (Notifs)    ┘
```

---

## Research Flags

| Phase | Needs Deeper Research? | Reason |
|-------|----------------------|--------|
| Phase 1 — Data Foundation | YES | Verify expo-sqlite v14 async API surface and Drizzle expo-sqlite adapter current docs against installed version |
| Phase 2 — Stores + Shell | NO | Zustand and Expo Router patterns are stable and well-documented |
| Phase 3 — Core Loop | NO | Standard React Native patterns; streak logic is clear with correct date utils |
| Phase 4 — History Screen | NO | SectionList is well-documented |
| Phase 5 — Dream Goal | NO | Simplest screen; no research needed |
| Phase 6 — Notifications | YES | Verify expo-notifications recurring daily trigger syntax; iOS 64-limit mitigation pattern; Android exact alarm permission |
| Phase 7 — Polish | NO | Copy system and animations are product work |
| Phase 8 — Submission | YES (light) | Verify current EAS runtimeVersion docs and App Store metadata requirements before first native build |

---

## Gaps to Address

**Before Phase 1 begins:**
- Verify current Expo SDK version (52 or 53) at https://docs.expo.dev/versions/latest/
- Verify expo-sqlite v14 async API surface against installed version
- Verify Drizzle ORM expo-sqlite adapter compatibility and `migrate()` pattern
- Verify NativeWind v4 is stable (was in active development at research cutoff)
- Set up EAS dev build profile early — before notification testing begins

**Before Phase 6 begins:**
- Verify expo-notifications recurring daily trigger syntax against current SDK docs
- Confirm iOS 64-notification limit mitigation pattern is still recommended
- Verify Android `POST_NOTIFICATIONS` permission setup in current Expo managed workflow

**Before V2 planning:**
- Verify Convex React Native SDK status at https://docs.convex.dev/client/react-native
- Confirm Convex `_id` field conventions and UUID local ID compatibility
- Design upload migration utility before V2 build begins

**Product gaps (decisions needed before build):**
- First-run notification permission ask flow: exact UX not specified in PROJECT.md — recommend after first "I'm done for today"
- Dream Goal prompt timing: recommendation is second or third app open (not first)
- All 40-60 encouragement copy strings: product/copy work that should be drafted before Phase 7 development begins

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Stack recommendations | MEDIUM-HIGH | Core choices HIGH; specific version numbers MEDIUM — verify before init |
| Feature scope | HIGH | Well-grounded in competitive analysis and PROJECT.md alignment |
| Architecture patterns | HIGH | Standard local-first React Native patterns; specific expo-sqlite v2 API is MEDIUM |
| Pitfalls | MEDIUM-HIGH | iOS 64-limit and timezone bug are documented platform behaviors; Android patterns MEDIUM |
| Convex V2 migration path | MEDIUM | Pattern is correct; specific Convex API conventions need verification at V2 design time |

**Overall: MEDIUM-HIGH.** The research is grounded in well-established patterns and the project scope is well-defined. Main uncertainty is specific package API surfaces due to Aug 2025 knowledge cutoff — all have verification URLs in STACK.md.

---

## Sources

Aggregated from research files. All sources are training data (knowledge cutoff Aug 2025). No live documentation was accessible during the research run.

- https://docs.expo.dev/versions/latest/ — verify SDK version, expo-sqlite API, expo-notifications
- https://orm.drizzle.team/docs/get-started/expo-new — verify Drizzle expo-sqlite adapter
- https://www.nativewind.dev — verify NativeWind v4 stable release
- https://docs.convex.dev/client/react-native — verify Convex React Native SDK before V2 planning
- Competitive reference: Daylio, Streaks, Finch, Reflectly, Habitica, Done, Bearable, Duolingo (streak mechanics), Momentum

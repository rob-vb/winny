# Architecture Research — Winning Streak

**Researched:** 2026-05-08
**Overall confidence:** MEDIUM-HIGH (training data through Aug 2025; external docs unavailable in this research run — flag for validation against expo-sqlite v2 and expo-router v3/v4 release notes before implementation)

---

## Executive Summary

Winning Streak is a local-first Expo app with four screens, a SQLite persistence layer, daily notification scheduling, and a hard requirement to migrate cleanly to Convex in V2. The architecture is deliberately simple: SQLite is the source of truth, Zustand stores hold derived/transient state, and a thin repository layer mediates between them. The notification service is a standalone module that reads scheduling preferences from SQLite. No network layer exists in V1 (the only exception is push notification token registration, which can be deferred or made optional).

The dominant architectural risk is schema migration: SQLite in React Native has historically required manual migration scripts or a migration library. The schema must also be designed with Convex table shapes in mind from day one — field names, types, and ID conventions should mirror what Convex will expect so that a V2 migration is a copy, not a transform.

---

## Data Model

### Storage Technology Decision

Use `expo-sqlite` (v14+, the "new" async API introduced in SDK 51). This is the right call over MMKV because:
- Wins require relational queries (group by date, count by day, streak calculation across date range)
- MMKV is a key-value store — it would require serializing entire arrays and doing streak math in JS, which is fragile and slow
- expo-sqlite v2 (SDK 51+) introduced a proper async `SQLiteDatabase` API with `runAsync`, `getFirstAsync`, `getAllAsync`, and `withTransactionAsync` — clean and composable
- MMKV remains useful for non-relational preferences (notification time, display name) — use it only for settings, not for wins data

**Confidence:** HIGH — expo-sqlite v2 async API is well-documented in training data and was the recommended approach as of SDK 51/52.

### SQLite Schema

Design principle: every field maps to a Convex document field. Use ISO 8601 strings for dates (not Unix timestamps) so Convex can index them natively. Use `TEXT` UUIDs as primary keys — Convex uses string IDs, so this aligns the V1 and V2 ID spaces and avoids an integer-to-string transform at migration time.

```sql
-- wins table: one row per individual win entry
CREATE TABLE IF NOT EXISTS wins (
  id         TEXT PRIMARY KEY,           -- UUIDv4, maps to Convex _id (or a user-visible ID)
  text       TEXT NOT NULL,              -- win content, max 200 chars (enforced in app layer)
  logged_at  TEXT NOT NULL,              -- ISO 8601 datetime, e.g. "2026-05-08T20:14:00.000Z"
  date_key   TEXT NOT NULL,             -- LOCAL date "YYYY-MM-DD" for grouping (derived, stored for query perf)
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_wins_date_key ON wins(date_key DESC);
CREATE INDEX IF NOT EXISTS idx_wins_logged_at ON wins(logged_at DESC);

-- dream_goal table: single-row, updated in place
CREATE TABLE IF NOT EXISTS dream_goal (
  id         TEXT PRIMARY KEY DEFAULT 'singleton',
  text       TEXT NOT NULL DEFAULT '',  -- max 500 chars, enforced in app layer
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- settings table: single-row key-value store for user preferences
-- Could use MMKV but keeping in SQLite makes the Convex migration trivial (one table to upload)
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
-- seed rows:
-- INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('display_name', '', datetime('now'));
-- INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('notification_time', '20:00', datetime('now'));
-- INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('notification_enabled', 'true', datetime('now'));

-- schema_migrations table: track applied migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### Why `date_key` Is Stored (Not Derived at Query Time)

Streak calculation requires knowing which LOCAL calendar days had at least one win. Deriving local date from a UTC timestamp at query time inside SQLite is unreliable across timezones — `date(logged_at)` in SQLite uses UTC, not device local time. Storing `date_key` as a local-date string (computed in JS using `new Date().toLocaleDateString('en-CA')` which produces YYYY-MM-DD) is simple and correct. This pattern is used in production journaling apps.

### Streak Calculation Logic

Streak is computed on-demand (not stored) from the `wins` table:

```
1. SELECT DISTINCT date_key FROM wins ORDER BY date_key DESC
2. Walk the sorted list from today backward
3. Increment streak for each consecutive calendar day
4. Stop on first gap
```

Store the computed streak in a Zustand store and recompute any time a win is added or on app focus. Do NOT persist the streak value in SQLite — it's always derivable and storing it creates an inconsistency risk.

### Migration Strategy

Use a version-based migration runner initialized at app startup:

```
CURRENT_SCHEMA_VERSION = 1

On startup:
1. Open database
2. Run CREATE TABLE IF NOT EXISTS schema_migrations
3. SELECT MAX(version) FROM schema_migrations
4. Apply all migrations where version > current max, in order
5. INSERT INTO schema_migrations (version) for each applied
```

Keep migrations as an ordered array of `{ version: number, sql: string[] }` objects in a `src/db/migrations.ts` file. Never alter existing migrations — append only.

**Confidence:** HIGH for the approach; MEDIUM for the specific expo-sqlite API (`runAsync` etc.) — verify against expo-sqlite v14+ docs.

---

## Component Architecture

### Layers

```
┌──────────────────────────────────────────────────────┐
│  Screens (Expo Router)                               │
│  app/(tabs)/index.tsx      — Home / log win          │
│  app/(tabs)/wins.tsx        — Win history            │
│  app/(tabs)/dream-goal.tsx  — Dream goal             │
│  app/(tabs)/settings.tsx    — Settings               │
└──────────────┬───────────────────────────────────────┘
               │ reads/writes via hooks
┌──────────────▼───────────────────────────────────────┐
│  Zustand Stores (in-memory, reactive)                │
│  useWinsStore     — wins list, today's wins, streak  │
│  useDreamStore    — current dream goal text          │
│  useSettingsStore — display name, notif time         │
└──────────────┬───────────────────────────────────────┘
               │ hydrates from / persists to
┌──────────────▼───────────────────────────────────────┐
│  Repository Layer (pure async functions)             │
│  src/db/winsRepository.ts                            │
│  src/db/dreamGoalRepository.ts                       │
│  src/db/settingsRepository.ts                        │
└──────────────┬───────────────────────────────────────┘
               │ SQL via
┌──────────────▼───────────────────────────────────────┐
│  expo-sqlite database instance (singleton)           │
│  src/db/database.ts — open, migrate, export db       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  NotificationService (standalone module)             │
│  src/notifications/notificationService.ts            │
│  — schedules/cancels daily reminder                  │
│  — reads time from settingsRepository                │
│  — called on settings change and app launch          │
└──────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Screen components | UI rendering, user input | Zustand stores (read/write), navigation |
| Zustand stores | In-memory reactive state, streak computation | Repository layer (async reads on hydrate) |
| Repository layer | SQL query encapsulation, data mapping | expo-sqlite database singleton |
| Database singleton | DB open, migration runner, connection | expo-sqlite |
| NotificationService | Schedule/cancel local notifications | expo-notifications, settingsRepository |
| Example prompts | Static array, rotate by date | Used directly in Home screen (no store needed) |

### No React Query in V1

React Query solves server-state caching — network latency, background refetch, stale-while-revalidate. None of that applies to a local SQLite database where reads are sub-millisecond. Using React Query over SQLite adds conceptual overhead with no benefit. Use Zustand + repository layer directly. In V2 when Convex is introduced, React Query (or Convex's own `useQuery`) will be appropriate for server queries.

**Confidence:** HIGH — this is a well-established pattern for local-first React Native apps.

---

## State Management Pattern

### Recommended: Zustand with SQLite-hydrated stores

**Why Zustand over Context:**
- Context re-renders the entire subtree on any state change; Zustand uses selector-based subscriptions
- Wins list can have hundreds of entries; Context would cause noticeable perf problems on the History screen
- Zustand is 1.1KB, zero dependencies, works identically in Expo

**Store design:**

```typescript
// useWinsStore.ts
interface WinsState {
  wins: Win[]                    // all wins, newest first
  todayWins: Win[]               // wins for today (derived on hydrate)
  streak: number                 // computed consecutive day count
  totalWins: number              // wins.length (fast, always accurate)
  isHydrated: boolean
  actions: {
    hydrate: () => Promise<void>
    addWin: (text: string) => Promise<void>
  }
}
```

**Hydration pattern:** call `store.actions.hydrate()` once from the root layout's `useEffect` after DB is ready. The store fetches from SQLite, computes streak, sets `isHydrated: true`. Screens check `isHydrated` before rendering to avoid flicker.

**No persistence middleware:** do NOT use `zustand/middleware/persist` — that serializes store to AsyncStorage. SQLite IS the persistence layer. Zustand is ephemeral cache only. This distinction matters for V2: when Convex replaces SQLite, the store interface stays identical, only the repository layer changes.

**Confidence:** HIGH.

---

## File / Folder Structure

Expo Router v3 (current as of SDK 52) uses file-based routing. The project already specifies a 4-tab nav structure.

```
winning-streak/
├── app/
│   ├── _layout.tsx             — Root layout: DB init, store hydration, global providers
│   ├── (tabs)/
│   │   ├── _layout.tsx         — Tab bar layout: icons, labels, tab bar style
│   │   ├── index.tsx           — Home tab: "What was your win today?"
│   │   ├── wins.tsx            — My Wins tab: grouped history
│   │   ├── dream-goal.tsx      — Dream Goal tab
│   │   └── settings.tsx        — Settings tab
│   └── +not-found.tsx          — 404 fallback (Expo Router default)
├── src/
│   ├── db/
│   │   ├── database.ts         — Open DB, run migrations, export singleton
│   │   ├── migrations.ts       — Ordered migration list [{version, sql[]}]
│   │   ├── winsRepository.ts   — addWin, getWins, getWinsByDateKey, getDistinctDateKeys
│   │   ├── dreamGoalRepository.ts
│   │   └── settingsRepository.ts
│   ├── stores/
│   │   ├── useWinsStore.ts
│   │   ├── useDreamStore.ts
│   │   └── useSettingsStore.ts
│   ├── notifications/
│   │   └── notificationService.ts  — scheduleDaily, cancelAll, requestPermissions
│   ├── components/
│   │   ├── WinInput.tsx        — Text input + submit
│   │   ├── WinCard.tsx         — Single win display
│   │   ├── WinDayGroup.tsx     — Collapsible day group in history
│   │   ├── StreakDisplay.tsx    — Streak counter + trophy
│   │   └── ExamplePrompt.tsx   — Rotating inspiration text
│   ├── constants/
│   │   ├── examplePrompts.ts   — Array of 40-50 strings
│   │   └── theme.ts            — Colors, typography (cream/gold/orange)
│   └── utils/
│       ├── dateUtils.ts        — toDateKey(), formatDisplayDate(), computeStreak()
│       └── uuid.ts             — generateId() using expo-crypto or react-native-uuid
└── assets/
    ├── images/                 — Rocket/astronaut mascot, trophy icon
    └── fonts/                  — Custom fonts if any
```

**Key conventions:**
- All business logic lives in `src/` — screens are thin wrappers
- Repository functions are pure async functions, not hooks — easier to test and reuse
- Components do not import from `src/db/` directly — always through stores
- `app/_layout.tsx` is the single initialization point for DB and stores

**Confidence:** HIGH for the folder conventions; MEDIUM for Expo Router v3/v4 specific file names (verify `+not-found.tsx` vs `[...404].tsx` naming in the version you install).

---

## Local → Cloud Migration Path

The V1 → V2 migration is an upload operation, not a schema transform. This is achievable only if V1 schema is designed with Convex in mind now.

### Design Constraints That Enable Clean Migration

**1. String UUIDs as primary keys (not auto-increment integers)**
Convex uses string document IDs. If V1 uses integer PKs, you need a mapping table at migration time. With UUIDs, each SQLite row's `id` can become the Convex document's user-visible ID, and `_id` (Convex internal) is a separate system field.

**2. ISO 8601 timestamps**
Convex stores timestamps as milliseconds since epoch (`number`) but queries often use date strings. Store as ISO strings in SQLite; convert to `Date.getTime()` when writing to Convex.

**3. Field names match Convex schema**
The Convex schema for `wins` in V2 should be:
```typescript
// convex/schema.ts (V2)
wins: defineTable({
  userId: v.id("users"),          // added in V2, null-able or default user for local wins
  text: v.string(),
  loggedAt: v.string(),           // ISO 8601 — matches SQLite logged_at (camelCase in Convex)
  dateKey: v.string(),            // matches SQLite date_key
  createdAt: v.string(),
  localId: v.optional(v.string()) // store V1 UUID for dedup on re-upload
})
```

Note: SQLite uses `snake_case` by convention; Convex uses `camelCase`. This is a trivial transform (`logged_at` → `loggedAt`). Document it in a migration utility rather than trying to unify the naming convention.

**4. Settings and dream goal migrate as user profile fields**
In Convex V2, `display_name`, `notification_time`, `notification_enabled` and `dream_goal` all become fields on the `users` table (or a `userProfile` table). The SQLite `settings` key-value structure maps cleanly to named Convex document fields.

**5. Migration utility (V2 build task)**
Write a single `src/migration/uploadLocalData.ts` function that:
1. Reads all wins from SQLite
2. Reads dream goal and settings
3. Calls Convex mutations in batches
4. Marks each win as `synced: true` in SQLite (add this column in a V1.x migration before V2 ships)
5. Presents a "Data uploaded" success screen

This function is a one-shot operation — run once per user after they create a Convex account.

**Confidence:** MEDIUM-HIGH — the pattern is standard for local-first → cloud migration, but specific Convex API conventions should be verified when V2 is designed.

---

## Build Order

Dependencies drive the build order. Each layer must exist before the one above it.

### Phase 1: Data Foundation
1. `src/db/database.ts` — open DB, migration runner
2. `src/db/migrations.ts` — initial schema (wins, dream_goal, settings, schema_migrations)
3. `src/utils/dateUtils.ts` — `toDateKey()`, `computeStreak()`
4. `src/utils/uuid.ts` — ID generation
5. Repository layer — `winsRepository`, `dreamGoalRepository`, `settingsRepository`

**Why first:** Everything else depends on this. No UI can be built without a working data layer.

### Phase 2: State Stores
6. `useWinsStore.ts` — hydrate from wins repo, expose `addWin`, streak, today's wins
7. `useDreamStore.ts` — hydrate dream goal
8. `useSettingsStore.ts` — hydrate settings

**Why second:** Screens consume stores; stores consume repositories. Test stores with mock repo calls before building screens.

### Phase 3: Root Layout + Tab Shell
9. `app/_layout.tsx` — DB initialization, store hydration, global error boundary
10. `app/(tabs)/_layout.tsx` — tab bar with 4 tabs, icons, theme colors

**Why third:** Navigation shell must exist before screens are worth building.

### Phase 4: Core Loop (Home Screen)
11. `src/constants/examplePrompts.ts` — static pool of 40-50 prompts
12. `WinInput.tsx` component
13. `ExamplePrompt.tsx` component
14. `app/(tabs)/index.tsx` — Home screen: prompt, input, "I'm done" button, streak display

**Why fourth:** This is the primary value loop. Validate it works end-to-end before building secondary screens.

### Phase 5: Win History Screen
15. `WinCard.tsx`, `WinDayGroup.tsx` components
16. `app/(tabs)/wins.tsx` — grouped history, collapsible days, total count

### Phase 6: Dream Goal Screen
17. `app/(tabs)/dream-goal.tsx` — display + edit dream goal

### Phase 7: Settings + Notifications
18. `src/notifications/notificationService.ts`
19. `app/(tabs)/settings.tsx` — name, notification time, about section
20. Wire notification scheduling to settings changes and app launch

**Why notifications last:** They require device permissions and are harder to test; core loop should be stable before adding notification complexity.

### Dependency Graph Summary

```
database.ts → migrations.ts → repositories → stores → screens
dateUtils.ts ──────────────────────────────► useWinsStore
examplePrompts.ts ────────────────────────► Home screen
notificationService.ts ──────────────────► Settings screen (Phase 7)
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| SQLite schema design | HIGH | Standard relational patterns; `date_key` approach is established |
| expo-sqlite v2 async API | MEDIUM | Training data covers SDK 51/52; verify `runAsync`/`getFirstAsync` against installed version |
| Zustand store pattern | HIGH | Stable library, pattern is well-established |
| Expo Router file structure | MEDIUM-HIGH | SDK 52 file conventions from training; verify tab group file names against installed version |
| Notification architecture | MEDIUM | expo-notifications API was stable at training cutoff; verify scheduling API for recurring daily notifications |
| Convex migration path | MEDIUM | Pattern is correct; specific Convex schema API should be verified at V2 design time |

---

## Sources

- PROJECT.md (primary context)
- Training data: expo-sqlite v14 async API (Expo SDK 51-52), Expo Router v3, Zustand v4, expo-notifications v0.28+, Convex schema conventions
- Note: External documentation (WebFetch/WebSearch) was unavailable during this research run. All expo-specific API claims should be validated against official Expo SDK docs before implementation begins.

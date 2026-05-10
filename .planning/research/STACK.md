# Stack Research — Winning Streak

**Researched:** 2026-05-08
**Knowledge cutoff:** August 2025 (no live web/docs access during this research run)
**Verification required:** Expo SDK version, exact package versions, Convex SDK v2 status — see confidence notes per section

---

## Executive Summary

Winning Streak is a local-first daily journaling app targeting iOS and Android via Expo. The V1 stack is deliberately minimal: Expo SDK + Expo Router for navigation, expo-sqlite (with Drizzle ORM) for structured local persistence, expo-notifications for daily reminders, NativeWind for styling, and Zustand for lightweight ephemeral state. The data model is designed from day one to migrate cleanly to Convex tables in V2.

---

## Recommended Stack

### Core Framework

**Expo SDK 52** (verify: may be 53 by May 2026)

- **Why Expo over bare React Native:** Managed workflow covers push notifications, SQLite, and build/OTA updates without native ejection. This is the right call for a solo/small-team app shipping to both platforms simultaneously.
- **Managed Workflow:** Use Expo Go for development, EAS Build for production. Do not eject to bare workflow — nothing in this app requires it.
- **New Architecture:** Expo 52+ ships with the React Native New Architecture (Fabric renderer + JSI bridging) enabled by default. Do not disable it. expo-sqlite and expo-notifications both support it.
- **EAS:** Use EAS Build (cloud) + EAS Update (OTA). Free tier is sufficient for V1.

Confidence: MEDIUM — SDK 52 was current at knowledge cutoff (Aug 2025). By May 2026 SDK 53 may be out. Verify at https://docs.expo.dev before initializing project.

---

### Local Storage

**expo-sqlite v14+ with Drizzle ORM**

This app has structured relational data (wins, days, streak metadata, dream goal) that benefits from SQL queries — grouping wins by date, counting streaks, filtering history. MMKV is the wrong tool here.

**Why expo-sqlite over MMKV:**
- Win history needs `GROUP BY date`, `COUNT`, `ORDER BY` — SQL is the right abstraction
- Drizzle ORM provides type-safe queries, schema migrations, and a migration runner that works in React Native
- expo-sqlite v14 introduced a synchronous/async API redesign that works well with the New Architecture
- Schema designed as flat Convex-compatible tables makes V2 migration straightforward

**Why NOT MMKV:**
- MMKV is a key-value store; modeling relational data in it requires manual indexing
- No migration tooling — schema changes require manual data transforms
- Harder to query: "show all wins from last 30 days" is a scan, not a query
- MMKV is correct for settings/preferences (user display name, notification time) — use it there

**Why NOT AsyncStorage:**
- Deprecated pattern for anything beyond trivial use
- No structured query capability
- Significantly slower than MMKV or SQLite for read-heavy operations

**Split approach (recommended):**
- `expo-sqlite` + Drizzle: wins table, streak state, dream goal
- `expo-secure-store` or MMKV: user settings (notification time, display name) — simple key-value, no ORM needed

**Drizzle ORM:**
- `drizzle-orm` + `drizzle-kit` for migrations
- expo-sqlite Drizzle adapter: `drizzle-orm/expo-sqlite`
- Migration pattern: bundle SQL migration files, run `migrate()` on app startup

Confidence: HIGH for expo-sqlite + Drizzle being the right architecture. MEDIUM on exact version numbers (verify drizzle-orm version at https://orm.drizzle.team).

---

### Navigation

**Expo Router v4** (file-based routing)

- **Why Expo Router over React Navigation directly:** Expo Router is now the official first-party navigation solution. It wraps React Navigation with file-based routing, typed routes, and deep link handling out of the box. For a new project in 2025+, there is no reason to use bare React Navigation.
- **Tab structure:** Bottom tab navigator lives at `app/(tabs)/_layout.tsx`. Four tabs matching the design: Home, My Wins, Dream Goal, Settings.
- **Typed routes:** Enable `typedRoutes: true` in `app.json` — gives TypeScript autocomplete on `router.push()` calls.
- **Stack within tabs:** Each tab can push stack screens (e.g., edit win, settings subpages) using nested `_layout.tsx` files.

```
app/
  (tabs)/
    _layout.tsx        ← tab bar definition
    index.tsx          ← Home (log a win)
    wins.tsx           ← My Wins history
    dream-goal.tsx     ← Dream Goal
    settings.tsx       ← Settings
  _layout.tsx          ← root layout (fonts, providers)
```

Confidence: HIGH — Expo Router v3 was stable at knowledge cutoff; v4 likely current by May 2026. File-based routing pattern is stable and correct.

---

### State Management

**Zustand for ephemeral UI state; expo-sqlite as source of truth**

The wins/streak data lives in SQLite. Do not mirror it into a global store — derive it with queries. Zustand handles UI-only concerns:

- Current input field text
- Active tab / modal state  
- Today's entry session state (is the user mid-session?)
- Loading/error UI state

**Why Zustand over Redux/Jotai/Context:**
- Zero boilerplate for a small app
- No providers needed (though a `ZustandProvider` pattern works if required)
- Works well alongside TanStack Query for async data fetching from SQLite

**TanStack Query (React Query) for SQLite data layer:**
- Use `useQuery` with custom `queryFn` that runs Drizzle queries
- Provides caching, background refresh, and loading states for free
- Invalidate queries after mutations (log win, update streak)
- This gives you a predictable read/write pattern that maps directly to Convex's `useQuery`/`useMutation` hooks in V2 — migration is mostly swapping queryFn implementations

Confidence: HIGH — this pattern (Zustand + TanStack Query + SQLite) is the established local-first pattern in the Expo community as of Aug 2025.

---

### Push Notifications

**expo-notifications**

- The only choice for managed Expo workflow. Handles both local notifications (for daily reminders) and push tokens (for future server-sent pushes in V2).
- For V1, use **local scheduled notifications** — no server required. Schedule a repeating daily notification at user's configured time.
- Request permission on first meaningful interaction (after first win logged), not on app launch.
- Store notification token in SQLite/MMKV — needed in V2 when Convex backend sends push via Expo Push API.

**Key patterns:**
```typescript
// Schedule daily reminder
await Notifications.scheduleNotificationAsync({
  content: { title: "What was your win today?", body: "Keep your streak alive." },
  trigger: { hour: 20, minute: 0, repeats: true },
})
```

- Cancel and reschedule when user changes reminder time in Settings.
- `expo-notifications` requires adding notification permissions to `app.json` under `ios.infoPlist` and `android.permissions`.

Confidence: HIGH — expo-notifications is stable and the standard approach. API shape may have minor changes; verify trigger types at https://docs.expo.dev/versions/latest/sdk/notifications/.

---

### UI / Styling

**NativeWind v4 (Tailwind CSS for React Native)**

- **Why NativeWind over StyleSheet:** Design has specific color palette (cream, gold, orange), consistent spacing, and reusable component styles. NativeWind eliminates the verbose StyleSheet pattern and makes the Tailwind mental model work in React Native.
- **NativeWind v4** uses CSS variables and is compatible with the New Architecture. v2 is deprecated; v4 is the current release.
- **Custom theme:** Define the brand colors (`winning-orange`, `winning-gold`, `winning-cream`) in `tailwind.config.js`.
- **Component library:** Do NOT install a heavy component library (Tamagui, UI Kitten, React Native Paper) — the design is custom and these add complexity without benefit for this scope. Build components from scratch with NativeWind.
- **Animations:** `react-native-reanimated` (ships with Expo, already a dependency of Expo Router). Use for streak counter animations, win entry feedback. Do not add Moti or Lottie unless needed — `reanimated` alone covers this app's animation needs.

Confidence: MEDIUM — NativeWind v4 was in active development at knowledge cutoff. Verify current stable version before installing.

---

### Date Handling

**date-fns v3**

- **Why date-fns:** Streak logic requires date arithmetic (is today consecutive with yesterday? how many days since last entry?). date-fns provides tree-shaken, immutable date utilities.
- **Why NOT moment.js:** 300KB bundle, mutable, deprecated pattern.
- **Why NOT dayjs:** Slightly less TypeScript ergonomics than date-fns v3; either works but date-fns is more idiomatic in the TypeScript React Native community.
- **Key functions used:** `isSameDay`, `differenceInCalendarDays`, `startOfDay`, `format`, `parseISO`.
- **Timezone note:** Store wins as UTC timestamps in SQLite. Display in local timezone using `date-fns` with the device locale. Do NOT use `new Date()` math for streak calculation — use `differenceInCalendarDays` to avoid midnight boundary bugs.

Confidence: HIGH — date-fns v3 is stable and correct for this use case.

---

### Future Backend (V2)

**Convex**

Convex V2 is the target backend. Design now to migrate cleanly:

**Schema mapping (SQLite → Convex):**
```
wins table        → wins Convex table
  id              → _id (Convex auto)
  text            → text: string
  created_at      → createdAt: number (Unix ms)
  date_key        → dateKey: string ("2026-05-08")

streak table      → computed server-side in V2, not stored
dream_goal        → dreamGoal Convex document per user
```

**What to avoid in V1 to ease V2 migration:**
- Do not use auto-increment integer IDs in SQLite as foreign keys — use UUID strings that map to Convex `_id` patterns
- Do not store computed values (streak count) — derive them in queries
- Keep `dateKey` as a `"YYYY-MM-DD"` string column — Convex queries can filter on this directly

**Convex SDK for React Native (when V2 arrives):**
- `convex` npm package + `ConvexProvider` wrapping the app
- `useQuery(api.wins.list)` and `useMutation(api.wins.create)` replace TanStack Query queryFns
- Real-time subscriptions come for free — streak updates across devices without polling

Confidence: MEDIUM for Convex V2 — was in public beta/recent release at knowledge cutoff. Verify current Convex React Native support at https://docs.convex.dev before V2 planning.

---

## What NOT to Use

| Library | Reason to Avoid |
|---------|-----------------|
| **Redux / Redux Toolkit** | Massive overkill for this app's state complexity. Zustand serves the same purpose with 10% of the boilerplate. |
| **React Native Paper / UI Kitten / Tamagui** | Pre-built component libraries fight the custom design. You'll spend more time overriding than building. Use NativeWind + custom components. |
| **MMKV as primary store** | Key-value store cannot query relational win history. Correct only for settings. |
| **AsyncStorage** | Deprecated pattern. Slow. No query capability. Use expo-sqlite or MMKV. |
| **Moment.js** | Mutable, ~300KB, deprecated. Use date-fns. |
| **WatermelonDB** | Correct for large-scale offline-first apps with complex sync. Overkill here — adds significant setup complexity for a simple schema. |
| **Realm** | MongoDB-owned, heavy dependency. expo-sqlite + Drizzle is simpler and sufficient. |
| **React Navigation directly** | Expo Router wraps it with better DX. No reason to use the lower-level API on a new project. |
| **Lottie** | Heavy animation library. react-native-reanimated covers this app's animation needs. |
| **Bare React Native (no Expo)** | Ejecting loses managed push notifications, OTA updates, and EAS. Nothing in this app requires native code that Expo can't handle. |

---

## Confidence Levels

| Area | Confidence | Notes |
|------|------------|-------|
| Expo SDK version | MEDIUM | SDK 52 at cutoff; 53 may be current. Verify before init. |
| expo-sqlite + Drizzle | HIGH | Established pattern, stable API |
| Expo Router file structure | HIGH | Stable since v3; verify v4 changes if any |
| NativeWind v4 | MEDIUM | Was in active dev at cutoff; verify stable release |
| Zustand + TanStack Query | HIGH | Stable, widely used in this pattern |
| expo-notifications | HIGH | Stable API; verify trigger type signatures |
| date-fns v3 | HIGH | Stable, correct choice |
| Convex V2 integration | MEDIUM | Verify current React Native SDK support before V2 planning |

---

## Installation Sketch (V1)

```bash
# Bootstrap
npx create-expo-app@latest winning-streak --template blank-typescript

# Navigation
npx expo install expo-router

# Storage
npx expo install expo-sqlite
npm install drizzle-orm drizzle-kit

# State
npm install zustand @tanstack/react-query

# Notifications
npx expo install expo-notifications expo-device

# Styling
npm install nativewind
npm install -D tailwindcss

# Date handling
npm install date-fns

# Settings storage (key-value)
npx expo install expo-secure-store
```

Note: Run `npx expo install` (not `npm install`) for Expo SDK packages — it pins compatible versions automatically.

---

## Sources

- Training data (August 2025 cutoff) — no live documentation was accessible during this research run
- Verify current SDK/package versions at:
  - https://docs.expo.dev/versions/latest/
  - https://orm.drizzle.team/docs/get-started/expo-new
  - https://www.nativewind.dev
  - https://docs.convex.dev/client/react-native

# Walking Skeleton — Winning Streak

**Phase:** 1
**Generated:** 2026-05-08

## Capability Proven End-to-End

A developer launches the Winning Streak app on iOS Simulator and sees the 4-tab navigation shell backed by a live SQLite database — a win can be inserted via the repository layer, read back with a UUID id and a correct local YYYY-MM-DD date_key, and the data persists across app restarts.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Expo SDK 55 (managed workflow) + Expo Router v4 (file-based) | Cross-platform iOS + Android from one codebase; managed workflow eliminates native build config; Expo Router is the current standard for new Expo projects (SDK 52+) |
| Data layer | expo-sqlite v2 + Drizzle ORM 0.45.x (`drizzle-orm/expo-sqlite`) with `useMigrations` hook | Structured queries needed for streak logic and date-grouped history; Drizzle provides type-safe SQL with migration versioning; expo-sqlite v2 is the SDK 55 standard (v1 API removed) |
| Auth | None in V1 | Local-first free app; no accounts; data lives on device; V2 will add Convex + Apple Sign-In |
| Deployment target | `npx expo start` for development; EAS Build (dev/preview/production profiles) for native testing | Expo Go works for development iteration; EAS dev build required for push notifications (Phase 5) |
| Directory layout | `app/(tabs)/` for routes; `src/db/`, `src/utils/`, `src/stores/`, `src/constants/` for business logic | Expo Router file-based routing convention; `src/` separates business logic from route files |
| State management | Zustand 5.x for ephemeral UI state; SQLite (Drizzle) as source of truth | Zustand avoids full subtree re-renders; all persistent state lives in SQLite and is hydrated into stores |
| Styling | NativeWind v4 (4.2.3) + Tailwind CSS v3 + Nunito font + warm palette | Tailwind utility classes on React Native primitives; v4 stable (v5 is pre-release); Reanimated pinned to 3.19.5 — NativeWind v4 requires v3 |
| UUID generation | `expo-crypto.randomUUID()` | Bundled in Expo SDK 55; cryptographically secure; works in managed workflow without extra packages; V2 Convex compatibility (string PKs map cleanly to Convex `_id`) |
| Date handling | `Intl.DateTimeFormat("en-CA").format(date)` for `date_key` | Produces `YYYY-MM-DD` in device LOCAL time; immune to UTC-offset streak bugs; Hermes-compatible |

## Stack Touched in Phase 1

- [x] Project scaffold — Expo SDK 55, TypeScript, Expo Router, all Phase 1 dependencies
- [x] Routing — 4-tab bottom navigator (`app/(tabs)/index|wins|goal|settings.tsx`)
- [x] Database — SQLite initialized via `useMigrations`; wins table write (`insertWin`) and read (`getWins`) verified
- [x] UI — 4 placeholder screens with NativeWind warm palette and Nunito font; tab bar fully styled
- [x] Deployment — `npx expo start --clear` runs full stack locally; EAS config (`eas.json`) ready for native builds

## Schema Contract

All subsequent phases build on this schema without breaking changes (additive V2 columns already present):

### `wins` table
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | TEXT (UUID) | NOT NULL | Primary key; `Crypto.randomUUID()` |
| `text` | TEXT | NOT NULL | Win content (200 char limit enforced at UI layer Phase 2) |
| `date_key` | TEXT | NOT NULL | `YYYY-MM-DD` local time via `toDateKey()` |
| `logged_at` | TEXT | NOT NULL | ISO 8601 wall-clock timestamp |
| `created_at` | TEXT | NOT NULL | Auto-set via `$defaultFn` |
| `synced_at` | TEXT | **nullable** | V2: timestamp when synced to Convex |
| `remote_id` | TEXT | **nullable** | V2: Convex `_id` after sync |
| `category` | TEXT | **nullable** | V2: AI-assigned category |

### `dream_goal` table
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | TEXT | NOT NULL | Always `"singleton"` — one goal per device |
| `text` | TEXT | NOT NULL | Goal content (500 char limit enforced Phase 4) |
| `updated_at` | TEXT | NOT NULL | Auto-updated on upsert |

### `settings` table
| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `key` | TEXT | NOT NULL | Primary key (e.g., `"reminder_time"`, `"display_name"`) |
| `value` | TEXT | NOT NULL | String value |
| `updated_at` | TEXT | NOT NULL | Auto-updated on upsert |

## Key Invariants (from CLAUDE.md — never violate)

1. **Timezone-safe dates:** All `date_key` values stored as `YYYY-MM-DD` in device LOCAL time via `toDateKey()` — never `date.toISOString().slice(0,10)`
2. **UUID PKs:** All table primary keys are UUID strings — never integer auto-increment
3. **No in-app AI calls:** V1 is a free app — no per-request API costs
4. **No guilt language:** Zero shame/punishment copy anywhere
5. **30-day notification window:** Phase 5 only — never schedule all future notifications at once

## Out of Scope (Deferred to Later Slices)

- Win entry UI (Phase 2)
- Streak display and calculation UI (Phase 2)
- Win history screen (Phase 3)
- Dream Goal screen (Phase 4)
- Push notifications + settings screen (Phase 5)
- Onboarding flow (Phase 6)
- App Store submission (Phase 7)
- Accounts, cloud sync, AI categorization (V2)

## Subsequent Slice Plan

Each phase adds one vertical slice on top of this skeleton:

- Phase 2: User can type a win, tap "Add", end session with "I'm done for today", and see their streak on the Home screen
- Phase 3: User can browse all wins grouped by date with collapsible day sections and a total wins count
- Phase 4: User can write, save, and edit a Dream Goal that persists across restarts
- Phase 5: User receives daily push reminders at a configurable time and can manage settings
- Phase 6: New user completes a 3-screen onboarding flow; all emotional states use encouraging copy
- Phase 7: App is live on App Store and Google Play

## Assumption Log (carry forward)

| # | Assumption | Risk | Resolution Path |
|---|------------|------|-----------------|
| A1 | NativeWind v4 (4.2.3) works with Expo SDK 55 + Reanimated 3.19.5 | NativeWind v4 may have deeper incompatibilities with RN 0.83 New Architecture | Upgrade to `nativewind@preview` (v5.0.0-preview.3) if animation crashes occur |
| A2 | `tabs@sdk-55` template uses `app/` not `src/app/` for routes | Template may use `src/app/` layout requiring path reference updates | After scaffold, check and rename if needed |
| A3 | `Crypto.randomUUID()` is synchronous (returns string not Promise) | Issue #24021: some SDK versions returned Promise | Verify return type in first insertWin call |

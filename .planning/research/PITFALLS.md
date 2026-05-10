# Pitfalls Research — Winning Streak

**Domain:** Expo local-first daily habit app (iOS + Android)
**Researched:** 2026-05-08
**Confidence note:** WebSearch, WebFetch, and Bash were unavailable in this session. All findings are from training data (cutoff ~Aug 2025) covering Expo SDK 51-53, expo-sqlite v2, React Native ecosystem patterns. Confidence is rated per item. Verify high-stakes items against current Expo docs before implementing.

---

## Critical Pitfalls (Will Break the App)

### 1. Streak Timezone Bug — Comparing Dates Without User's Local Time

**What goes wrong:** Streak calculated by comparing `date()` or epoch milliseconds in UTC. A user in UTC-5 who logs a win at 11:00 PM local time has it stored as the next UTC day. Their "today" win shows under tomorrow's date, creating phantom missed days and streak resets that never happened.

**Why it happens:** SQLite `datetime('now')` returns UTC. JavaScript `new Date()` is UTC internally. `new Date().toISOString()` is always UTC. Developers store `created_at` as UTC epoch and later compare dates as if they're local.

**Consequences:** Streak resets incorrectly; users with winning habits see their streak drop to 0; one-star reviews; uninstalls. The bug is invisible in development (developer is often in the same timezone as server default).

**Prevention:**
- Store `local_date` as a plain `TEXT` column in `YYYY-MM-DD` format computed at write time from the user's device locale: `new Intl.DateTimeFormat('en-CA').format(new Date())` returns `YYYY-MM-DD` in local time.
- Never derive "what day is today" from UTC epoch arithmetic.
- Streak query: `SELECT COUNT(DISTINCT local_date) FROM wins WHERE ... ORDER BY local_date` — compare string dates, not timestamps.
- Test with device timezone set to UTC-12 and UTC+14 (the two extremes).

**Detection (warning signs):** Works fine in local testing; users in non-UTC timezones report streaks resetting; wins appear on wrong day in history.

**Phase:** Address in Phase 1 (data model). Retrofitting this into an existing schema requires a migration and risks data corruption.

---

### 2. iOS Push Notification Scheduling Limit — 64 Notifications Cap

**What goes wrong:** iOS enforces a hard limit of 64 locally scheduled notifications per app. If you schedule a daily reminder naively — e.g., one notification per day for the next year — you'll hit this limit immediately. iOS silently drops anything beyond 64; the user stops receiving reminders with no error.

**Why it happens:** Developers schedule `365` daily notifications on first setup using a loop with `Notifications.scheduleNotificationAsync()`. Works on Android (no equivalent limit), silently fails on iOS.

**Consequences:** iOS users stop receiving habit reminders after ~64 days. Impossible to debug from the app side; users just stop being reminded and drop off.

**Prevention:**
- Schedule only the next 30–60 daily notifications at a time (stay under 64, leave headroom for other app notifications).
- Re-schedule on app foreground: in `AppState` change listener (`active` state), cancel and re-schedule the next 30 days of reminders. This ensures the queue never empties.
- Use a `useEffect` + `AppState` listener pattern to top up the queue every time the app is opened.
- Reserve some of the 64 slots if you ever add milestone notifications ("You're at 7 days!").

**Detection:** Works perfectly in the first two months; users stop getting reminders. Not reproducible in Expo Go or short test periods.

**Phase:** Address in notification phase. Do not schedule arbitrarily-far-future notifications.

---

### 3. expo-sqlite v2 Async Migration — Breaking Change from v1

**What goes wrong:** expo-sqlite v2 (Expo SDK 52+) replaced the synchronous API with an entirely async API. Code written for v1 (`db.transaction()`, `db.executeSql()`) does not work. This affects every tutorial, Stack Overflow answer, and blog post written before late 2024.

**Why it happens:** v1 used synchronous SQLite calls on the JS thread (causing UI jank). v2 runs on a dedicated SQLite thread with async/await. The surface APIs are incompatible.

**Consequences:** Copying pre-2024 expo-sqlite code causes runtime errors. The TypeScript types look different enough to catch obvious mistakes, but subtle patterns (nested transactions, error handling) can fail silently.

**Prevention:**
- Use only `expo-sqlite` v14+ (ships with Expo SDK 52+) docs and examples.
- Preferred API: `SQLiteDatabase.execAsync()`, `runAsync()`, `getAllAsync()`, `getFirstAsync()`.
- Use `useSQLiteContext()` hook with `<SQLiteProvider>` for component-level access.
- Use `drizzle-orm` with the expo-sqlite adapter — Drizzle handles migrations and provides type-safe queries. This is the community-recommended pattern as of 2024-2025.
- Do NOT use `expo-sqlite/legacy` unless migrating a pre-existing app.

**Detection:** Runtime errors like "db.transaction is not a function"; TypeScript errors on method signatures; crashes on first database access.

**Phase:** Address in Phase 1 (data model + storage foundation). Use Drizzle + expo-sqlite v2 from day one.

---

### 4. Database Migration Strategy — No Built-in Versioning

**What goes wrong:** expo-sqlite v2 has no built-in migration runner. Developers manually check `PRAGMA user_version` or add a `migrations` table, then write ad-hoc upgrade code. When schema changes are needed (V2 adds `category` column for AI tagging), the migration code either crashes on older schemas, runs twice, or doesn't run at all.

**Why it happens:** SQLite itself has `PRAGMA user_version` but provides no migration infrastructure. Most mobile apps start with no migration plan and add one retroactively after breaking a production release.

**Consequences:** App crashes on update for users with existing data; data loss; forced uninstall-reinstall as workaround.

**Prevention:**
- Use `drizzle-orm` with `drizzle-kit` — generates SQL migrations and runs them at app start via `migrate()`. This is the correct approach for expo-sqlite v2.
- Set `PRAGMA user_version` from day one and always migrate upward.
- Never run `DROP TABLE` in a migration unless you have confirmed it's safe (add a guard on schema version).
- V1 schema must be designed with V2 extensibility in mind: `wins` table should include `category TEXT`, `synced_at INTEGER`, `remote_id TEXT` as nullable columns from day one so adding them later is `ALTER TABLE ADD COLUMN` (safe) rather than a table restructure.

**Detection:** App starts crashing after an OTA update or App Store update for a subset of users (those who opened the app previously).

**Phase:** Address in Phase 1. The V1→V2 Convex migration will require all V1 users to have clean, versioned local schemas.

---

### 5. OTA Update Inconsistency — JS Bundle Updated, Native Modules Not

**What goes wrong:** Expo's OTA (EAS Update / `expo-updates`) pushes new JavaScript bundles to users silently. If a new JS bundle references a native module that was added or updated in a newer native build, the app crashes on launch for users who haven't updated via the App/Play Store.

**Why it happens:** OTA can only update JS. Adding new Expo SDK modules (e.g., `expo-haptics`, a new native library), bumping `expo` major version, or changing native config (permissions, entitlements) requires a full native build. Developers push OTA thinking it's safe when it's not.

**Consequences:** Crash-on-launch for users on older native builds; effectively breaks the app until they update via store.

**Prevention:**
- Understand the boundary: OTA is safe for UI changes, bug fixes, logic changes, and new JS-only code.
- OTA is NOT safe for: adding/removing native modules, changing `app.json` native config (permissions, bundle ID, etc.), SDK major version upgrades.
- Use `runtimeVersion` in `eas.json` / `app.json` to pin OTA updates to compatible native builds. Increment `runtimeVersion` whenever you do a native build with breaking changes.
- Set `"updates": { "fallbackToCacheTimeout": 0 }` for faster cold starts, but understand implications.
- Test OTA updates by installing the production build on a device before pushing to all users.

**Detection:** Post-update crash reports from users on older installs; Sentry/Crashlytics shows JS bundle version mismatch errors; user reviews "app stopped working after update."

**Phase:** Address in EAS/deployment setup phase. Configure `runtimeVersion` from first native build.

---

## Moderate Pitfalls (Will Hurt Quality)

### 6. Streak Query Performance — Full Table Scan on Win History

**What goes wrong:** Streak calculation queries `SELECT DISTINCT local_date FROM wins ORDER BY local_date DESC` and then counts consecutive days in JavaScript. With 1000+ wins over 3 years, this becomes slow enough to cause visible UI delay on the home screen streak counter.

**Prevention:**
- Add index: `CREATE INDEX idx_wins_local_date ON wins(local_date)`.
- Cache computed streak in a `user_stats` table (`current_streak INT`, `last_win_date TEXT`, `total_wins INT`) and update it transactionally when a win is inserted. Home screen reads from `user_stats` (single row read), never re-computes the full streak on render.
- Calculate streak incrementally on insert: if `last_win_date = yesterday`, increment `current_streak`; if `last_win_date = today`, no change; if older, reset to 1.

**Phase:** Address in Phase 1 (data model). Retrofitting requires a migration.

---

### 7. Android Push Notification Permissions — Exact Alarm Restriction

**What goes wrong:** Android 12+ introduced `SCHEDULE_EXACT_ALARM` permission, and Android 13+ requires runtime permission for push notifications (`POST_NOTIFICATIONS`). Expo's default setup handles `POST_NOTIFICATIONS` but the exact alarm behavior varies by device manufacturer. On some Samsung/Xiaomi devices, battery optimization kills scheduled alarms unless the user explicitly exempts the app.

**Why it happens:** Android's battery optimization (`Doze` mode, per-app battery restrictions) delays or cancels pending alarms for apps the OS deems inactive. Expo's `scheduleNotificationAsync` uses `AlarmManager` under the hood which is subject to these restrictions.

**Prevention:**
- Request `POST_NOTIFICATIONS` runtime permission (Android 13+) explicitly at first-launch onboarding, not buried in settings.
- In settings, provide a prompt: "For reliable reminders, allow Winning Streak to run in the background" with a link to battery optimization settings.
- Use `expo-notifications` channel with `IMPORTANCE_HIGH` on Android to maximize delivery reliability.
- Accept ~80-85% delivery reliability on Android as the realistic ceiling; do not over-engineer for perfection.

**Detection:** Android users report not receiving reminders; iOS users do. Issue is device/OEM-specific, not reproducible on Pixel/emulator.

**Phase:** Notification phase. Document the Android battery caveat in user-facing help text.

---

### 8. React Native FlatList Performance — Win History Screen

**What goes wrong:** `My Wins` screen renders all wins grouped by date. A naive implementation using a nested `ScrollView` with date groups and individual win items will cause significant jank when the user has 500+ wins — all items are rendered even when off-screen.

**Prevention:**
- Use `SectionList` (not `ScrollView` + `map`). `SectionList` is the correct RN primitive for grouped, scrollable data with `sections` prop mapping directly to date-grouped wins.
- Use `keyExtractor` returning the win's database ID (not index).
- Implement `getItemLayout` if item height is fixed — eliminates layout measurement overhead.
- For collapsible sections: track expanded state in a `Set` of dates (not an object per win). Toggle collapses the section, not individual items.
- Initial render: show only the last 30 days. Load more with `onEndReached`.

**Phase:** Win history screen phase.

---

### 9. State Management Boilerplate Trap — Redux/Zustand Over-engineering

**What goes wrong:** Developers add Redux Toolkit or Zustand for an app where all data lives in SQLite and the UI is simple (4 tabs, 1 modal). The state layer becomes a cache that can diverge from the database, causing stale reads, double-writes, and complex sync logic.

**Prevention:**
- For Winning Streak V1: use React Query (TanStack Query) + expo-sqlite. React Query handles caching, background refresh, and stale data. Database is source of truth; React Query is the read cache.
- Alternatively: Drizzle's `useLiveQuery()` hook (if using Drizzle ORM) provides reactive queries — the component re-renders when the underlying data changes.
- Avoid: duplicating SQLite data into Zustand/Redux store. One source of truth.
- Global UI state (modals, theme) can use simple `useContext` or Zustand (lightweight). Keep it separate from data state.

**Phase:** Architecture/foundation phase — decision made early, hard to retrofit.

---

### 10. app.json Permission Bloat — Triggering App Store Review

**What goes wrong:** Expo's default `app.json` template includes permission declarations that the app doesn't use. On iOS, unused permissions included in `Info.plist` (via `expo.ios.infoPlist`) can trigger App Store review questions or, in edge cases, rejection if Apple finds declared permissions that are never exercised.

**Prevention:**
- Winning Streak needs: `NSUserNotificationsUsageDescription` only (for push reminders).
- Explicitly exclude all other permissions in `app.json`: set `android.permissions` to only what's needed (`RECEIVE_BOOT_COMPLETED` for rescheduling notifications after reboot, `POST_NOTIFICATIONS`).
- Use `expo-build-properties` plugin to prune unused permissions from the native build.
- Review generated `AndroidManifest.xml` and `Info.plist` in the first native build before submitting.

**Phase:** EAS/first native build phase.

---

### 11. Midnight Boundary Edge Case — "Did User Log Today?"

**What goes wrong:** The app checks "has the user logged a win today?" to show either the entry screen or the "you're done" confirmation. This check runs when the app opens. If the user's phone clock is near midnight and the comparison is sloppy (e.g., comparing ISO strings with different formats), wins logged just before midnight show as "yesterday" when the app reopens just after midnight.

**Prevention:**
- "Today" check: `local_date = today_date_string` where both are `YYYY-MM-DD` in device local time. Consistent format eliminates comparison edge cases.
- Do not use `Date.setHours(0,0,0,0)` midnight epoch comparisons — DST transitions can make "midnight" 23:00 or 01:00 UTC.
- Test by manually advancing device clock past midnight with the app backgrounded, then foregrounding it.

**Phase:** Core loop / streak logic phase.

---

## Minor Pitfalls (Annoying but Manageable)

### 12. Expo Go Development Limitations

**What goes wrong:** Certain Expo features do not work in Expo Go: push notification tokens are sandbox tokens that behave differently from production, background tasks have limited support, and native config changes (permissions, entitlements) require a dev build.

**Prevention:**
- Set up a development build (EAS Build with `--profile development`) early — ideally before testing notifications or SQLite-heavy features.
- Expo Go is fine for early UI prototyping; switch to dev build before any notification or storage testing.

**Phase:** Phase 1 setup — run `eas build --profile development` before serious feature work begins.

---

### 13. SQLite Database Not Accessible Between App Reinstalls

**What goes wrong:** SQLite database file lives in the app's sandboxed directory. On iOS, uninstalling the app deletes the database. On Android, it depends on whether backup is enabled. Users who reinstall lose all their streak history and wins — catastrophic for a habit app with V1's local-only model.

**Prevention:**
- For V1 (local-only): clearly communicate in onboarding that data is device-local and not backed up. Set user expectation early.
- Enable iOS iCloud backup for the SQLite file via `expo-file-system` + appropriate `SQLiteOpenOptions` (Expo SQLite v2 stores the DB in `FileSystem.documentDirectory` which is included in iCloud backup by default on iOS — verify this in the native build).
- Android: configure `android:allowBackup="true"` in `AndroidManifest.xml` (Expo default) so Android backup includes the DB file.
- V2 (Convex sync): solves this completely, but V2 is explicitly out of scope.

**Phase:** Phase 1 (data model) + onboarding phase.

---

### 14. Hermes Engine Compatibility

**What goes wrong:** React Native's default JS engine (Hermes) has occasional differences from V8/JavaScriptCore for edge cases in `Intl` support, `Date` parsing, and certain regex patterns. `new Date('2024-01-15')` in Hermes parses as UTC midnight (not local midnight), which is a timezone pitfall amplifier.

**Prevention:**
- Never use `new Date('YYYY-MM-DD')` string parsing — always use `new Date(year, month-1, day)` constructor form which is local time, or better: use a date library like `date-fns` (no timezone manipulation needed for YYYY-MM-DD string comparison approach recommended in Pitfall #1).
- Test with Hermes explicitly (it is the default in all Expo builds; Expo Go also uses Hermes).

**Phase:** Core loop phase.

---

### 15. EAS Build Credential Rotation Surprise

**What goes wrong:** EAS manages iOS signing certificates and provisioning profiles. When a certificate expires (typically after 1 year), EAS can automatically rotate it — but if you have multiple EAS projects or a misconfigured team, the new certificate may not be trusted by already-installed development builds, causing "Untrusted Developer" errors.

**Prevention:**
- Use EAS-managed credentials (the default). Let EAS handle rotation.
- Document the Apple Developer account credentials used and keep them in a password manager.
- Set a calendar reminder to check EAS credential status 30 days before expiry.

**Phase:** EAS setup / App Store submission phase.

---

### 16. App Store Keyword Stuffing in Metadata — Rejection Risk

**What goes wrong:** Habit-tracking apps in competitive categories (Health & Fitness, Productivity) are tempted to stuff keywords into the app name, subtitle, or description. Apple's App Store Review Guidelines explicitly reject keyword stuffing in the app name field and reject apps that reference competitors by name.

**Prevention:**
- App name: "Winning Streak" — clean, no keyword stuffing.
- Subtitle (30 chars): something like "Daily Wins Journal" — descriptive, not stuffed.
- Keywords field (100 chars): use the keyword field, not the title/subtitle, for keyword strategy.
- Privacy policy URL is required for any app that collects personal data. Even with local-only storage, the app collects wins text — provide a real privacy policy URL, not a placeholder.
- For a habit/journaling app: ensure the app description does not make medical or mental health claims ("reduce anxiety", "treat depression") — these trigger additional review scrutiny under healthcare guidelines.

**Phase:** App Store submission phase.

---

## Expo-Specific Gotchas

### EAS Build Profiles vs. Expo Go

`development` profile builds use the Expo Dev Client (full debugger, fast refresh). `preview` builds are ad-hoc distributed (TestFlight/Internal Testing equivalent). `production` builds go to the stores. Keep all three configured in `eas.json` from day one — switching profiles later is easy but setting up credentials for the first time takes an afternoon.

### expo-updates and Cold Start Delay

By default, `expo-updates` checks for a new bundle on every cold start and waits up to 30 seconds before loading the cached bundle. In production habit apps, this creates an unacceptable cold start delay. Set `checkAutomatically: "ON_ERROR_RECOVERY"` or `"NEVER"` and implement a manual update check in the background instead. The common pattern: check for update on `AppState` change to `active`, download in background, prompt user to restart when ready.

### Android Back Button Behavior

React Navigation handles the hardware back button on Android, but habit apps with modal flows (win entry modal) need to explicitly handle `BackHandler` to dismiss modals gracefully rather than popping the entire stack. Add `BackHandler` listeners in any modal screen component.

### Expo SDK Upgrade Cadence

Expo releases a new SDK roughly every 6 months, with ~2 SDK versions supported at a time. SDK upgrades often require updating `app.json`, native dependencies, and occasionally fixing breaking changes in Expo modules. Don't fall more than 1 major version behind — catching up across 2+ SDK versions requires significant effort and may invalidate EAS builds.

### metro.config.js and SVG Support

If the design uses SVG assets (the trophy motif, mascot illustrations), `react-native-svg` requires a Metro transformer configuration. This is not automatic and is commonly forgotten until the first native build, causing asset display failures. Configure `metro.config.js` for SVG support before the design assets are integrated.

---

## Phase Warnings

| Phase Topic | Most Likely Pitfall | Mitigation |
|-------------|---------------------|------------|
| Data model / SQLite setup | Timezone-naive date storage; no migration strategy | Store `local_date` as TEXT; use Drizzle ORM; add `synced_at`/`category` columns as nullable from day one |
| Core streak logic | UTC date comparison; midnight boundary; Hermes Date parsing | Use YYYY-MM-DD string comparison in local time; test in UTC-12 and UTC+14 |
| Notifications | iOS 64-notification limit; Android battery optimization | Schedule 30-day window, top up on app foreground; document Android caveat |
| Win history screen | FlatList/ScrollView jank on large datasets | Use SectionList from the start; implement pagination |
| EAS / first native build | Permission bloat; OTA/runtimeVersion misconfiguration; Expo Go limitations | Audit permissions early; configure runtimeVersion; set up dev build before notification testing |
| App Store submission | Metadata rejection; missing privacy policy; healthcare claim language | Prepare privacy policy URL; review keyword fields; avoid medical claims |
| State management | Over-engineering; SQLite/store divergence | Use React Query + expo-sqlite or Drizzle live queries; no Redux for V1 |

---

## Sources

- Confidence: MEDIUM-HIGH. Derived from training data covering Expo SDK 51-53 (expo-sqlite v2 API, expo-notifications scheduling, EAS build system), React Native performance patterns, iOS/Android platform constraints (iOS 64-notification limit is documented Apple behavior, Android Doze/battery optimization is well-documented), and App Store Review Guidelines.
- Items most at risk of being outdated: exact expo-sqlite v2 API surface (verify against https://docs.expo.dev/versions/latest/sdk/sqlite/); EAS credential rotation behavior (may have improved); Android exact alarm permission handling (changes with Android API level targets).
- Verify before Phase 1: expo-sqlite v2 Drizzle integration docs; `useLiveQuery` availability; `runtimeVersion` policy behavior in current EAS.

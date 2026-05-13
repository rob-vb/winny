# Phase 5: Notifications + Settings - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 delivers the **daily notification system** + the **Settings tab** screen. The habit anchor (daily reminder) goes in, and the user gains control over reminder time, display name, and access to About content.

**In scope:**
- `expo-notifications` integration: permission flow, scheduling primitives, AppState listener for queue refresh
- Rolling 30-day notification queue with cancel-all-and-reschedule strategy
- `app/(tabs)/settings.tsx` — full screen replacement (currently a 15-line placeholder), sectioned list (Reminders / Profile / About)
- Reminder time picker via `@react-native-community/datetimepicker` (modal bottom sheet trigger)
- Display name inline-editable row
- About sub-screens / external links: How It Works (in-app), Privacy + Terms (external via `expo-web-browser`), Rate App (`expo-store-review`), Share App (RN `Share` API)
- Notification copy pool: 5–8 rotating prompt strings, picked deterministically by `hash(date)`
- Settings keys for: `reminder_time` (HH:mm 24h), `reminder_enabled` (boolean), `display_name` (string), `notification_permission_status` (mirror of OS state)

**Out of scope:**
- New repository methods — `getSetting()` / `setSetting()` already exist; only new keys are added
- Notification deeplinks / handling tap-to-open (V2 if needed; default open behavior is fine)
- Push notifications from server (V1 is local-only — `expo-notifications` local schedule)
- Onboarding's first-run permission step (Phase 6 wires onboarding around the same primitives)
- Project-wide rename from "Winning Streak" → "Just Keep Winning" (Phase 7 / store submission — see deferred)
- Full Privacy / Terms legal copy + hosting (Phase 7 prereq — stubs wired now)
- Encouragement copy system (Phase 6 — notification pool is a 5–8 string seed here; full copy system later)

</domain>

<decisions>
## Implementation Decisions

### Permission Flow (NOTF-01)

- **D-01:** **Permission prompt fires inline immediately after the first win save** — hook in the win-save handler (likely `useWinsStore.addWin` or `WinInputArea`). Gates on `notification_permission_status === undetermined` setting key.
- **D-02:** **Silent deny path.** If user denies, no retry, no nag. Settings reminder section greys out the time row with a "Notifications disabled — Enable in iOS Settings" affordance that opens the OS settings page via `Linking.openSettings()`.

### Notification Copy (NOTF-02)

- **D-03:** **Rotating pool of 5–8 encouraging prompts**, seeded in this phase. Pool selection is deterministic: `pool[hash(date_key) % pool.length]` so each scheduled day picks predictably. Full pool expansion happens in Phase 6's copy system.
- **D-04:** **Title = `"Just Keep Winning"`, body = pool prompt.** Note: app currently named "Winning Streak" in `app.json` / `PROJECT.md` — Phase 5 uses `"Just Keep Winning"` as the notification title constant; project-wide rename is a separate Phase 7 task (see deferred).
- **D-05:** **No name personalization in V1 notification body** — keeps pool simple, no fallback path needed. Display name lives in Settings but isn't injected into notification copy yet. (Future enhancement deferred.)

### Rolling 30-Day Scheduling (NOTF-03, NOTF-04)

- **D-06:** **Window depth = exactly 30 days.** Schedules today's reminder (if still in future) + next 29 days. Safe headroom under iOS 64-notification cap.
- **D-07:** **Top-up trigger = AppState `'active'`.** Listener attached at root layout; fires on cold start AND every background→foreground transition. NOTF-04 satisfied literally.
- **D-08:** **Cancel-all + re-schedule next 30** on every top-up. Idempotent. Automatically picks up any reminder time change or pool update. `Notifications.cancelAllScheduledNotificationsAsync()` then schedule loop.
- **D-09:** **Reminder time change → same cancel+reschedule path.** Settings save handler triggers immediate re-schedule with new time. Show toast / inline confirmation "Reminders set for {time}".
- **D-10:** **First-time defaults after permission grant:** `reminder_enabled = true`, `reminder_time = "20:00"` (8:00 PM local). Trigger initial schedule immediately.

### Settings Screen Layout

- **D-11:** **Sectioned list** (Reminders / Profile / About). Each section has a header. Rows = `label + value + chevron` pattern (iOS Settings convention).
- **D-12:** **Time picker = `@react-native-community/datetimepicker`** opened as a modal bottom sheet on row tap. Display shows current time in 12h locale format (e.g. "8:00 PM"); persistence stored as 24h `HH:mm` string.
- **D-13:** **Display name = inline-editable row.** Tap row → label collapses, `TextInput` focuses in place, save on blur or return. No modal, no sub-screen. (Mirrors the Phase 4 Goal edit aesthetic — minimal friction.)

### About Section (SET-03)

- **D-14:** **How It Works → in-app screen** (sub-route `settings/how-it-works` or modal stack). Content rendered from a local React component (paragraphs + section headers). No network.
- **D-15:** **Privacy Policy + Terms of Use → external URLs** opened via `expo-web-browser` (`WebBrowser.openBrowserAsync`). In-app browser keeps user inside the app shell. URLs stubbed with placeholder constants this phase; real URLs slotted in before store submission (Phase 7 prereq).
- **D-16:** **Rate App = `expo-store-review`.** Calls `StoreReview.requestReview()` on iOS (native in-app sheet, throttled by OS) with fallback to App Store URL via `Linking` if unavailable. New dependency.
- **D-17:** **Share App = React Native `Share` API** (built-in, no new dep). Share content: short message + App Store URL (stub until Phase 7). Title "Just Keep Winning".

### Claude's Discretion

- Exact 5–8 notification copy strings (warm, forward-looking, no guilt — seed examples: "What was your win today?", "One small win counts.", "Time to notice what's working.")
- Visual style of the Settings row (height, divider, chevron icon — match iOS Settings feel with the warm palette)
- How It Works copy outline (3–5 sections: What this is / The streak / Wins / Dream Goal / Why no AI yet)
- Whether to add a master "Reminders" toggle row above the time row (recommended: yes, but Claude can implement without re-asking)
- Share App message text (warm, brief, e.g. "I've been using Just Keep Winning to log my daily wins — it's quietly great. {storeURL}")
- Time picker locale handling (use device locale via DateTimePicker default behavior)
- AppState listener placement (`app/_layout.tsx` is the established convention)
- Storage key naming conventions for new settings rows

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, no-guilt invariant, V2 migration notes
- `.planning/REQUIREMENTS.md` — NOTF-01..04, SET-01..03 (Phase 5 active requirements)
- `.planning/ROADMAP.md` §"Phase 5: Notifications + Settings" — goal + 4 success criteria
- `CLAUDE.md` — 30-day notification window invariant, no-guilt copy invariant, EAS Build requirement (notifications not testable in Expo Go)

### Phase 1 Decisions (settings storage + EAS)
- `.planning/phases/01-data-foundation-nav-shell/01-CONTEXT.md` — D-05 (settings k/v table), D-08 (EAS dev profile already configured for native notification testing)

### Phase 2 Decisions (win-save hook target)
- `.planning/phases/02-core-win-entry-loop/02-CONTEXT.md` — `useWinsStore.addWin` pattern, orange CTA style, Reanimated conventions

### Phase 4 Decisions (inline-edit pattern reference)
- `.planning/phases/04-dream-goal/04-CONTEXT.md` — D-01/D-02 view↔edit toggle reference for Settings name row

### Existing Code Phase 5 Builds On
- `app/(tabs)/settings.tsx` — current 15-line placeholder; Phase 5 replaces entirely
- `app/_layout.tsx` — root layout; AppState listener attaches here
- `src/db/repositories/settings.ts` — `getSetting(key)` / `setSetting(key, value)` ready; new keys added without schema change
- `src/db/schema.ts` — `settings` table (key TEXT PK, value TEXT) — no migration needed
- `src/stores/useWinsStore.ts` — first-win-save hook point for NOTF-01 permission trigger
- `src/constants/theme.ts` — warm palette + Nunito for Settings UI
- `app.json` — currently `"name": "Winning Streak"` (rename to "Just Keep Winning" deferred to Phase 7)
- `eas.json` — `development` profile already set; required for `expo-notifications` runtime testing
- `package.json` — `expo-web-browser` already present; `expo-notifications`, `@react-native-community/datetimepicker`, `expo-store-review` are NEW deps

### Critical Invariants (CLAUDE.md)
- 30-day rolling notification window (iOS 64 cap) — invariant #5 in CLAUDE.md
- No-guilt copy in notification body — invariant #4
- No in-app AI calls — notification copy is static pool, no LLM
- NativeWind className utilities for Settings UI (no `StyleSheet.create`)
- Native build required for testing — `eas build --profile development` not Expo Go

### External Library Docs (downstream researcher should fetch)
- `expo-notifications` — local scheduling API, permission flow, iOS 64 cap nuances
- `@react-native-community/datetimepicker` — controlled mode + bottom sheet pattern
- `expo-store-review` — `isAvailableAsync()` + `requestReview()` + fallback to store URL
- `expo-web-browser` — `openBrowserAsync` options
- React Native `Share` API (`react-native` core) — `Share.share({message, url, title})`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getSetting(key)` / `setSetting(key, value)` (`src/db/repositories/settings.ts`) — ready; just add new keys (`reminder_time`, `reminder_enabled`, `display_name`, `notification_permission_status`)
- Settings k/v table — no migration needed
- `expo-web-browser` already in `package.json` (was added in Phase 1)
- Reanimated for any subtle row transitions (already pinned 3.19.5)
- `Ionicons` available via `@expo/vector-icons` — for chevrons, settings icons (bell, person, info)
- `useEffect` mount-load pattern from Goal/Wins screens for reading initial settings values

### Established Patterns
- NativeWind className utilities only (no StyleSheet.create)
- `SafeAreaView className="flex-1 bg-background"` as screen root
- Local component state + `useEffect` for async DB reads
- Orange `#F5A623` for CTAs / active state
- Inline view↔edit toggle (Phase 4 GoalEditor) — apply to display name row
- Root layout (`app/_layout.tsx`) is where global listeners attach

### Integration Points
- `app/_layout.tsx` — add AppState listener at root (NOTF-04)
- Win-save handler (likely in `useWinsStore`) — add permission trigger hook (NOTF-01); use `notification_permission_status` setting key as one-shot guard
- `app/(tabs)/settings.tsx` — full replacement
- New folder `src/notifications/` for scheduling logic (`scheduleNext30Days`, `cancelAll`, `requestPermission`, `pickPromptForDate`)
- New folder `src/components/settings/` for row primitives (`SettingsRow`, `SettingsSection`, `TimePickerRow`, `EditableNameRow`)
- About sub-screens via expo-router file routes (`app/settings/how-it-works.tsx` etc.) or local modal stack — planner picks based on navigation feel

</code_context>

<specifics>
## Specific Ideas

- **Notification timing:** Default 8:00 PM local. Stored as `"20:00"` 24h string in settings; converted to/from `Date` for the picker.
- **First permission UX:** Right after first win save — user just felt the reward, opt-in rate is highest here.
- **Settings sections (in order):** Reminders (toggle + time row) → Profile (display name row) → About (How It Works → Privacy → Terms → Rate App → Share App).
- **Notification pool seed (Claude to finalize 5–8):** warm, forward-looking, no guilt. Examples — "What was your win today?", "One small win counts.", "Time to notice what's working.", "Your dream is built daily.", "Add one win — that's enough."
- **Rate App fallback URL:** stub constant `APP_STORE_URL` in `src/constants/links.ts` (placeholder until Phase 7).
- **Privacy + Terms URLs:** stub constants `PRIVACY_URL` and `TERMS_URL` in same `src/constants/links.ts`.
- **AppState listener pattern:** subscribe in `_layout.tsx` mount effect; on `'active'` call the top-up function; unsubscribe on unmount.

</specifics>

<deferred>
## Deferred Ideas

- **Project-wide rename "Winning Streak" → "Just Keep Winning"** — touches `app.json`, `PROJECT.md`, store metadata, app icon copy. Belongs in Phase 7 (App Store submission). For Phase 5, only the notification title constant uses the new name.
- **Notification body with display name personalization** — "Hey {name}, ..." — adds fallback complexity. Revisit after copy system in Phase 6.
- **Notification deeplink / tap-to-route** — open directly to win entry screen. Currently OS default open-app behavior is fine. V2 enhancement.
- **Real Privacy Policy + Terms of Use content + hosting** — Phase 7 prereq. Stubs wired this phase.
- **App Store rating prompt frequency tuning** — `expo-store-review` is OS-throttled; can add custom logic later (e.g. after N-day streak milestone).
- **Encouragement copy system** — Phase 6 builds the full 40–60 string copy bank across 15–20 message states. Phase 5's 5–8 notification pool is a seed.
- **Reminder snooze / pause** — temporarily disable reminders without losing the configured time. Out of scope for V1.

</deferred>

---

*Phase: 5-Notifications + Settings*
*Context gathered: 2026-05-13*

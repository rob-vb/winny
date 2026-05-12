# Roadmap: Winning Streak

**Total Phases:** 7
**Requirements Covered:** 29 / 29

## Overview

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-----------------|
| 1 | Data Foundation + Nav Shell | 1/1 | Complete   | 2026-05-08 |
| 2 | Core Win-Entry Loop | 5/5 | Complete   | 2026-05-10 |
| 3 | Win History | 3/4 | In Progress|  |
| 4 | Dream Goal | Users can write, save, and edit a Dream Goal that frames their progress | GOAL-01, GOAL-02, GOAL-03 | 3 |
| 5 | Notifications + Settings | Users receive daily reminders and control their experience | NOTF-01, NOTF-02, NOTF-03, NOTF-04, SET-01, SET-02, SET-03 | 4 |
| 6 | Onboarding + Copy System | New users are welcomed correctly and all emotional states use encouraging copy | ONBD-01, ONBD-02, COPY-01, COPY-02 | 4 |
| 7 | EAS Build + App Store Submission | App is live on the App Store and Google Play | — | 3 |

## Phases

- [x] **Phase 1: Data Foundation + Nav Shell** — SQLite schema, Drizzle ORM, migration runner, tab navigation shell (completed 2026-05-08)
- [x] **Phase 2: Core Win-Entry Loop** — Win entry, streak display, session completion; primary value loop complete (completed 2026-05-10)
- [ ] **Phase 3: Win History** — My Wins screen with date-grouped, collapsible win list
- [ ] **Phase 4: Dream Goal** — Dream Goal tab with save, display, and edit
- [ ] **Phase 5: Notifications + Settings** — Daily reminders, AppState top-up, reminder time picker, display name, about section
- [ ] **Phase 6: Onboarding + Copy System** — Welcome flow, Dream Goal onboarding, full encouragement copy across all message states
- [ ] **Phase 7: EAS Build + App Store Submission** — EAS build configuration, TestFlight, App Store and Play Store submission

## Phase Details

### Phase 1: Data Foundation + Nav Shell
**Goal:** A working app skeleton backed by a correct, migration-safe SQLite schema that will never require a breaking change to support streak logic or V2 migration
**Mode:** mvp
**Plans:** 1/1 plans complete
**Requirements:**
- FNDTN-01: App initializes SQLite database with Drizzle ORM on first launch
- FNDTN-02: All dates stored as timezone-safe `YYYY-MM-DD` local date strings (never UTC timestamps for day-boundary logic)
- FNDTN-03: All primary keys are UUID strings (Convex migration compatibility)
- FNDTN-04: Schema includes nullable `synced_at`, `remote_id`, and `category` columns from day one (V2 migration path)
**Success Criteria:**
1. App launches on a physical device (or EAS dev build simulator) without crashing and displays the bottom tab navigation with four tabs
2. A win can be inserted and queried via the Drizzle repository layer with a `date_key` that matches the device's local calendar date — verified at UTC-12 and UTC+14
3. A migration adding a new column runs cleanly on a second launch without data loss
4. UUIDs are generated for all new rows (no integer auto-increment IDs appear in any table)
**Dependencies:** None
**Research flags:** Verify expo-sqlite v14 async API surface and Drizzle expo-sqlite adapter `migrate()` pattern before starting
**UI hint**: yes

Plans:
- [x] 01-01-PLAN.md — Walking Skeleton: project scaffold, NativeWind config, Drizzle schema + migrations, root layout, 4-tab nav shell, repository layer

### Phase 2: Core Win-Entry Loop
**Goal:** Users can open the app, log one or more wins, see rotating example prompts, end their session, and immediately see their current streak and total wins count — the entire core value loop is functional
**Mode:** mvp
**Plans:** 5/5 plans complete
**Requirements:**
- WIN-01: User can type a free-text win (1–200 characters)
- WIN-02: Win entry screen shows 3 non-tappable example prompts (inspiration only), rotating daily from a pool of 40–50 curated prompts
- WIN-03: User can add multiple wins in one session without leaving the screen
- WIN-04: User taps "I'm done for today" to end session and sees a summary of all wins logged today
- STREAK-01: Home screen shows current streak (consecutive days with ≥1 win logged) prominently
- STREAK-02: Streak resets to 0 if user logs no wins for a calendar day
- STREAK-03: Total wins counter always grows, never resets; shown on Home and My Wins screens
- STREAK-04: Streak display uses encouraging labels (e.g., "You're on fire!") — no guilt or punishment language
**Success Criteria:**
1. User opens the app and sees the "What was your win today?" prompt with 3 example prompts that do not change mid-day but change the following day
2. User types a win, taps add, types a second win, and both appear in the session without navigating away
3. User taps "I'm done for today" and sees a summary screen listing every win logged in the session
4. Home screen shows a streak count that correctly reflects consecutive calendar days with at least one win, computed from the device's local date
5. Missing a full calendar day resets the streak to 0; total wins counter never decreases
**Dependencies:** Phase 1
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md — Test scaffold + pure utilities: Jest setup, streakLabel, promptUtils, examplePrompts + unit tests (Wave 1)
- [x] 02-02-PLAN.md — Trophy asset + Zustand store: assets/images/trophy.png, useWinsStore (Wave 1, parallel)
- [x] 02-03-PLAN.md — UI components: StreakHeader, WinCard, ExamplePrompts, WinInputArea (Wave 2)
- [x] 02-04-PLAN.md — Home screen assembly: full app/(tabs)/index.tsx replacement (Wave 3)
- [x] 02-05-PLAN.md — Human verification checkpoint: automated checks + interactive E2E (Wave 4)

### Phase 3: Win History
**Goal:** Users can review everything they have ever logged, grouped by date with collapsible day groups and a prominent total wins count, giving them proof that they are already winning
**Mode:** mvp
**Plans:** 3/4 plans executed
**Requirements:**
- HIST-01: My Wins screen shows all wins grouped by date, newest first (SectionList)
- HIST-02: Each date group shows win count badge and is individually collapsible
- HIST-03: Total wins count displayed prominently at top of My Wins screen
**Success Criteria:**
1. My Wins tab shows all logged wins grouped by date, newest group at the top, without performance degradation at 200+ wins
2. Tapping a date group header collapses or expands that day's wins independently of other groups
3. Each date group header shows the number of wins for that day
4. Total wins count is visible at the top of the screen before the list begins
**Dependencies:** Phase 2
**UI hint**: yes

Plans:
- [x] 03-01-PLAN.md — formatDateKey utility + historyUtils unit tests (Wave 1)
- [x] 03-02-PLAN.md — HistoryHeroHeader + DateSectionHeader components (Wave 1, parallel)
- [x] 03-03-PLAN.md — WinsScreen assembly: SectionList + collapse state + empty state (Wave 2)
- [ ] 03-04-PLAN.md — Human verification checkpoint (Wave 3)

### Phase 4: Dream Goal
**Goal:** Users can write, save, and later edit a personal Dream Goal that is framed motivationally, anchoring every win to something they care about
**Mode:** mvp
**Requirements:**
- GOAL-01: User can write and save a Dream Goal (up to 500 characters)
- GOAL-02: Dream Goal screen frames the goal motivationally ("You're building your dream one win at a time")
- GOAL-03: User can edit and update their Dream Goal at any time
**Success Criteria:**
1. User navigates to the Dream Goal tab, types a goal up to 500 characters, and saves it — the goal persists across app restarts
2. The Dream Goal screen displays the motivational framing copy alongside the saved goal (or a prompt to add one if not yet set)
3. User can tap to edit their existing Dream Goal, update the text, and save the change — the new text is shown immediately
**Dependencies:** Phase 2
**UI hint**: yes

### Phase 5: Notifications + Settings
**Goal:** Users receive a daily push reminder at their chosen time and can control their display name, reminder schedule, and find app information — the habit anchor is in place
**Mode:** mvp
**Requirements:**
- NOTF-01: App requests notification permission after user logs their first win (never on first open)
- NOTF-02: Daily push reminder fires at user-configurable time (default 8:00 PM local)
- NOTF-03: Notification queue uses a rolling 30-day scheduling window (avoids iOS 64-notification ceiling)
- NOTF-04: App refreshes notification queue every time it foregrounds (AppState listener)
- SET-01: User can set and update daily reminder time
- SET-02: User can set a display name
- SET-03: Settings includes About section: How Winning Streak Works, Privacy Policy, Terms of Use, Rate App, Share App
**Success Criteria:**
1. Notification permission prompt does not appear on first app open; it appears after the user completes their first "I'm done for today" session
2. A notification fires at the configured time on both iOS and Android (verified via EAS dev build)
3. After 30+ days of use, no notification is silently dropped due to the iOS 64-notification limit — the AppState listener has topped up the queue within the rolling window
4. Settings screen shows reminder time picker, display name field, and a working About section with all five links/actions
**Dependencies:** Phase 2
**Research flags:** Verify expo-notifications recurring daily trigger syntax; confirm iOS 64-notification rolling window pattern; verify Android `POST_NOTIFICATIONS` permission in current Expo managed workflow
**UI hint**: yes

### Phase 6: Onboarding + Copy System
**Goal:** A new user's first experience is welcoming and frictionless, and every emotional state in the app — first win, streaks, misses, comebacks — uses copy that encourages rather than shames
**Mode:** mvp
**Requirements:**
- ONBD-01: New user sees minimal onboarding flow (max 3 screens: welcome → Dream Goal setup → first win prompt)
- ONBD-02: User can skip Dream Goal setup during onboarding and set it later
- COPY-01: App includes copy for all key emotional states: first win ever, streak milestones (7, 30, 100 days), comeback after a miss, session complete, long streak
- COPY-02: Zero guilt/shame language anywhere in the app — all miss/reset states use encouraging, forward-looking copy
**Success Criteria:**
1. A fresh install shows the welcome screen, then a skippable Dream Goal setup screen, then deposits the user on the win entry screen — maximum 3 taps from cold launch to first win logged
2. Skipping Dream Goal during onboarding works; the user can return to the Dream Goal tab later and set it without friction
3. Streak milestone messages (7, 30, 100 days) appear in the app at the correct thresholds with encouraging copy
4. A streak reset triggers a "comeback" message with no guilt or punishment language — verified by reading every miss/reset state in the app
**Dependencies:** Phase 5
**UI hint**: yes

### Phase 7: EAS Build + App Store Submission
**Goal:** The app is reviewed, approved, and publicly available on the App Store and Google Play
**Mode:** mvp
**Requirements:** None (all 29 v1 requirements delivered in Phases 1–6; this phase is the deployment gate)
**Success Criteria:**
1. App passes App Store review and is publicly available on the iOS App Store
2. App passes Google Play review and is publicly available on the Google Play Store
3. A fresh install from either store completes the full onboarding flow and logs a first win without errors
**Dependencies:** Phase 6
**Research flags:** Verify current EAS `runtimeVersion` docs and App Store metadata requirements (privacy policy URL, permission strings, no medical language) before first native build

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Data Foundation + Nav Shell | 1/1 | Complete | 2026-05-08 |
| 2. Core Win-Entry Loop | 5/5 | Complete | 2026-05-10 |
| 3. Win History | 0/4 | Planned | — |
| 4. Dream Goal | 0/? | Not started | — |
| 5. Notifications + Settings | 0/? | Not started | — |
| 6. Onboarding + Copy System | 0/? | Not started | — |
| 7. EAS Build + App Store Submission | 0/? | Not started | — |

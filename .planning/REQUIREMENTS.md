# Requirements: Winning Streak

**Defined:** 2026-05-08
**Core Value:** A frictionless daily habit of noticing wins — the streak counter and history prove you're already winning.

## v1 Requirements

### Data Foundation

- [x] **FNDTN-01**: App initializes SQLite database with Drizzle ORM on first launch
- [x] **FNDTN-02**: All dates stored as timezone-safe `YYYY-MM-DD` local date strings (never UTC timestamps for day-boundary logic)
- [x] **FNDTN-03**: All primary keys are UUID strings (Convex migration compatibility)
- [x] **FNDTN-04**: Schema includes nullable `synced_at`, `remote_id`, and `category` columns from day one (V2 migration path)

### Onboarding

- [ ] **ONBD-01**: New user sees minimal onboarding flow (max 3 screens: welcome → Dream Goal setup → first win prompt)
- [ ] **ONBD-02**: User can skip Dream Goal setup during onboarding and set it later

### Win Entry

- [ ] **WIN-01**: User can type a free-text win (1–200 characters)
- [ ] **WIN-02**: Win entry screen shows 3 non-tappable example prompts (inspiration only), rotating daily from a pool of 40–50 curated prompts
- [ ] **WIN-03**: User can add multiple wins in one session without leaving the screen
- [~] **WIN-04**: User taps "I'm done for today" to end session and sees a summary of all wins logged today — **Overridden by D-03.** No session-lock button. Always-open calendar-day model satisfies intent: today's wins always visible inline.

### Streak & Stats

- [ ] **STREAK-01**: Home screen shows current streak (consecutive days with ≥1 win logged) prominently
- [ ] **STREAK-02**: Streak resets to 0 if user logs no wins for a calendar day
- [ ] **STREAK-03**: Total wins counter always grows, never resets; shown on Home and My Wins screens
- [ ] **STREAK-04**: Streak display uses encouraging labels (e.g., "You're on fire! 🔥") — no guilt or punishment language

### Win History

- [ ] **HIST-01**: My Wins screen shows all wins grouped by date, newest first (SectionList)
- [ ] **HIST-02**: Each date group shows win count badge and is individually collapsible
- [ ] **HIST-03**: Total wins count displayed prominently at top of My Wins screen

### Dream Goal

- [ ] **GOAL-01**: User can write and save a Dream Goal (up to 500 characters)
- [ ] **GOAL-02**: Dream Goal screen frames the goal motivationally ("You're building your dream one win at a time")
- [ ] **GOAL-03**: User can edit and update their Dream Goal at any time

### Notifications

- [ ] **NOTF-01**: App requests notification permission after user logs their first win (never on first open)
- [ ] **NOTF-02**: Daily push reminder fires at user-configurable time (default 8:00 PM local)
- [ ] **NOTF-03**: Notification queue uses a rolling 30-day scheduling window (avoids iOS 64-notification ceiling)
- [ ] **NOTF-04**: App refreshes notification queue every time it foregrounds (AppState listener)

### Settings

- [ ] **SET-01**: User can set and update daily reminder time
- [ ] **SET-02**: User can set a display name
- [ ] **SET-03**: Settings includes About section: How Winning Streak Works, Privacy Policy, Terms of Use, Rate App, Share App

### Copy System

- [ ] **COPY-01**: App includes copy for all key emotional states: first win ever, streak milestones (7, 30, 100 days), comeback after a miss, session complete, long streak
- [ ] **COPY-02**: Zero guilt/shame language anywhere in the app — all miss/reset states use encouraging, forward-looking copy

## v2 Requirements

### Accounts & Sync

- **ACCT-01**: User can create account with email and password
- **ACCT-02**: User can sign in with Apple (required for App Store)
- **ACCT-03**: Local wins history syncs to Convex on account creation
- **ACCT-04**: User can access wins from multiple devices

### AI Categorization

- **AI-01**: App automatically categorizes each win (health, work, relationships, mindset, etc.)
- **AI-02**: Category tags visible on win history items
- **AI-03**: App detects when same win category appears 3+ days and surfaces a pattern prompt

### Personalization

- **PERS-01**: Example prompts personalize to user's win history after 7+ days of use
- **PERS-02**: Cold-start users see generic pool; warm-start users see category-weighted prompts

### Collective Layer

- **COLL-01**: Wins are anonymously aggregated server-side
- **COLL-02**: App surfaces collective insights ("28k people logged a rest win this week")
- **COLL-03**: New users see example prompts ranked by what people like them actually win at

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mood tracking | Different product category; dilutes wins-only value prop |
| Task / to-do integration | Pulls app toward generic habit tracker; kills differentiation |
| Category / tag UI in V1 | Raw text only in V1; AI categorizes offline via Claude Code |
| Calendar view | Date-grouped list is sufficient; calendar adds complexity without V1 value |
| In-app AI calls | Free app; per-request cost is prohibitive. External tooling only in V1. |
| Social feed / in-app sharing | Not core to habit loop; nice-to-have |
| Google Sign-In | No auth in V1; add only with account system |
| Streaks that never reset | Streak resets on miss (habit motivation); "no punishment" = tone, not mechanics |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDTN-01 | Phase 1 | Complete |
| FNDTN-02 | Phase 1 | Complete |
| FNDTN-03 | Phase 1 | Complete |
| FNDTN-04 | Phase 1 | Complete |
| WIN-01 | Phase 2 | Complete |
| WIN-02 | Phase 2 | Complete |
| WIN-03 | Phase 2 | Complete |
| WIN-04 | Phase 2 | Overridden by D-03 |
| STREAK-01 | Phase 2 | Complete |
| STREAK-02 | Phase 2 | Complete |
| STREAK-03 | Phase 2 | Complete |
| STREAK-04 | Phase 2 | Complete |
| HIST-01 | Phase 3 | Pending |
| HIST-02 | Phase 3 | Pending |
| HIST-03 | Phase 3 | Pending |
| GOAL-01 | Phase 4 | Pending |
| GOAL-02 | Phase 4 | Pending |
| GOAL-03 | Phase 4 | Pending |
| NOTF-01 | Phase 5 | Pending |
| NOTF-02 | Phase 5 | Pending |
| NOTF-03 | Phase 5 | Pending |
| NOTF-04 | Phase 5 | Pending |
| SET-01 | Phase 5 | Pending |
| SET-02 | Phase 5 | Pending |
| SET-03 | Phase 5 | Pending |
| ONBD-01 | Phase 6 | Pending |
| ONBD-02 | Phase 6 | Pending |
| COPY-01 | Phase 6 | Pending |
| COPY-02 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-08*
*Last updated: 2026-05-08 after roadmap creation*

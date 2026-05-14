# Winning Streak

## What This Is

Winning Streak is a daily wins journaling app based on Charlie Rocket's "Winning Streak" method. Once per day (or more), the app asks "What was your win today?" — users type free text, log as many wins as they want, and build a streak by logging at least one win daily. No punishment messaging — encouragement only. Wins accumulate into a personal history that will later power AI-driven pattern recognition and collective insights.

## Core Value

A frictionless daily habit of noticing wins — the streak counter and history prove you're already winning.

## Requirements

### Validated

**Foundation (validated in Phase 1: Data Foundation + Nav Shell)**
- [x] expo-sqlite v2 + Drizzle ORM is the right local storage choice — structured queries across dates work correctly; migration runner (`useMigrations`) is safe and additive
- [x] UUID string PKs via expo-crypto work correctly in Hermes runtime; drizzle-kit requires global `crypto` in schema `$defaultFn` (esbuild limitation) — runtime inserts use `expo-crypto` via `generateId()`
- [x] `Intl.DateTimeFormat("en-CA")` produces timezone-safe `YYYY-MM-DD` local dates — correct invariant for streak logic
- [x] NativeWind v4 + Reanimated v3 (pinned 3.19.5) + Expo SDK 55 is a working configuration (structural verification — runtime UAT deferred)

### Active

**Core Loop**
- [ ] User can log one or more free-text wins per day (no character minimum, 200 char max per win)
- [ ] App shows "What was your win today?" as the primary prompt
- [ ] Win entry screen shows 3 rotating example prompts from a pool of 40–50 (rotate daily, non-tappable, inspiration only)
- [ ] User can add multiple wins in one session; "I'm done for today" ends the session
- [ ] Wins are stored locally on device (no account required)

**Streak**
- [ ] Daily streak counter tracks consecutive days with at least one win logged
- [ ] Streak resets to 0 if user misses a day (no log = miss)
- [ ] Total wins counter always grows, never resets
- [x] Encouraging tone throughout — no shame/guilt messaging for missed days *(validated Phase 6)*

**Win History** *(validated in Phase 3: Win History — 2026-05-12)*
- [x] My Wins screen shows all wins grouped by date, newest first
- [x] Each date group is collapsible, shows win count for that day
- [x] Total wins count displayed prominently (e.g. "167 Total Wins")

**Dream Goal**
- [ ] User can write and save a long-form Dream Goal (up to 500 chars)
- [ ] Dream Goal screen displays current goal with motivational framing ("You're building your dream one win at a time")
- [ ] User can edit and update their Dream Goal at any time

**Notifications**
- [ ] Daily push reminder at user-configurable time (default 8:00 PM)
- [ ] Reminder prompts user to log today's win

**Settings**
- [ ] Daily reminder time configurable
- [ ] User can set display name
- [ ] About section: How Winning Streak Works, Privacy Policy, Terms of Use, Rate App, Share App

### Out of Scope

- **Accounts / auth** — Not needed for V1. Data is local. Add later when syncing to Convex + collective layer.
- **Cloud sync** — Follows account addition (V2+). Design data model to migrate cleanly.
- **In-app AI categorization** — Free app; AI calls have cost. External Claude Code tooling will categorize wins. Wire AI into app in V2+.
- **AI pattern detection ("same win 3+ days?")** — V2+ feature after AI categorization is built.
- **Personalized examples** — Cold start = generic pool. Personalization tied to AI categorization (V2+).
- **Collective insights** — "28k people logged a rest win this week" — V2+ requires user accounts and backend aggregate queries.
- **Social sharing** — Nice-to-have but not core to the habit loop.
- **Google Sign-In** — V1 has no auth; add Apple Sign-In when accounts are introduced (App Store requirement).

## Context

- Based on Charlie Rocket's "Winning Streak" method — tone and framing matter as much as functionality.
- Design: warm cream/white background, gold trophy motif, orange CTAs, rocket+astronaut mascot. Bottom tab nav: Home, My Wins, Dream Goal, Settings. See design mockup (provided by user during init).
- V1 is pure local-first: SQLite or MMKV on device. No network requests except push notification tokens.
- V2 introduces Convex backend + auth, migrating local data to cloud. Design local schema to map cleanly to Convex tables.
- Platform: iOS + Android via Expo (latest). Ship both simultaneously.
- Example prompts pool: 40–50 curated prompts. Static in V1. Will become AI-personalized in V2+.
- Streak UX note: Streak resets on a missed day (standard mechanics), but messaging is always encouraging — "You're on fire!", not "You broke your streak!"

## Constraints

- **Tech Stack**: Expo (latest) — cross-platform iOS + Android
- **Local Storage**: SQLite (expo-sqlite) or MMKV — pick based on query complexity needed
- **No Backend (V1)**: Zero network calls except push notification registration
- **Budget**: Free app — no per-request AI costs in V1
- **Future Compatibility**: Data model must support clean migration to Convex when accounts are added

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-first for V1 | Free app, no auth friction, ship faster | — Pending |
| Multiple wins per day | Core loop allows unlimited wins; one question = entry point not limit | — Pending |
| Streak resets on miss | Encourages daily habit; "no punishment" = tone, not mechanics | — Pending |
| Dream Goal in V1 | Core to Charlie Rocket philosophy — wins build toward something | — Pending |
| No in-app AI in V1 | Cost constraint; categorization done offline via Claude Code | — Pending |
| Convex for V2 backend | Real-time sync + collective aggregation queries; matches data model needs | — Pending |
| Expo Router `Redirect` for onboarding gate | Declarative, render-safe gating vs imperative `router.replace`; completion subscription in repository avoids redirect race back to Welcome | — Phase 6 |
| Centralized copy catalog (`src/copy/catalog.ts`) | Single typed source-of-truth for emotional tone; no-guilt audit runnable against one file | — Phase 6 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-14 after Phase 6*

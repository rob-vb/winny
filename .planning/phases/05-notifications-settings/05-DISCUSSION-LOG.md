# Phase 5: Notifications + Settings - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 5-Notifications + Settings
**Areas discussed:** Permission timing + notification copy, Time picker + Settings layout, About section + links, Rolling 30-day scheduling

---

## Permission timing + notification copy

### Q1 — When does the OS permission prompt fire (NOTF-01)?

| Option | Description | Selected |
|--------|-------------|----------|
| Right after first win saves | Inline in win-save handler. Highest opt-in moment. | ✓ |
| On the session summary screen | After "I'm done for today" on first session. | |
| On next foreground after first win | Defer 1 cycle. Loses momentum. | |

**User's choice:** Right after first win saves

### Q2 — Deny path?

| Option | Description | Selected |
|--------|-------------|----------|
| Silent — no retry, Settings toggle disabled | Honor denial, show "Enable in iOS Settings" link. | ✓ |
| Soft re-prompt next first-win-of-day | One retry, then never again. | |
| Show "Enable in Settings" deeplink immediately | Linking to OS settings. | |

**User's choice:** Silent — no retry; Settings toggle disabled

### Q3 — Notification body copy strategy?

| Option | Description | Selected |
|--------|-------------|----------|
| Rotating pool of 5–8 strings | Variety, deterministic by hash(date). | ✓ |
| Single fixed string | "What was your win today?" — stale after a week. | |
| Pool + display name slot | Personal but needs fallback. | |

**User's choice:** Rotating pool of 5–8 strings (no name personalization in V1)

### Q4 — Title vs body split?

| Option | Description | Selected |
|--------|-------------|----------|
| Title=app name, body=prompt | Standard convention. | ✓ |
| Title=prompt, no body | Punchier but loses app affordance. | |
| Title=emoji+streak count, body=prompt | Stale by fire time. | |

**User's choice:** Title=app name, body=prompt — **but app name is "Just Keep Winning"** (not the current "Winning Streak" in app.json)
**Notes:** Project-wide rename deferred to Phase 7. Phase 5 uses the new name only in the notification title constant.

---

## Time picker + Settings layout

### Q1 — Time picker UI for SET-01?

| Option | Description | Selected |
|--------|-------------|----------|
| @react-native-community/datetimepicker | Native iOS wheel + Android dialog. | ✓ |
| Custom hour/minute scrollers in NativeWind | More code, more edge cases. | |
| Preset chips + Custom escape hatch | Fast for most, custom for power users. | |

**User's choice:** @react-native-community/datetimepicker

### Q2 — How is the picker triggered?

| Option | Description | Selected |
|--------|-------------|----------|
| Tap row → modal bottom sheet picker | iOS Settings convention. | ✓ |
| Inline expandable | Drop down in place. | |
| Dedicated sub-screen | Overkill. | |

**User's choice:** Tap row → modal bottom sheet picker

### Q3 — Settings screen structure?

| Option | Description | Selected |
|--------|-------------|----------|
| Sectioned list: Reminders / Profile / About | Clear hierarchy. | ✓ |
| Flat list, no sections | Harder to scan as About grows. | |
| Card-grouped tiles | Unusual for settings. | |

**User's choice:** Sectioned list: Reminders / Profile / About

### Q4 — Display name input UX (SET-02)?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline-editable row | Tap-to-focus TextInput in place. | ✓ |
| Modal with TextInput + Save/Cancel | Heavier for one short string. | |
| Sub-screen route | Overkill. | |

**User's choice:** Inline-editable row

---

## About section + links

### Q1 — How It Works content delivery?

| Option | Description | Selected |
|--------|-------------|----------|
| In-app screen from local component | No network, editable in repo. | ✓ |
| External hosted page | Requires hosting. | |
| Modal with scrollable text | Less polished. | |

**User's choice:** In-app screen rendered locally

### Q2 — Privacy + Terms hosting?

| Option | Description | Selected |
|--------|-------------|----------|
| External URLs via expo-web-browser | In-app browser. Easy legal updates. | ✓ |
| Bundled in-app markdown | Updates require app release. | |
| External URLs via Linking (system browser) | Kicks user out. | |

**User's choice:** External URLs via expo-web-browser

### Q3 — Rate App + Share App implementation?

| Option | Description | Selected |
|--------|-------------|----------|
| expo-store-review native prompt + Share API | Native in-app rating; OS share sheet. | ✓ |
| Deeplink to store + Share API | Skips native prompt. | |
| Defer Rate to Phase 6/7 | Out of spec (SET-03). | |

**User's choice:** expo-store-review + React Native Share API

### Q4 — Privacy/Terms URLs status?

| Option | Description | Selected |
|--------|-------------|----------|
| Stub with placeholder URLs, real before submit | Wire link plumbing now, fill URLs in Phase 7. | ✓ |
| User has URLs ready | Wire actual URLs now. | |
| Draft + host this phase | Adds significant scope. | |

**User's choice:** Stub URLs; real ones slotted in Phase 7

---

## Rolling 30-day scheduling

### Q1 — Window depth?

| Option | Description | Selected |
|--------|-------------|----------|
| 30 days exactly | Matches NOTF-03 + CLAUDE.md invariant. | ✓ |
| 14 days | Less churn, smaller buffer. | |
| 60 days | Violates iOS 64 cap. | |

**User's choice:** 30 days (after Claude explained the iOS 64-notification cap and rolling-window rationale plainly — user did not initially understand the feature)
**Notes:** Followed up with plain-language explanation: iOS caps each app at 64 pending local notifications, so a "forever daily reminder" must be implemented as a sliding queue. 30 days chosen to cover any user who opens the app at least once a month.

### Q2 — Top-up trigger (NOTF-04)?

| Option | Description | Selected |
|--------|-------------|----------|
| AppState 'active' on every foreground | Matches NOTF-04 literally. | ✓ |
| Foreground + threshold (<7 days) | Cheaper, marginal savings. | |
| On win-save only | Misses users who don't log. | |

**User's choice:** AppState 'active' on every foreground

### Q3 — Update strategy when top-up runs?

| Option | Description | Selected |
|--------|-------------|----------|
| Cancel all + re-schedule next 30 days | Idempotent, simple. | ✓ |
| Incremental top-up | More code, edge cases. | |
| Cancel only past, append missing future | Hybrid, most complex. | |

**User's choice:** Cancel all + re-schedule next 30 days

### Q4 — Reminder time change behavior?

| Option | Description | Selected |
|--------|-------------|----------|
| Immediately cancel + re-schedule at new time | Predictable, instant. | ✓ |
| Schedule on next foreground only | Lazy. | |
| Apply tomorrow, keep tonight's existing | Edge-case correct but confusing. | |

**User's choice:** Immediately cancel + re-schedule next 30 days at new time

---

## Claude's Discretion

- Final 5–8 notification copy strings (warm, forward-looking, no guilt)
- Visual row styling (height, divider, chevron icon — match iOS Settings within warm palette)
- How It Works copy outline (3–5 sections)
- Master "Reminders" toggle row above time row (recommended yes; implement without re-asking)
- Share App message text
- Time picker locale handling
- AppState listener placement in `app/_layout.tsx`
- Storage key naming for new settings rows
- Whether About uses expo-router file routes or a local modal stack

## Deferred Ideas

- Project-wide rename "Winning Streak" → "Just Keep Winning" (Phase 7 — app.json, PROJECT.md, store metadata)
- Notification body with display name personalization (revisit after Phase 6 copy system)
- Notification deeplink / tap-to-route to win entry (V2)
- Real Privacy + Terms content + hosting (Phase 7 prereq)
- App Store rating prompt frequency tuning (e.g. after streak milestones)
- Full encouragement copy system across 15–20 message states (Phase 6)
- Reminder snooze / pause (out of V1 scope)

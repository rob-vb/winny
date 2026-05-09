# Phase 2: Core Win-Entry Loop - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-09
**Phase:** 2-Core Win-Entry Loop
**Areas discussed:** Win entry flow, Home screen layout, Session summary + I'm done

---

## Win Entry Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Separate WinEntry screen | Home shows streak + CTA. Tap → push WinEntry screen. | |
| Inline on Home tab | Entry box and session list on Home tab itself. | |
| Bottom sheet modal | Input slides up from bottom over Home. | |
| User freeform | "When the user opens the app the first screen they should see every day is the current day, and they should be able to enter a win immediately, and also see the wins they logged for the current day." | ✓ |

**User's choice:** Freeform — inline on Home tab with today's wins always visible.
**Notes:** User's mental model: Home = "today's page". Entry and today's list always present. No navigation needed.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Input at top, wins below | Text field prominent even after logging. | |
| Input at bottom, wins above | Wins list primary after first entry. Input pinned at bottom. | ✓ |
| You decide | Claude picks. | |

**User's choice:** Input at bottom — "Same as for to-do lists or shopping lists."
**Notes:** Chat/shopping-list mental model. Wins accumulate above, input stays at bottom.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Button near input (soft) | Always visible alongside input when ≥1 win exists. | |
| Button appears after first win | Hidden until first win logged. | |
| Keep as hard session lock | Locks today — cannot add more until tomorrow. | |
| User freeform | "The user doesn't know when he's done right. He can log wins on the current day, and when the day is done, then he's done." | |
| Remove 'I'm done' — summary always visible on Home | No button. Today's wins always listed. | ✓ |

**User's choice:** Remove "I'm done for today" entirely. WIN-04 overridden.
**Notes:** User's philosophy: session = the whole calendar day. No explicit "done" moment. Summary is just the always-visible wins list on Home.

---

## Home Screen Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Streak header top, wins middle, input pinned bottom | Clean separation. | ✓ |
| Wins + input full screen, streak as small banner | Entry is primary, streak compact. | |
| Separate sections with visual divider | Clear "Your Streak" block then "Today's Wins" block. | |

**User's choice:** Streak header at top, today's wins fill middle, input pinned bottom.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Current streak number (large, prominent) | Big Nunito Black number. | |
| Encouraging label | e.g. "You're on fire! 🔥" | ✓ |
| Total wins counter | e.g. "47 total wins" | ✓ |
| Trophy/mascot image | Smiley trophy from assets/images/trophy.png | ✓ |

**User's choice:** Encouraging label + total wins counter + trophy image. NOT a separate large streak number.
**Notes:** Multi-select. STREAK-01 still satisfied by baking count into the label string.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Baked into label — "12 day streak! You're on fire! 🔥" | Count part of label text. Trophy is visual anchor. | ✓ |
| Large number above label | Classic display: giant number + label below. | |
| You decide | Claude picks. | |

**User's choice:** Count baked into encouraging label string.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Shown above input as muted hint text | 3 prompts in secondary color above input. Non-tappable. | ✓ |
| Placeholder inside input (rotating) | Single placeholder. 1 visible at a time. | |
| Separate card above input | Distinct card showing all 3 prompts. | |

**User's choice:** 3 lines of muted hint text above the input field.

---

## Session Summary + I'm Done

| Option | Description | Selected |
|--------|-------------|----------|
| Trophy + prompt + example prompts + input | Encouraging empty state. | ✓ |
| Same layout always — streak=0, empty list, input ready | No special empty state. | |
| You decide | Claude picks. | |

**User's choice:** Trophy centered + "What was your win today?" prompt + example prompts + input for 0-wins-today state.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Simple: win appears in list, input clears | No animation. Fast and clean. | |
| Micro-celebration: brief scale/fade as win joins list | Small animation using Reanimated. | ✓ |
| You decide | Claude picks. | |

**User's choice:** Micro-celebration animation (scale + fade) when win is added.

---

## Claude's Discretion

- Exact encouraging label strings per streak tier (0, 1, 3, 7, 14, 30, 60, 100+ days)
- Zustand store shape for today's wins session and streak stats
- Keyboard avoidance approach (`KeyboardAvoidingView` vs `react-native-keyboard-controller`)
- 40–50 example prompts pool content (user skipped this gray area — Claude generates)

## Deferred Ideas

- **WIN-04 "I'm done for today":** Removed per user. Could return as optional celebration trigger in Phase 6 polish if desired.
- **Confetti/full celebration screen:** Deferred to Phase 6 (Onboarding + Copy System polish).
- **Example prompts personalization:** V2+ (requires AI categorization backend).

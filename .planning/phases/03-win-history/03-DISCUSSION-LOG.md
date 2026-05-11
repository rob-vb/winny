# Phase 3: Win History - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 3-Win History
**Areas discussed:** Date group display, Total wins header, Win row + interactions

---

## Area Selection

Four candidate gray areas were surfaced; user selected three to discuss. The fourth (Collapse behavior) was left to Claude's discretion.

| Option | Description | Selected |
|--------|-------------|----------|
| Date group display | Date format, count badge, chevron, sticky headers | ✓ |
| Collapse behavior | Default state, animation | (Claude's discretion) |
| Total wins header | Style + placement, streak echo, sticky vs scroll | ✓ |
| Win row + interactions | Reuse WinCard, delete/edit, sort order | ✓ |

---

## Date group display

### Q1 — Date label format

| Option | Description | Selected |
|--------|-------------|----------|
| Relative + absolute | 'Today' / 'Yesterday' for last 2 days, 'Mon, May 9' current year, 'May 9, 2025' prior years | ✓ |
| Always absolute long | 'Monday, May 9, 2026' for every group | |
| Always absolute short | 'May 9' / 'May 9, 2025' | |

**User's choice:** Relative + absolute (recommended).

### Q2 — Count badge style

| Option | Description | Selected |
|--------|-------------|----------|
| Pill badge right side | Rounded badge, '3 wins', tinted bg | ✓ |
| Inline grey text | '· 3 wins' appended | |
| Just number | Bare '3' on right | |

**User's choice:** Pill badge right side (recommended).

### Q3 — Sticky section headers

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, sticky | `stickySectionHeadersEnabled` — header pins at top during section scroll | ✓ |
| No, scroll with content | Headers scroll away with content | |

**User's choice:** Yes, sticky (recommended).

### Q4 — Chevron / collapse affordance

| Option | Description | Selected |
|--------|-------------|----------|
| Right-side chevron, rotates | Ionicons chevron-down rotates 180° when collapsed, full header tappable | ✓ |
| No chevron, header tappable only | No visual disclosure indicator | |
| Plus/minus icon | +/− toggle | |

**User's choice:** Right-side chevron, rotates (recommended).

---

## Total wins header

### Q1 — Header style

| Option | Description | Selected |
|--------|-------------|----------|
| Big hero number + label | Large number, 'total wins' label, trophy alongside | ✓ |
| Reuse StreakHeader from Home | Same component as Home | |
| Compact pill / single line | '🏆 47 total wins' on one line | |

**User's choice:** Big hero number + label (recommended).

### Q2 — Show streak too?

| Option | Description | Selected |
|--------|-------------|----------|
| Show streak too | Streak echoed on My Wins for cross-tab habit reinforcement | ✓ |
| Total only | Streak lives on Home; cleaner separation | |

**User's choice:** Show streak too (recommended).

### Q3 — Scroll behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Scrolls with content | `ListHeaderComponent` — scrolls off | ✓ |
| Sticky top bar | Header pinned at top always | |
| Shrinks to compact on scroll | Hero collapses into nav-bar pill | |

**User's choice:** Scrolls with content (recommended).

### Q4 — Empty state

| Option | Description | Selected |
|--------|-------------|----------|
| Trophy + 'No wins yet' encourager | Trophy + forward-looking copy pointing to Home | ✓ |
| Header showing 0 + empty list | Always render header, empty space below | |
| Hide tab visually until first win | Redirect/locked state | |

**User's choice:** Trophy + 'No wins yet' encourager (recommended).

---

## Win row + interactions

### Q1 — Win row component

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse WinCard as-is | Same component as Home, heart icon included | ✓ |
| Reuse WinCard, no heart icon | Drop heart in read-only context | |
| New compact history row | Denser custom row | |

**User's choice:** Reuse WinCard as-is (recommended).

### Q2 — Delete past wins?

| Option | Description | Selected |
|--------|-------------|----------|
| No delete in V1 | Wins are proof; defer to V2 | ✓ |
| Swipe-to-delete with confirm | iOS-style swipe affordance | |
| Long-press menu (delete) | Hidden menu option | |

**User's choice:** No delete in V1 (recommended).

### Q3 — Edit past wins?

| Option | Description | Selected |
|--------|-------------|----------|
| No edit in V1 | Same reasoning as delete | ✓ |
| Tap-to-edit inline | Tap row → input opens with existing text | |

**User's choice:** No edit in V1 (recommended).

### Q4 — Sort within date group

| Option | Description | Selected |
|--------|-------------|----------|
| Newest first | Most recent `logged_at` at top of group | ✓ |
| Oldest first | Diary-style chronological | |

**User's choice:** Newest first (recommended).

---

## Claude's Discretion

- **Collapse defaults (D-14):** All groups expanded on first render — value of screen is seeing wins; collapse-all would hide them.
- **Collapse state persistence (D-15):** Local component state; not persisted across launches in V1.
- **Empty state copy strings** — warm, forward-looking, point to Home tab.
- **Hero header typography & spacing** — follow Phase 1 design system.
- **Pill badge color / chevron animation timing** — within established palette and animation conventions.
- **Memoization strategy** for the grouped section data at 100+/200+ wins.

## Deferred Ideas

- Delete past wins (V2+)
- Edit past wins (V2+)
- Search / filter / category grouping (V2+ — requires AI categorization)
- Persisted collapse state across launches
- Scroll-to-today FAB / quick-jump for very long histories
- Header shrink/condense-on-scroll polish
- Win detail screen (tap row → full view)

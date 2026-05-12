# Phase 4: Dream Goal - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 4-Dream Goal
**Areas discussed:** Edit UX, Layout when goal is set, Save pattern, Empty state

---

## Edit UX

### Q1: When a goal is already saved, how does editing work?

| Option | Description | Selected |
|--------|-------------|----------|
| View + Edit toggle | Goal displays as styled text. Tapping Edit button switches to editable TextInput in place. Save/Cancel appear. | ✓ |
| Always-editable textarea | TextInput always shown with goal text loaded. No mode switching. | |
| Inline tap-to-edit | Tap goal text to activate inline TextInput. Polished but complex. | |

**User's choice:** View + Edit toggle

---

### Q2: Where does the Edit button live in view mode?

| Option | Description | Selected |
|--------|-------------|----------|
| Top-right corner (pencil icon) | Standard pattern — Ionicons pencil-outline icon. | ✓ |
| Below goal text ("Edit my goal" text link) | Subtle text link below goal, more prominent CTA. | |
| You decide | Claude picks most consistent placement. | |

**User's choice:** Top-right corner (pencil icon)

---

### Q3: In edit mode, what should Cancel do if the user made changes?

| Option | Description | Selected |
|--------|-------------|----------|
| Discard silently | Cancel always reverts to previously saved text. No dialog. | |
| Confirm before discarding | Confirmation dialog if text changed. Safer but adds friction. | |
| You decide | Claude applies pattern consistent with frictionless feel. | ✓ |

**User's choice:** You decide (Claude's discretion)

---

## Layout When Goal Is Set

### Q1: What's the visual hero of the screen?

| Option | Description | Selected |
|--------|-------------|----------|
| Goal text is the hero | Large, prominent goal text at top. Motivational copy smaller subtitle below. | ✓ |
| Motivational copy is the hero | Framing copy is the large header. Goal text below, slightly smaller. | |
| Equal weight, side by side | Card layout with framing copy and goal text at similar visual weight. | |

**User's choice:** Goal text is the hero

---

### Q2: Where does motivational copy appear?

| Option | Description | Selected |
|--------|-------------|----------|
| Below goal text as reinforcing note | Goal text hero at top. Framing copy below in secondary color. | ✓ |
| Above goal text as fixed framing header | Framing copy at top, goal text below. | |
| Both states: above in empty, below when set | Placement shifts by context. | |

**User's choice:** Below the goal text as a reinforcing note

---

### Q3: Goal text display — card or flush?

| Option | Description | Selected |
|--------|-------------|----------|
| Card / contained surface | Rounded card, warm off-white surface. Consistent with WinCard. | |
| Flush on background | Goal text directly on cream background. Minimal, note-taking feel. | |
| You decide | Claude picks for visual consistency. | ✓ |

**User's choice:** You decide (Claude's discretion)

---

## Save Pattern

### Q1: How does the user commit edits?

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit Save button | Orange CTA button in edit mode. Clear, intentional commit. | ✓ |
| Auto-save debounced | Saves 1–2 seconds after user stops typing. No explicit action. | |
| Save on keyboard dismiss | Tapping outside input triggers save. Implicit, common mobile pattern. | |

**User's choice:** Explicit Save button

---

### Q2: Should Save be disabled until text changes?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, disabled until changed | Save greyed out if text matches saved version. | ✓ |
| Always enabled in edit mode | Simpler state; re-saving identical text is harmless. | |

**User's choice:** Yes, disabled until changed

---

### Q3: Character counter for 500-char limit?

| Option | Description | Selected |
|--------|-------------|----------|
| Show when approaching limit (≤100 chars left) | Counter appears only as warning. Unobtrusive for typical use. | ✓ |
| Always show in edit mode | e.g. "247 / 500" always visible below input. | |
| No counter, just block at limit | maxLength={500} silently stops. | |

**User's choice:** Show counter when approaching limit (≤100 chars left)

---

## Empty State

### Q1: When no goal is set, how does the screen feel?

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate input | TextInput immediately visible and ready. Gentle invitation above it. | ✓ |
| Inspirational prompt first, then input | Larger copy/illustration moment, CTA button reveals input. More ceremony. | |
| Same layout as view mode with placeholder | Mirrors view mode; placeholder text prompts setting via edit toggle. | |

**User's choice:** Immediate input

---

### Q2: Is motivational copy visible in empty state?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, show above input as context | Copy above TextInput sets tone before user types. | ✓ |
| No, only after first goal is saved | Motivational copy only in view mode. | |
| You decide | Claude picks for warmth and consistency. | |

**User's choice:** Yes, show above the input as context

---

## Claude's Discretion

- **Cancel behavior:** Silently discard changes without confirmation dialog — aligns with frictionless, low-ceremony app feel
- **Card vs. flush for goal display:** Use a contained card surface consistent with WinCard — gives goal visual weight as an artifact
- **Invitation copy in empty state:** e.g. "What are you working toward?" — warm, forward-looking, no guilt
- **View ↔ Edit transition:** Reanimated, subtle ~200ms ease
- **State management:** Local component state with `useEffect` load (no Zustand store needed for Phase 4 — goal doesn't need to be reactive across screens yet)

## Deferred Ideas

- Dream Goal visible on Home screen — V2+
- Goal history / revision log — V2+
- Goal-to-win linking via AI categorization — V2+
- Goal setup during onboarding (Phase 6 will add this as a skippable step)

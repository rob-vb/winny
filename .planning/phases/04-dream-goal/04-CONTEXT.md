# Phase 4: Dream Goal - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers the **Dream Goal** tab — replacing the `goal.tsx` placeholder with a functional screen where users can write, save, display, and edit a personal goal framed motivationally. The repository layer is already implemented (`getGoal()`, `upsertGoal()`, singleton pattern with `id="singleton"`).

**In scope:**
- `app/(tabs)/goal.tsx` — full screen replacement (currently a placeholder)
- View mode: goal text displayed as hero, motivational copy below, pencil icon top-right
- Edit mode: TextInput with Save/Cancel, character counter near limit, Save disabled until text changes
- Empty/first-time state: TextInput immediately visible, motivational copy above as context, no extra CTA step
- State management for goal text (load from DB, save to DB via `upsertGoal()`)

**Out of scope:**
- New repository methods — `getGoal()` and `upsertGoal()` already exist
- Dream Goal shown on Home or other tabs (V2+)
- Goal history / version tracking (V2+)
- Goal-to-win linking or AI analysis (V2+)
- Onboarding integration (Phase 6)

</domain>

<decisions>
## Implementation Decisions

### Edit UX

- **D-01:** **View + Edit toggle.** Goal displays in a styled view mode. Tapping the pencil icon (top-right, `Ionicons pencil-outline`) switches to edit mode with a TextInput in place of the display. Save and Cancel buttons appear in edit mode.
- **D-02:** **Cancel discards silently** (Claude's discretion — aligns with the app's minimal, frictionless feel; no confirmation dialog). Reverts to the last saved text.

### Layout (goal is set)

- **D-03:** **Goal text is the visual hero.** Large, prominent goal text at the top of the screen. Motivational copy ("You're building your dream one win at a time") is a smaller secondary-color note rendered **below** the goal text — reinforcing, not framing.
- **D-04:** **Card vs. flush:** Claude's discretion — pick based on visual consistency with `WinCard`. (Recommendation: use a contained card surface for visual weight as an artifact, consistent with Phase 2 patterns.)

### Save Pattern

- **D-05:** **Explicit Save button** (orange CTA, same style as Phase 2's Add button). Appears in edit mode alongside a Cancel option.
- **D-06:** **Save disabled until text has changed** from the currently saved version. Prevents no-op saves. Enable state is a simple `isDirty` comparison.
- **D-07:** **Character counter shows only when ≤100 chars remain** (e.g. "97 / 500"). Hidden otherwise. `maxLength={500}` enforced on the TextInput.

### Empty State (no goal set)

- **D-08:** **Immediate input.** Screen opens with the TextInput already visible and ready. No extra CTA step or button to reveal the input.
- **D-09:** **Motivational copy visible above the input** in empty state ("You're building your dream one win at a time"). Sets the tone before the user types. Same copy string as the view-mode note, but positioned above in the empty-state layout.

### Claude's Discretion

- Cancel UX: silently discard changes without confirmation (D-02)
- Card vs. flush for goal text container: pick based on `WinCard` visual consistency (D-04)
- Exact encouraging copy for the "no goal yet" invitation above the TextInput (e.g., "What are you working toward?") — stay warm, forward-looking, no guilt
- Transition animation between view and edit mode (Reanimated, subtle ~200ms ease)
- Whether to use a Zustand store or local component state for goal text — given that goal state doesn't need to be reactive across multiple screens in Phase 4, local component state with `useEffect` load is sufficient; add a store in Phase 6 if onboarding needs it

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, no-guilt invariant, V2 migration notes, design language
- `.planning/REQUIREMENTS.md` — GOAL-01, GOAL-02, GOAL-03 (Dream Goal active requirements)
- `.planning/ROADMAP.md` §"Phase 4: Dream Goal" — Goal + 3 success criteria

### Phase 1 Decisions (design system locked)
- `.planning/phases/01-data-foundation-nav-shell/01-CONTEXT.md` — Color palette (warm cream/gold/orange), Nunito font, NativeWind className convention, tab routing

### Phase 2 Decisions (component patterns)
- `.planning/phases/02-core-win-entry-loop/02-CONTEXT.md` — `WinCard` pattern (surface card, rounded corners), orange CTA button style, Reanimated animation conventions, `WinInputArea` patterns

### Existing Code Phase 4 Builds On
- `app/(tabs)/goal.tsx` — current placeholder; Phase 4 replaces it entirely
- `src/db/repositories/dreamGoal.ts` — `getGoal()` and `upsertGoal(text)` already implemented; singleton pattern (`id="singleton"`)
- `src/db/schema.ts` — `dream_goal` table: `id` (singleton), `text`, `updated_at`
- `src/components/WinCard.tsx` — visual reference for card surface style (may reuse or create analogous `GoalCard`)
- `src/components/WinInputArea.tsx` — reference for input + button patterns
- `src/constants/theme.ts` — `Colors` / `Fonts` constants for non-NativeWind contexts
- `assets/images/trophy.png` — available if needed for empty state illustration

### Critical Invariants (CLAUDE.md)
- No guilt/punishment copy anywhere — empty state and edit mode must use encouraging, forward-looking language
- No in-app AI calls — goal is pure local text storage
- NativeWind className utilities everywhere — no `StyleSheet.create` for new components

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getGoal()` / `upsertGoal(text)` in `src/db/repositories/dreamGoal.ts` — ready to use, no changes needed
- `WinCard` (`src/components/WinCard.tsx`) — visual reference for the goal display card (surface bg, rounded corners, Nunito font)
- `WinInputArea` (`src/components/WinInputArea.tsx`) — reference for text input + CTA button layout patterns
- `Ionicons` — already imported via `_layout.tsx`; use `pencil-outline` for edit affordance
- `assets/images/trophy.png` — available for empty state if desired (Claude's discretion)

### Established Patterns
- NativeWind className utilities everywhere — no `StyleSheet.create`
- `SafeAreaView className="flex-1 bg-background"` as screen root wrapper
- Reanimated for transitions (used in `WinCard` entrance, `DateSectionHeader` chevron rotation)
- Orange `#F5A623` for active/CTA elements (tab active color, matches Add button in Phase 2)
- Local `useEffect` to load async data from DB on mount (established in Phase 2/3 screens)

### Integration Points
- `app/(tabs)/goal.tsx` is currently a placeholder (15 lines); Phase 4 replaces it entirely
- Tab routing already wired via `app/(tabs)/_layout.tsx` (Phase 1) — no layout changes needed
- Phase 6 (Onboarding) will add a Dream Goal setup screen during onboarding; design the goal screen so the DB read/write path is reusable without tight coupling

</code_context>

<specifics>
## Specific Ideas

- **View mode layout:** Pencil icon (`Ionicons pencil-outline`) top-right as edit affordance. Large goal text below. Motivational copy ("You're building your dream one win at a time") as a secondary-color note below the goal.
- **Edit mode layout:** TextInput replaces display text in-place. Save button (orange, same style as Phase 2 Add) + Cancel (ghost/text) appear. Character counter near 500-char limit only.
- **Empty state:** Motivational copy above input. Gentle invitation text below (e.g. "What are you working toward?"). TextInput ready immediately. No extra step.
- **Save disabled state:** Compare current input text to loaded saved text — `isDirty = currentText.trim() !== savedText.trim()`.

</specifics>

<deferred>
## Deferred Ideas

- **Dream Goal visible on Home screen** — would anchor each win to the goal; V2+ feature after goal screen is stable.
- **Goal history / revision log** — storing prior goals for reflection; V2+.
- **Goal-to-win linking** — connecting individual wins to the dream goal; tied to AI categorization (V2+).
- **Goal-setting during onboarding** — Phase 6 will add a skippable Dream Goal setup in the onboarding flow; the goal screen should remain standalone.

</deferred>

---

*Phase: 4-Dream Goal*
*Context gathered: 2026-05-12*

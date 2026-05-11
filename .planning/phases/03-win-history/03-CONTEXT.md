# Phase 3: Win History - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 delivers the **My Wins** screen: a read-only review of every win the user has ever logged, grouped by calendar date (newest first), with collapsible day sections and a celebratory total-wins header. This screen proves "you're already winning" by surfacing the accumulated history.

**In scope:**
- `app/(tabs)/wins.tsx` — full screen replacement (currently a placeholder)
- SectionList of wins grouped by `date_key`, newest section first
- Date group section headers: relative-then-absolute labels, win-count pill badge, rotating chevron, sticky during scroll
- Per-section collapse/expand toggle (HIST-02)
- Hero header above the list: big total-wins number + streak label + trophy
- Empty state for zero wins ever logged (encouraging, no guilt)
- Reuses `WinCard` + `useWinsStore` (already exposes full `wins[]` and `totalWins`)

**Out of scope:**
- Delete a past win (V1 — wins are proof, see D-12)
- Edit a past win (V1 — same reasoning, see D-13)
- Search / filter / category grouping (V2+ — requires AI categorization)
- Win detail screen (not required; row is the full content)
- New repository methods — `getWins()` + `getDistinctDateKeys()` already exist
- Pagination/virtualisation tuning beyond SectionList defaults — revisit only if 200+ wins regress (HIST-01 success criterion)

</domain>

<decisions>
## Implementation Decisions

### Date Group Display

- **D-01:** Date group headers use **relative-then-absolute** labels: `Today` for today's `date_key`, `Yesterday` for yesterday's, `Mon, May 9` for any other date in the current calendar year, `May 9, 2025` for prior years. Computed with `date-fns` (already in stack per CLAUDE.md) against the device local date — never UTC.
- **D-02:** Each date group header shows a **right-aligned pill badge** with the win count (e.g. `3 wins`). Singular `1 win` when count = 1. Pill uses a tinted surface background, consistent with the warm cream/gold system locked in Phase 1.
- **D-03:** **Sticky section headers** — `stickySectionHeadersEnabled` on the SectionList. The current date label stays pinned while scrolling that group.
- **D-04:** Collapse affordance is a **right-side Ionicons `chevron-down`** that rotates 180° to `chevron-up` when the section is collapsed. The entire header row is tappable (not just the chevron). Use Reanimated for the rotation transition to match Phase 2's animation conventions.

### Total Wins Header

- **D-05:** Header uses a **hero number + label** layout (NOT a reuse of Home's `StreakHeader`): a large bold total-wins number above the secondary `total wins` label, with the trophy image alongside. This makes the count the visual centerpiece of the History tab — distinct from Home's streak-first identity.
- **D-06:** Streak count is also shown in the header alongside the total (e.g. streak label line below or beside the total). Reinforces the habit signal on both tabs that surface stats. Use the same `streakLabel(streak)` utility from Phase 2 for label text.
- **D-07:** Header **scrolls with content** — rendered via SectionList's `ListHeaderComponent`. It scrolls off as the user reads further back. No sticky top bar, no shrink-on-scroll animation.
- **D-08:** **Empty state (zero wins ever):** Trophy image centered, encouraging copy ("Your wins will live here" or similar) and a forward-looking hint pointing to the Home tab. No guilt language. Detected via `totalWins === 0` from the store. The hero total-wins header is NOT rendered in empty state — the empty layout replaces it entirely.

### Win Row + Interactions

- **D-09:** Win rows **reuse `WinCard` as-is** from `src/components/WinCard.tsx`. Same surface bg, rounded corners, heart icon, font. Keeps Home and History visually unified.
- **D-10:** `isNew` prop on `WinCard` is always `false` in the history list — the entrance ZoomIn animation only fires for new entries on Home.
- **D-11:** Within each date group, wins are sorted **newest first by `logged_at`**. Matches HIST-01 ("newest first") and the user's chronological recall model. Section ordering across groups is also newest-`date_key` first.
- **D-12:** **No delete in V1.** Past wins cannot be removed. Rationale: wins are journal proof; allowing deletion undermines the "you're already winning" model and adds streak-recompute edge cases. Revisit in V2 if user research demands it.
- **D-13:** **No edit in V1.** Same reasoning as D-12. The row is purely a read display in this phase.

### Collapse Behavior (Claude's Discretion)

- **D-14:** Default state on first render: **all groups expanded.** Rationale: HIST-02 requires collapsibility, but the value of the screen is seeing your wins — defaulting to collapsed would hide them. User did not specify; this is the higher-value default. Today's group is always rendered expanded after a fresh add (handled implicitly by re-mount or local state init).
- **D-15:** Collapse state is **local component state** (e.g. `Record<string, boolean>` keyed by `date_key`). Not persisted across app launches in V1 — re-opening My Wins resets to all-expanded. Persistence can be added later via AsyncStorage if needed.

### Claude's Discretion

- Exact copy strings for empty state ("Your wins will live here" or similar) — stay warm, no guilt, forward-looking; encourage going to Home tab.
- Exact spacing/typography of the hero total-wins header — follow Phase 1 design system (Nunito, warm palette, NativeWind className utilities).
- Collapse animation timing/easing — use Reanimated `LayoutAnimation` or height interpolation; choose a subtle ~200ms ease.
- Pill badge color/background — match the warm cream/gold palette already locked in Phase 1 (use `Colors` constants or NativeWind classes from existing theme).
- Whether to memoize section list data (`useMemo` on the grouped wins by `date_key`) — recommended at 100+ wins, mandatory at 200+ for HIST-01 success criterion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, no-guilt invariant, V2 migration notes
- `.planning/REQUIREMENTS.md` — HIST-01, HIST-02, HIST-03 (Win History active requirements)
- `.planning/ROADMAP.md` §"Phase 3: Win History" — Goal + 4 success criteria

### Phase 1 Decisions (design system locked)
- `.planning/phases/01-data-foundation-nav-shell/01-CONTEXT.md` — Color palette, Nunito font, tab routing, NativeWind className convention

### Phase 2 Decisions (component reuse)
- `.planning/phases/02-core-win-entry-loop/02-CONTEXT.md` — `WinCard` and `StreakHeader` patterns, `useWinsStore` shape, animation conventions (Reanimated), trophy asset usage

### Existing Code Phase 3 Builds On
- `app/(tabs)/wins.tsx` — current placeholder; Phase 3 replaces it entirely
- `src/components/WinCard.tsx` — reused as-is for history rows (D-09)
- `src/stores/useWinsStore.ts` — already exposes `wins[]`, `totalWins`, `streak`; no store changes needed for the read path
- `src/db/repositories/wins.ts` — `getWins()` returns all wins ordered by `date_key desc`; sufficient for Phase 3
- `src/utils/dateUtils.ts` — `toDateKey()` for "today"/"yesterday" comparison
- `src/utils/streakLabel.ts` — used by header for streak text (D-06)
- `assets/images/trophy.png` — trophy asset for hero header and empty state
- `src/constants/theme.ts` — `Colors` / `Fonts` constants (only when NativeWind className is impractical)

### Critical Invariants (CLAUDE.md)
- All date comparisons MUST use timezone-safe local `date_key` strings — never UTC
- No guilt/punishment copy anywhere — applies to empty state and any "no wins today" inline messaging
- No in-app AI calls — categorization/search is V2+

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WinCard` (`src/components/WinCard.tsx`) — full row component; pass `isNew={false}` for history rows (entrance animation suppressed)
- `useWinsStore` — already exposes `wins[]` (all-time, ordered `date_key desc`), `totalWins`, `streak`. No new store actions needed for read-only history. Hydrate already runs at app boot in Phase 2's wiring.
- `streakLabel(streak)` — encouragement label generator from Phase 2; reuse for the header streak line (D-06)
- `toDateKey()` — produces today's local `date_key` for "Today"/"Yesterday" comparison
- `assets/images/trophy.png` — trophy mascot, already imported by `StreakHeader`

### Established Patterns
- NativeWind className utilities everywhere — no `StyleSheet.create` for new components (Phase 1 + 2 convention)
- `SafeAreaView className="flex-1 bg-background"` as screen root wrapper (consistent across all tab screens)
- Reanimated for entrance animations and transforms (used in `WinCard`, will be used for chevron rotation in date headers)
- Date-fns is the date library (per CLAUDE.md tech stack) — use for relative date label formatting (D-01)
- Repository functions return data sorted appropriately — `getWins()` already returns `date_key desc`; UI groups by `date_key` without re-sorting at the section level

### Integration Points
- `app/(tabs)/wins.tsx` is currently a placeholder (lines 1–16 of the file); replaced entirely by Phase 3
- `useWinsStore.wins` is the single source of truth for the list; no new DB query needed
- Tab routing already lands on this screen via `(tabs)/_layout.tsx` (Phase 1)
- Phase 6 (Onboarding) may want to suppress empty state for first-time users on this tab — design empty state so it works either way

</code_context>

<specifics>
## Specific Ideas

- **Header layout:** Trophy + big total number ("47") + label "total wins" + streak line. Visually celebratory — distinct from Home's streak-first identity but using the same trophy + Nunito + warm palette.
- **Section header line:** `Today` (or `Yesterday`, or `Mon, May 9`) on the left + `3 wins` pill on the right + rotating chevron at the far right. Entire header tappable.
- **Sticky behavior:** Standard iOS contacts/photos feel — section header stays pinned at the top of the viewport until the next section pushes it off.
- **Empty state composition:** Trophy centered, encouraging headline, subtext that points back to Home. Mirrors the warmth of Phase 2's empty state but framed for the History tab.

</specifics>

<deferred>
## Deferred Ideas

- **Delete a past win** — V2+. If introduced, must define streak recompute behavior (does deleting yesterday's only win break the streak retroactively?).
- **Edit a past win** — V2+. Requires a `updateWin(id, text)` repository method and an edit flow; not in scope for read-only history.
- **Search / filter wins** — V2+. Tied to AI categorization which is explicitly V2+ per PROJECT.md.
- **Persisted collapse state across app launches** — Not in V1. Local state is sufficient for the success criteria. Add AsyncStorage persistence later if user research demands.
- **Scroll-to-today FAB / quick-jump** — Becomes useful at very long histories (1000+ wins). Defer until that scale is real.
- **Section header shrinks/condenses on scroll** — Polish for a future pass; standard scroll behavior is fine for V1.
- **Win detail screen (tap row → full view)** — Not needed; row content is the full win. Could be added if rich metadata (photos, categories) lands in V2+.

</deferred>

---

*Phase: 3-Win History*
*Context gathered: 2026-05-11*

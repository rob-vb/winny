# Phase 2: Core Win-Entry Loop - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the complete core value loop: a Home screen where users can see their current streak stats, log one or more free-text wins, view today's wins inline, and see their streak update — all without leaving the Home tab. No navigation to separate screens for win entry. No "I'm done" session lock — the day is always open.

**In scope:**
- Home tab: streak header + today's wins list + pinned text input
- Win entry: free text, 1–200 chars, Add button, micro-animation on add
- Example prompts: 3 non-tappable muted hints above input, rotating daily from a pool of 40–50
- Streak calculation: consecutive calendar days with ≥1 win (computed from `getDistinctDateKeys()`)
- Streak display: baked into encouraging label (e.g. "12 day streak! You're on fire! 🔥")
- Total wins counter: always-growing, shown in streak header
- Empty state: trophy image + "What was your win today?" prompt when 0 wins today
- Zustand store for today's wins session state and streak stats

**Out of scope:**
- Separate WinEntry screen or modal (user chose inline)
- "I'm done for today" button or session lock (WIN-04 overridden by user — see D-03)
- Notifications (Phase 5)
- Onboarding (Phase 6)
- Win history list (Phase 3 — My Wins tab)

</domain>

<decisions>
## Implementation Decisions

### Win Entry Flow

- **D-01:** Home tab IS the win entry screen. No navigation to a separate screen or modal. `app/(tabs)/index.tsx` is fully replaced by Phase 2.
- **D-02:** Layout order (top → bottom): streak header → scrollable today's-wins list → pinned input area. Wins stack above input as user adds them — same pattern as a todo list or chat UI.
- **D-03:** No "I'm done for today" button. WIN-04 requirement overridden by user decision. Session = the full calendar day. User can add wins any time. Today's wins always visible inline. No session lock state.

### Home Screen Layout

- **D-04:** Streak header contains: trophy/mascot image + encouraging label with streak count baked in (e.g. "12 day streak! You're on fire! 🔥") + total wins counter (secondary, e.g. "47 total wins"). No separate large streak number — the count lives inside the label string.
- **D-05:** Encouraging labels must vary by streak length. Streak=0 label must be welcoming/inviting, not a guilt/shame state (e.g. "Start your streak today! 🌟"). No punishment language anywhere (STREAK-04, CLAUDE.md invariant).
- **D-06:** Example prompts (WIN-02): displayed as 3 lines of muted secondary-color text above the text input. Non-tappable. Rotate daily (same 3 for the whole calendar day). Selection from 40–50 curated pool using `date_key` to seed selection index.
- **D-07:** Empty state (0 wins today): trophy image centered, large "What was your win today?" heading, 3 example prompts above input, input ready. This IS also the "first time ever" state for new users.

### Win Add Feedback

- **D-08:** When user taps Add: brief micro-animation (scale + fade-in) as the new win item appears in the list. Input field clears. Keyboard stays open (focus retained on input). Uses `react-native-reanimated` (already pinned at 3.19.5 in stack).

### Example Prompts Pool

- **D-09:** 40–50 curated prompts hardcoded in the app (V1 is static — personalization is V2+). Claude generates the full pool during planning/execution. User did not provide them. Format: plain short phrases like "I helped a colleague today", "I finished something I'd been avoiding".

### Claude's Discretion

- Exact encouraging label strings for each streak tier (1, 3, 7, 14, 30, 60, 100+ days) — stay warm and emoji-friendly, never shame on reset/0
- Zustand store shape for today's wins + streak stats
- Keyboard avoidance behavior (ensure input stays above keyboard on iOS/Android)
- Whether to use `KeyboardAvoidingView` or `react-native-keyboard-controller` for input pinning

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, no-guilt invariant, V2 migration notes
- `.planning/REQUIREMENTS.md` — WIN-01 through WIN-04, STREAK-01 through STREAK-04 (active requirements for this phase)
- `.planning/ROADMAP.md` — Phase 2 success criteria (5 criteria)

### Phase 1 Decisions (design system + architecture locked here)
- `.planning/phases/01-data-foundation-nav-shell/01-CONTEXT.md` — Color palette (D-02), Nunito font (D-03), Drizzle pattern (D-04, D-05), tab routing (D-07)

### Existing Code Phase 2 Builds On
- `src/db/schema.ts` — wins table definition; Phase 2 writes here
- `src/db/repositories/wins.ts` — `insertWin(text)`, `getWins()`, `getDistinctDateKeys()` already implemented
- `src/utils/dateUtils.ts` — `toDateKey(date)` — timezone-safe YYYY-MM-DD; MUST use for all date_key values
- `src/utils/uuid.ts` — `generateId()` — UUID generation; used by `insertWin` already
- `src/constants/theme.ts` — `Colors` and `Fonts` constants; use NativeWind className in components, constants only for non-NativeWind contexts

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/db/repositories/wins.ts` → `insertWin(text)`: ready to use, no changes needed for Phase 2 core path
- `src/db/repositories/wins.ts` → `getDistinctDateKeys()`: drives streak calculation — returns ordered list of distinct date_keys
- `src/utils/dateUtils.ts` → `toDateKey(now)`: produces timezone-safe date_key for today comparison
- `assets/images/trophy.png`: smiley trophy — use in streak header and empty state

### Established Patterns
- NativeWind className utilities everywhere — no inline StyleSheet for new components (matches Phase 1 pattern)
- `SafeAreaView className="flex-1 bg-background"` as root wrapper (established in all 4 tab screens)
- Zustand not yet set up — Phase 2 introduces the store layer
- `crypto.randomUUID()` in schema `$defaultFn` (NOT expo-crypto import in schema files — esbuild limitation)

### Integration Points
- `app/(tabs)/index.tsx`: Phase 2 fully replaces current placeholder content
- Phase 3 (Win History): reads same `wins` table — schema correct, no changes needed
- Phase 6 (Onboarding): will wrap Phase 2 Home; design Home so it can be conditionally skipped by onboarding flow

</code_context>

<specifics>
## Specific Ideas

- **Streak label format:** Count baked into label string — "12 day streak! You're on fire! 🔥" — not a separate large number. Label string varies by tier.
- **Input pattern:** Chat/todo-list style — wins list grows above, input pinned at bottom. Same UX mental model as adding items to a shopping list.
- **Trophy placement:** Trophy image in the header section (always visible at top of Home). Also used in empty state when wins list is empty.
- **Micro-animation:** Reanimated scale + fade as win appears in list. Input clears after add. Keyboard stays open.
- **Example prompts rotation:** Use `date_key` of today to derive a stable index into the 40–50 prompt pool. Same 3 prompts all day, different tomorrow.

</specifics>

<deferred>
## Deferred Ideas

- **WIN-04 "I'm done for today" button:** Explicitly removed by user decision. Session = calendar day, always open. If needed in a future polish pass, it could be added as an optional celebration trigger without locking the session.
- **Confetti/full celebration screen on session completion:** Could be added in Phase 6 (Onboarding + Copy System) as a polish moment. Not Phase 2.
- **Example prompts personalization:** V2+ feature (requires AI categorization). V1 uses static hardcoded pool.
- **Prompt pool authoring by user:** User skipped this gray area — Claude generates the pool during execution.

</deferred>

---

*Phase: 2-Core Win-Entry Loop*
*Context gathered: 2026-05-09*

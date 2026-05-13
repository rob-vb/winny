# Phase 6: Onboarding + Copy System - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 delivers the first-run onboarding gate and the app-wide encouragement copy system. A fresh install should feel welcoming and fast: Welcome -> skippable Dream Goal setup -> Home. The phase also centralizes emotional copy for first wins, streak milestones, comebacks after missed streaks, session-complete-style moments, and existing empty/error/disabled states that affect tone.

**In scope:**
- First-run onboarding gate before the tab app is shown
- Welcome screen with celebratory trophy-led tone
- Skippable Dream Goal setup that reuses existing save/validation paths
- `onboarding_completed` persistence in the existing settings key/value table
- Central typed copy catalog for named emotional states
- Compatibility wrappers for existing helpers like `streakLabel()` and notification prompt copy
- Home-only milestone and comeback banners after win saves
- No-guilt copy audit for miss/reset/comeback states

**Out of scope:**
- Notification permission inside onboarding. Phase 5 already prompts after the first win save.
- New account/auth/cloud sync onboarding
- New rocket/astronaut art for V1. Use the existing trophy asset.
- Full localization or moving every literal string in the app into the catalog
- Persistent history entries for milestone/comeback banners

</domain>

<decisions>
## Implementation Decisions

### First-Run Path

- **D-01:** Fresh install uses a **light gate before the app**: Welcome -> skippable Dream Goal setup -> Home. Tabs appear only after onboarding completes.
- **D-02:** Onboarding completes when the user exits Dream Goal setup through either **Save Goal** or **Skip**, then routes to Home.
- **D-03:** Once `onboarding_completed=true`, the first-run gate never shows again. If the user abandons before completion, onboarding may resume because completion was never recorded.
- **D-04:** Store `onboarding_completed=true` in the existing SQLite `settings` key/value table. Do not add a dedicated onboarding table or AsyncStorage state.

### Welcome Tone

- **D-05:** Welcome should use **celebratory rocket/trophy energy**: playful, warm, mascot-forward, and emotionally uplifting.
- **D-06:** Keep explanation lightweight: a celebratory headline plus one brief method-framing sentence that daily wins build momentum.
- **D-07:** Reuse the existing trophy asset for V1. Do not source or generate a new rocket/astronaut asset in this phase.
- **D-08:** Welcome primary button text is **Start Winning**.

### Dream Goal Setup

- **D-09:** Dream Goal setup should encourage entry while making **Skip for now** visible and calm.
- **D-10:** Build a simplified onboarding-specific Dream Goal editor. It should reuse the same repository and validation logic, but use lighter onboarding layout and copy rather than embedding the full Goal tab screen.
- **D-11:** The primary save action is disabled until valid text exists. Skipping is the explicit path for continuing without a goal.
- **D-12:** After saving a Dream Goal during onboarding, show a brief success state, then auto-route to Home.

### Copy System States

- **D-13:** V1 uses a **central typed copy catalog** with named emotional states. Screens/components import copy from the catalog.
- **D-14:** The catalog covers roadmap states plus existing empty/loading/error/disabled states that carry emotional tone.
- **D-15:** Emotional states use small variant arrays, generally 3-5 variants where freshness matters.
- **D-16:** Variant selection is deterministic by date, streak, or win count so the same app state does not flicker unpredictably.
- **D-17:** Existing helpers should wrap the catalog for compatibility. `streakLabel()` and notification prompt copy can delegate to the new catalog without forcing every call site to change in one pass.

### Milestones + Comeback Behavior

- **D-18:** Streak milestones at 7, 30, and 100 days use a small celebratory banner on Home after logging the win that reaches the milestone.
- **D-19:** Comeback copy appears only after the user logs again following a reset or missed streak. Do not foreground the missed day before the user acts.
- **D-20:** Comeback detection uses a date-key gap check against the newest prior win date. If the gap is greater than 1 calendar day, the next saved win is a comeback.
- **D-21:** Milestone and comeback banners live on Home only. They are immediate feedback moments tied to logging a win, not persistent history or global app banners.

### the agent's Discretion

- Exact welcome headline and supporting sentence, as long as the tone is celebratory, trophy-led, and includes tiny method framing.
- Exact Dream Goal onboarding copy and brief success-state copy.
- Exact copy catalog module/file shape, naming, and type definitions.
- Exact copy variants for each state, provided they pass the no-guilt/shame invariant.
- Banner visual styling, duration, and dismissal behavior, as long as Home remains fast and the input loop is not blocked.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context

- `.planning/PROJECT.md` - Core value, no-guilt invariant, design direction, V1 local-first constraints
- `.planning/REQUIREMENTS.md` - ONBD-01, ONBD-02, COPY-01, COPY-02
- `.planning/ROADMAP.md` §"Phase 6: Onboarding + Copy System" - phase goal and success criteria
- `.planning/STATE.md` - current project position and Phase 5 EAS verification caveat

### Prior Phase Decisions

- `.planning/phases/02-core-win-entry-loop/02-CONTEXT.md` - Home is the win entry screen, no "I'm done" lock, streak label conventions, example prompt rotation
- `.planning/phases/03-win-history/03-CONTEXT.md` - empty History tone and no-guilt display patterns
- `.planning/phases/04-dream-goal/04-CONTEXT.md` - Dream Goal save/edit behavior, validation expectations, onboarding integration deferred to Phase 6
- `.planning/phases/05-notifications-settings/05-CONTEXT.md` - notification permission timing after first win, notification copy seed, settings table keys, Settings copy surfaces

### Existing Code Phase 6 Builds On

- `app/_layout.tsx` - root Stack and app initialization gate; onboarding gate likely connects here
- `app/(tabs)/index.tsx` - Home win-entry flow and post-save feedback surface for milestone/comeback banners
- `app/(tabs)/goal.tsx` - current Dream Goal screen behavior and save path reference
- `src/db/repositories/settings.ts` - `getSetting()` / `setSetting()` for `onboarding_completed`
- `src/db/repositories/dreamGoal.ts` - `getGoal()` / `upsertGoal()` for onboarding Dream Goal save
- `src/utils/goalValidation.ts` - Dream Goal validation rules
- `src/utils/streakLabel.ts` - existing streak label helper; should delegate to the copy catalog
- `src/notifications/notificationService.ts` - existing notification copy pool; should delegate to the copy catalog
- `src/utils/dateUtils.ts` - timezone-safe `date_key` and streak date utilities for comeback detection
- `assets/images/trophy.png` - V1 welcome visual asset

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `settings` key/value table and `getSetting()` / `setSetting()` are ready for `onboarding_completed`; no schema migration is needed.
- `upsertGoal(text)` and `validateGoalText` can power the onboarding Dream Goal setup without duplicating persistence or validation logic.
- `assets/images/trophy.png` already supports the desired welcome tone.
- `streakLabel(streak)` already centralizes streak copy and has tests for no-guilt language. It should become a compatibility wrapper around the catalog.
- `notificationService.COPY_POOL` already holds rotating daily reminder prompts. It should delegate to catalog-provided notification variants.

### Established Patterns

- NativeWind className utilities for new UI.
- `SafeAreaView className="flex-1 bg-background"` screen roots.
- Warm cream/gold/orange palette and Nunito typography.
- Zustand `useWinsStore.addWin()` is the core post-save path. Milestone/comeback detection likely belongs around the same state transition.
- Date logic must use local `date_key` strings, never UTC-derived day comparisons.

### Integration Points

- Root app gate: read `onboarding_completed` after migrations/fonts are ready, before showing tabs.
- New onboarding routes/screens: welcome and Dream Goal setup should live outside `(tabs)` so the tab shell is hidden until completion.
- Home post-save flow: after `addWin()`, detect milestone/comeback and show a small Home-only banner.
- Copy catalog: add a typed module under `src/constants/` or `src/copy/`, then wrap existing helpers.
- Tests: update or add tests for no-guilt copy, deterministic variant selection, milestone thresholds, comeback gap detection, and onboarding completion persistence.

</code_context>

<specifics>
## Specific Ideas

- Welcome flow: trophy image, celebratory headline, one short sentence that daily wins build momentum, primary CTA **Start Winning**.
- Dream Goal setup: input plus primary Save Goal button disabled until valid; visible **Skip for now** secondary action; brief "Saved" success moment before Home.
- Copy states to cover: first win ever, 7/30/100 streak milestones, comeback after miss, session-complete-style post-save moments, long streak, Home empty, History empty, Dream Goal empty, notification disabled, save/load errors, and notification prompts.
- Milestone banner: small Home banner after logging the win that reaches 7/30/100.
- Comeback banner: Home banner after logging a win when newest prior win date was more than 1 calendar day before today.

</specifics>

<deferred>
## Deferred Ideas

- New rocket/astronaut illustration or mascot asset. V1 uses the trophy asset.
- Full localization or complete string extraction for every non-emotional UI label.
- Persistent milestone/comeback history in My Wins.
- Notification permission inside onboarding. Permission remains after first win save.

</deferred>

---

*Phase: 6-Onboarding + Copy System*
*Context gathered: 2026-05-13*

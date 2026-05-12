# Phase 4: Dream Goal - Research

**Researched:** 2026-05-12
**Domain:** React Native / Expo screen implementation — view/edit toggle, local async state, Reanimated opacity crossfade
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** View + Edit toggle. Goal displays in styled view mode. Pencil icon (top-right, `Ionicons pencil-outline`) switches to edit mode with TextInput in place of display. Save and Cancel appear in edit mode.
- **D-02:** Cancel discards silently — no confirmation dialog. Reverts to last saved text.
- **D-03:** Goal text is the visual hero. Large, prominent goal text at top. Motivational copy below.
- **D-04:** Card vs. flush — Claude's discretion (pick based on WinCard visual consistency).
- **D-05:** Explicit Save button — orange CTA, same style as Phase 2 Add button.
- **D-06:** Save disabled until text has changed from currently saved version (isDirty comparison).
- **D-07:** Character counter shows only when ≤100 chars remain (e.g., "97 / 500"). Hidden otherwise. `maxLength={500}` on TextInput.
- **D-08:** Immediate input in empty state — TextInput already visible and ready, no extra CTA step.
- **D-09:** Motivational copy visible above input in empty state.

### Claude's Discretion

- Cancel UX: silently discard (D-02 already locked)
- Card vs. flush for goal container (D-04 — recommendation: use card, see below)
- Exact encouraging copy for invitation above TextInput
- Transition animation between view and edit (Reanimated, ~200ms ease)
- Zustand store vs. local component state — CONTEXT says local `useEffect` load is sufficient for Phase 4; add store in Phase 6 if needed

### Deferred Ideas (OUT OF SCOPE)

- Dream Goal visible on Home screen (V2+)
- Goal history / revision log (V2+)
- Goal-to-win linking / AI analysis (V2+)
- Goal-setting during onboarding (Phase 6)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GOAL-01 | User can write and save a Dream Goal (up to 500 characters) | GoalEditor with `maxLength={500}`, `upsertGoal(text)` call on Save |
| GOAL-02 | Dream Goal screen frames the goal motivationally ("You're building your dream one win at a time") | Copywriting contract in UI-SPEC; both empty and view states show motivational copy |
| GOAL-03 | User can edit and update their Dream Goal at any time | View → Edit toggle via pencil icon, Save calls `upsertGoal()` again |
</phase_requirements>

---

## Summary

Phase 4 replaces the 15-line placeholder `app/(tabs)/goal.tsx` with a functional Dream Goal screen. The repository layer (`getGoal`, `upsertGoal`) is already fully implemented and verified. This phase is entirely a UI implementation task.

The screen has three distinct visual states (empty, view, editing) plus two transient states (loading, saving) and an error state — six total, modeled as a discriminated union string in local `useState`. All locked decisions are detailed in CONTEXT.md and UI-SPEC.md; no architecture choices remain open.

The key implementation insight from reading the codebase: existing screens (Phase 2 Home, Phase 3 Wins) use either a Zustand store with `isHydrated` flag or local state. The goal screen is simpler — it uses local `useState` + `useEffect` load because goal data does not need to be reactive across tabs. The Reanimated crossfade pattern (opacity, `withTiming`, 200ms) is identical to what `DateSectionHeader` already uses for chevron rotation.

**Primary recommendation:** One screen file (`goal.tsx`) + two extracted components (`GoalCard`, `GoalEditor`) per the UI-SPEC component inventory. Local state. No Zustand store. Reanimated `withTiming` opacity on two `Animated.View` wrappers that swap conditionally.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Goal read/write | Database (Drizzle/SQLite) | — | `getGoal()`/`upsertGoal()` already implemented; singleton pattern |
| State orchestration | Component (local useState) | — | Goal data not shared across tabs in Phase 4; Zustand deferred to Phase 6 |
| View/edit toggle | Component (local state) | — | UI-only mode flag; no persistence needed |
| isDirty comparison | Component (derived state) | — | Pure string comparison, no store needed |
| Crossfade animation | UI thread (Reanimated) | — | `withTiming` opacity runs on UI thread; matches existing DateSectionHeader pattern |
| Keyboard avoidance | Platform (KeyboardAvoidingView) | — | Matches Home screen pattern; behavior="padding" on iOS, undefined on Android |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-reanimated | `^3.19.5` (pinned) | Opacity crossfade for view/edit swap | Already used in WinCard (ZoomIn), DateSectionHeader (withTiming rotation) |
| expo-sqlite v2 + drizzle-orm | `~55.0.15` / `^0.45.2` | DB read/write via existing repo functions | Established in Phase 1; no changes needed |
| zustand | `^5.0.13` | NOT used for goal — local state only | CONTEXT.md discretion: add in Phase 6 if Phase 6 needs it |
| NativeWind v4 | `^4.2.3` | All styling via className | Project invariant — no StyleSheet.create |
| @expo/vector-icons (Ionicons) | bundled with Expo 55 | Pencil icon (`pencil-outline`) | Already imported in `_layout.tsx` |

[VERIFIED: package.json]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | `~5.6.2` | `SafeAreaView` as screen root | Every tab screen — matches all existing screens |
| KeyboardAvoidingView | React Native core | Push content above keyboard when TextInput appears | Edit mode / empty state — matches Home screen pattern |
| Platform (RN core) | — | `behavior="padding"` on iOS, `undefined` on Android | Same conditional as `app/(tabs)/index.tsx` |

[VERIFIED: package.json, src/app/(tabs)/index.tsx]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local useState + useEffect | Zustand store | CONTEXT explicitly defers store to Phase 6; local state is simpler and sufficient when goal data is tab-local |
| Reanimated withTiming opacity | LayoutAnimation / FadeIn-FadeOut entering/exiting | withTiming + useSharedValue is already proven in codebase; entering/exiting animations don't handle bidirectional swap as cleanly |
| Conditional render with opacity animation | Absolute positioning overlay | Conditional render avoids layout complexity; opacity fade handles visual smoothness |

---

## Architecture Patterns

### System Architecture Diagram

```
Mount
  └─► useEffect
        └─► getGoal() [Drizzle → SQLite]
              ├─► null       → state = 'empty'   → GoalEditor (immediate input)
              └─► DreamGoal  → state = 'view'    → GoalCard + pencil icon

Pencil tap
  └─► state = 'editing'
        └─► GoalEditor (currentText = savedText)

Save pressed (isDirty = true)
  └─► state = 'saving'  (Save disabled)
        └─► upsertGoal(currentText.trim()) [Drizzle → SQLite]
              ├─► success → savedText = currentText; state = 'view'
              └─► error   → state = 'editing'; inline error shown

Cancel pressed
  └─► currentText = savedText; state = 'view'  (silent discard)
```

### Recommended Project Structure

```
app/(tabs)/goal.tsx            # GoalScreen — state machine, load/save orchestration
src/components/GoalCard.tsx    # View mode: hero text + accessible label
src/components/GoalEditor.tsx  # Edit mode: TextInput + counter + Save/Cancel row
```

No new repository files — `src/db/repositories/dreamGoal.ts` is complete.
No new store files — local state is sufficient for Phase 4.

### Pattern 1: Local State Machine (6 states)

**What:** A single `useState` with discriminated union drives all render branches.
**When to use:** Screen with distinct UI modes that don't share state with other screens.

```typescript
// Source: inferred from DateSectionHeader.tsx + WinInputArea.tsx patterns
type GoalState = 'loading' | 'empty' | 'view' | 'editing' | 'saving' | 'error';
const [screenState, setScreenState] = useState<GoalState>('loading');
const [savedText, setSavedText] = useState('');
const [currentText, setCurrentText] = useState('');

// isDirty — derived, not stored
const isDirty = currentText.trim() !== savedText.trim();
```

State transitions:
- `'loading'` → `'empty'` (getGoal returns null)
- `'loading'` → `'view'` (getGoal returns goal)
- `'loading'` → `'error'` (getGoal throws)
- `'view'` → `'editing'` (pencil tap)
- `'editing'` → `'saving'` (Save pressed)
- `'saving'` → `'view'` (upsertGoal success)
- `'saving'` → `'editing'` (upsertGoal error; text preserved)
- `'editing'` → `'view'` (Cancel; currentText reset to savedText)
- `'empty'` → `'saving'` (Save pressed on first-time form)
- `'saving'` → `'view'` (first save success)

### Pattern 2: Async Load on Mount (established project pattern)

**What:** `useEffect` with inline async IIFE; null/loading state until resolved.
**When to use:** Every screen that reads from DB on mount.

```typescript
// Source: Mirrors useWinsStore.hydrate() pattern used by all existing screens
useEffect(() => {
  (async () => {
    try {
      const goal = await getGoal();
      if (goal && goal.text) {
        setSavedText(goal.text);
        setCurrentText(goal.text);
        setScreenState('view');
      } else {
        setScreenState('empty');
      }
    } catch {
      setScreenState('error');
    }
  })();
}, []);
```

Note: `getGoal()` returns `null` when no row exists (rows[0] ?? null). The schema defines `text` as `notNull().default("")` — but `getGoal()` returns `null` when no singleton row has been inserted yet (not an empty-string row). [VERIFIED: src/db/repositories/dreamGoal.ts + src/db/schema.ts]

Edge case: if a row exists with `text = ""` (empty string default), treat same as null → empty state. Guard: `if (goal && goal.text)`.

### Pattern 3: Reanimated Opacity Crossfade (withTiming)

**What:** Two sibling `Animated.View` nodes, one for GoalCard and one for GoalEditor, controlled by separate opacity shared values. When swapping, fade one out (0) and fade the other in (1) simultaneously.
**When to use:** In-place content swap with ~200ms ease, no layout shift.

```typescript
// Source: DateSectionHeader.tsx (withTiming rotation pattern, same API)
// + [CITED: docs.swmansion.com/react-native-reanimated/docs/animations/withTiming]
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const cardOpacity = useSharedValue(1);
const editorOpacity = useSharedValue(0);

const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));
const editorStyle = useAnimatedStyle(() => ({ opacity: editorOpacity.value }));

const enterEditMode = () => {
  cardOpacity.value = withTiming(0, { duration: 200 });
  editorOpacity.value = withTiming(1, { duration: 200 });
  setScreenState('editing');
};

const exitEditMode = () => {
  editorOpacity.value = withTiming(0, { duration: 200 });
  cardOpacity.value = withTiming(1, { duration: 200 });
  setScreenState('view');
};
```

**Layout-shift pitfall:** If both views occupy space simultaneously, they'll stack and cause a height jump. Solution: use `pointerEvents="none"` on the hidden view, or conditionally render only one at a time by gating on `screenState` and using a short opacity-only fade (no layout change, since both components occupy roughly the same height). Simplest approach: keep conditional render with `screenState !== 'loading'` guards; the 200ms fade is purely aesthetic on a content-swap, not a size-change — no layout shift occurs if GoalCard and GoalEditor have similar heights.

### Pattern 4: Keyboard Handling (KeyboardAvoidingView)

**What:** Wrap the screen content in `KeyboardAvoidingView` with `behavior="padding"` on iOS, `undefined` on Android.
**When to use:** Any screen with a TextInput that the keyboard could obscure.

```typescript
// Source: app/(tabs)/index.tsx lines 81-84 — exact pattern to match
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  className="flex-1"
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
>
  {/* ScrollView + GoalEditor inside */}
</KeyboardAvoidingView>
```

The goal screen uses a ScrollView (per UI-SPEC), which is correct — the keyboard pushes the scroll container up on iOS via `behavior="padding"`.

### Pattern 5: isDirty Comparison

**What:** Pure derived value — not stored in state.
**Implementation:**

```typescript
const isDirty = currentText.trim() !== savedText.trim();
```

Edge cases:
- Empty savedText + empty currentText → `isDirty = false` → Save disabled (correct: prevents saving nothing)
- Empty savedText + non-empty currentText → `isDirty = true` → Save enabled (correct: first save)
- Non-empty savedText + same content → `isDirty = false` → Save disabled (correct: no-op prevented)
- Whitespace-padded input vs. saved → trim makes them equal → `isDirty = false` (correct behavior)

Empty state Save button: in empty state, there is no `savedText`, so `savedText = ''`. The guard becomes `currentText.trim() !== ''` — which correctly enables Save only when the user has typed something. This is the same condition as `text.trim() === ""` opacity-50 check shown in UI-SPEC Empty State layout.

### Pattern 6: Character Counter Visibility

**What:** Show counter only when characters remaining ≤ 100.
**Implementation:**

```typescript
const remaining = 500 - currentText.length;
const showCounter = remaining <= 100;

// In render:
{showCounter && (
  <Text className="font-nunito-bold text-sm text-text-secondary text-right mt-1"
        accessibilityLabel={`${currentText.length} of 500 characters used`}>
    {remaining} / 500
  </Text>
)}
```

Note: UI-SPEC shows format `"{N} / 500"` where N is remaining (not used). React Native's `maxLength` prop truncates silently on paste — no additional guard needed. [ASSUMED — standard RN TextInput behavior; not tested in this session]

### Anti-Patterns to Avoid

- **StyleSheet.create for new components:** Project invariant — NativeWind className only. [VERIFIED: CLAUDE.md + tailwind.config.js]
- **Scheduling ALL future notifications in one call:** Not relevant to this phase.
- **UTC dates:** Not relevant to this phase (goal text is freeform, no date_key needed).
- **Zustand store for goal in Phase 4:** Deferred to Phase 6 — adds complexity without benefit when goal data doesn't need to be reactive across tabs.
- **useEffect dependency on mutable objects:** The load effect should run once on mount (`[]` dependency array) — no reactive deps needed since goal only changes on explicit Save.
- **Calling setScreenState('editing') before animation starts:** Set state immediately on pencil tap; the animation is cosmetic and runs concurrently. No need to wait for animation to finish before state change.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Singleton upsert pattern | Custom INSERT + UPDATE logic | `upsertGoal(text)` in dreamGoal.ts | Already implemented with `onConflictDoUpdate` |
| Opacity animation | Manual setTimeout opacity state | `withTiming` + `useSharedValue` | Runs on UI thread, no JS bridge jitter |
| Keyboard avoidance | Manual layout math | `KeyboardAvoidingView` (RN core) | Matches Home screen; handles safe area automatically |
| maxLength enforcement | Manual string truncation in onChange | `maxLength={500}` prop on TextInput | Native enforcement; handles paste correctly |

---

## getGoal() Return Shape

**Verified signature:** [VERIFIED: src/db/repositories/dreamGoal.ts]

```typescript
export async function getGoal(): Promise<DreamGoal | null>
```

- Returns `DreamGoal | null` — never throws (unless SQLite is unavailable)
- `DreamGoal` shape: `{ id: "singleton", text: string, updated_at: string }`
- Returns `null` when no row with `id = "singleton"` exists (first launch before any save)
- Does NOT return an empty-string row on first launch — the schema default `""` only applies if a row is explicitly inserted with no text value; `getGoal()` returns `null` until first `upsertGoal()` call

**Empty-state branch logic:**

```typescript
if (goal === null || goal.text === '') {
  setScreenState('empty');
} else {
  setSavedText(goal.text);
  setCurrentText(goal.text);
  setScreenState('view');
}
```

Guarding both `null` and `""` is defensive — technically only `null` should occur in practice (no upsert with empty text should be allowed), but the guard is cheap and safe.

---

## Component Decomposition (LOCKED per UI-SPEC)

The UI-SPEC defines the component split at `## Component Inventory`:

| Component | File | Role |
|-----------|------|------|
| `GoalCard` | `src/components/GoalCard.tsx` | View mode: hero text + motivational copy below. Card surface (`bg-surface rounded-xl px-4 py-6 shadow-sm border border-border`). Accepts `text: string` prop. |
| `GoalEditor` | `src/components/GoalEditor.tsx` | Edit mode: multiline TextInput + character counter + Save/Cancel row. Accepts `currentText`, `onChangeText`, `onSave`, `onCancel`, `isDirty`, `isSaving` props. |
| `GoalScreen` | `app/(tabs)/goal.tsx` | Orchestrator: state machine, DB load, dirty comparison, Reanimated animation values. |

**Phase 6 reusability:** `GoalEditor` accepts all its state via props — it is a pure controlled component. Phase 6 onboarding can render `GoalEditor` directly without coupling to the goal tab screen. This is the recommended split.

---

## Common Pitfalls

### Pitfall 1: getGoal() returns null — never empty string on first launch
**What goes wrong:** Code checks `if (!goal.text)` assuming an empty string is returned; but `goal` itself is null, causing a runtime crash.
**Why it happens:** The schema defines `text.default("")` but the default only applies if a row is inserted without specifying text — no row is inserted on first launch.
**How to avoid:** Always check `if (goal === null)` first, or use optional chaining: `goal?.text`.
**Warning signs:** TypeScript will catch `goal.text` when `goal: DreamGoal | null` — trust the type.

### Pitfall 2: Opacity animation + conditional render interaction
**What goes wrong:** Fading out a conditionally rendered element causes a flash — the element disappears immediately on state change before opacity reaches 0.
**Why it happens:** If you change `screenState` from `'view'` to `'editing'` at the same time as starting the fade, the conditional render (`{screenState === 'view' && <GoalCard />}`) removes the element immediately.
**How to avoid:** Use one of two strategies:
  - (A) Keep both views in the render tree always, control visibility via `pointerEvents` and opacity only — no conditional. Simpler.
  - (B) Delay state update until after animation completes using `withTiming` callback. More complex.
  - **Recommendation:** Strategy A for this phase — both GoalCard and GoalEditor are always mounted; opacity controls which is visible. Mount cost is negligible.
**Warning signs:** Flicker on state transition.

### Pitfall 3: Multiline TextInput height on Android
**What goes wrong:** `multiline={true}` on Android does not auto-expand by default; setting `minHeight` via NativeWind is required.
**Why it happens:** Android TextInput multiline behavior differs from iOS.
**How to avoid:** UI-SPEC specifies `minHeight 120px` on the TextInput — implement as `style={{ minHeight: 120 }}` (cannot use NativeWind for this — arbitrary values with units require the `style` prop in React Native).
**Warning signs:** TextInput appears as a single line on Android.

### Pitfall 4: isDirty trim edge case on Cancel
**What goes wrong:** User types spaces, cancels — `currentText` is reset to `savedText` (which has no trailing spaces) — the comparison was dirty, Cancel correctly reverts. No issue here; document for completeness.
**How to avoid:** On Cancel, always `setCurrentText(savedText)` (not `currentText`). The trim is only used for the isDirty comparison, not for resetting.

### Pitfall 5: Save with only whitespace
**What goes wrong:** User types "   ", isDirty is true (3 spaces vs empty string), Save enables, but after trim the goal is empty.
**How to avoid:** Save button should check `currentText.trim().length > 0` in addition to `isDirty`. In empty state, the button checks `text.trim() === ""` directly. Recommended validation: `const canSave = isDirty && currentText.trim().length > 0`.

### Pitfall 6: loading state flash → visible content
**What goes wrong:** If `screenState` starts as `'loading'` and immediately transitions to `'view'`, a flash of empty content occurs.
**Why it happens:** `useEffect` runs after first paint — on first render, screen is in `'loading'` state with empty content.
**How to avoid:** In `'loading'` state, render `SafeAreaView className="flex-1 bg-background"` with no children — same background as all content states, no flash. [VERIFIED: UI-SPEC State Machine — loading shows empty SafeAreaView]

---

## Code Examples

Verified patterns from official sources and codebase:

### GoalScreen skeleton (state machine + load)

```typescript
// Source: inferred from index.tsx + wins.tsx + DateSectionHeader.tsx patterns
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { getGoal, upsertGoal } from '@/src/db/repositories/dreamGoal';
import { GoalCard } from '@/src/components/GoalCard';
import { GoalEditor } from '@/src/components/GoalEditor';

type GoalState = 'loading' | 'empty' | 'view' | 'editing' | 'saving' | 'error';

export default function GoalScreen() {
  const [screenState, setScreenState] = useState<GoalState>('loading');
  const [savedText, setSavedText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [saveError, setSaveError] = useState(false);

  const cardOpacity = useSharedValue(0);
  const editorOpacity = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));
  const editorStyle = useAnimatedStyle(() => ({ opacity: editorOpacity.value }));

  const isDirty = currentText.trim() !== savedText.trim();
  const canSave = isDirty && currentText.trim().length > 0;

  useEffect(() => {
    (async () => {
      try {
        const goal = await getGoal();
        if (goal && goal.text) {
          setSavedText(goal.text);
          setCurrentText(goal.text);
          cardOpacity.value = withTiming(1, { duration: 200 });
          setScreenState('view');
        } else {
          editorOpacity.value = withTiming(1, { duration: 200 });
          setScreenState('empty');
        }
      } catch {
        setScreenState('error');
      }
    })();
  }, []);

  // ... enterEdit, handleSave, handleCancel handlers
}
```

### Reanimated withTiming crossfade (from DateSectionHeader.tsx)

```typescript
// Source: src/components/DateSectionHeader.tsx — exact same API used for chevron
rotation.value = withTiming(isCollapsed ? 180 : 0, { duration: 200 });
// Goal screen adaptation:
cardOpacity.value = withTiming(0, { duration: 200 });
editorOpacity.value = withTiming(1, { duration: 200 });
```

### WinInputArea pattern to inherit (keyboard + button)

```typescript
// Source: src/components/WinInputArea.tsx lines 45-57
<Pressable
  onPress={handleSave}
  disabled={!canSave}
  className={`bg-primary rounded-lg min-h-[44px] flex-1 items-center justify-center px-3 ${
    !canSave ? 'opacity-50' : 'opacity-100'
  }`}
  accessibilityRole="button"
  accessibilityLabel="Save Goal"
  accessibilityState={{ disabled: !canSave }}
>
  <Text className="font-nunito-bold text-sm text-white">Save Goal</Text>
</Pressable>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Expo managed workflow uses StyleSheet | NativeWind v4 className everywhere | Phase 1 decision | No StyleSheet.create in new components |
| Integer auto-increment PKs | UUID string PKs | Phase 1 invariant | singleton id="singleton" for dream_goal |
| Zustand for all app state | Zustand for shared state only; local useState for tab-local state | CONTEXT.md discretion (Phase 4) | Goal screen uses local state, not store |

**Deprecated/outdated:**
- `font-nunito-semibold` in old placeholder goal.tsx (line 8): Use `font-nunito-bold` for headings per UI-SPEC typography contract. The `semibold` weight (600) is available but UI-SPEC specifies only regular (400) and bold (700).

---

## Runtime State Inventory

Step 2.5 SKIPPED — this is a greenfield UI implementation phase, not a rename/refactor/migration phase. No runtime state audit required.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| expo-sqlite | DB reads/writes | ✓ | `~55.0.15` | — |
| drizzle-orm | DB queries | ✓ | `^0.45.2` | — |
| react-native-reanimated | Opacity crossfade | ✓ | `^3.19.5` (pinned) | — |
| Ionicons | Pencil icon | ✓ | Bundled with Expo 55 | — |
| NativeWind v4 | All styling | ✓ | `^4.2.3` | — |

[VERIFIED: package.json]

No missing dependencies. All required packages already installed and used in prior phases.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest 29.7.0 + ts-jest |
| Config file | `jest.config.js` (root) |
| Quick run command | `npx jest src/__tests__/goalValidation.test.ts --no-coverage` |
| Full suite command | `npx jest --no-coverage` |

[VERIFIED: jest.config.js, package.json devDependencies]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| GOAL-01 | `validateGoalText` — empty string rejected | unit | `npx jest src/__tests__/goalValidation.test.ts -t "rejects empty"` | ❌ Wave 0 |
| GOAL-01 | `validateGoalText` — whitespace-only rejected | unit | `npx jest src/__tests__/goalValidation.test.ts -t "rejects whitespace"` | ❌ Wave 0 |
| GOAL-01 | `validateGoalText` — exactly 500 chars accepted | unit | `npx jest src/__tests__/goalValidation.test.ts -t "500 chars"` | ❌ Wave 0 |
| GOAL-01 | isDirty logic — trim comparison | unit | `npx jest src/__tests__/goalValidation.test.ts -t "isDirty"` | ❌ Wave 0 |
| GOAL-01 | Character counter visibility threshold (≤100 remaining) | unit | `npx jest src/__tests__/goalValidation.test.ts -t "counter"` | ❌ Wave 0 |
| GOAL-02 | Motivational copy present in both states | manual UAT | — | — |
| GOAL-03 | Edit flow end-to-end (pencil → edit → save → view) | manual UAT | — | — |

Note: GOAL-02 and GOAL-03 are UI interaction behaviors — unit tests cover the logic functions; full interaction testing is manual UAT per project convention (no Detox/E2E framework installed).

### Sampling Rate

- **Per task commit:** `npx jest src/__tests__/goalValidation.test.ts --no-coverage`
- **Per wave merge:** `npx jest --no-coverage`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/goalValidation.test.ts` — covers GOAL-01 logic (validateGoalText, isDirty, counter threshold)
- [ ] `src/utils/goalValidation.ts` — utility extracted from GoalEditor so it is testable in node environment (mirrors winValidation.ts pattern)

*(Wave 0 creates the utility function + test file before implementing the UI components.)*

---

## Security Domain

This phase stores only free-text user-authored content in local SQLite. No authentication, no network calls, no cryptography.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | — |
| V3 Session Management | No | — |
| V4 Access Control | No | — |
| V5 Input Validation | Yes (minimal) | `maxLength={500}` on TextInput + trim validation in `validateGoalText` |
| V6 Cryptography | No | — |

No threat patterns beyond standard local storage. No data leaves the device in Phase 4. [VERIFIED: CLAUDE.md "No in-app AI calls"; CONTEXT.md "Out of scope: AI analysis (V2+)"]

---

## Open Questions (RESOLVED)

1. **GoalCard vs GoalEditor height delta**
   - What we know: GoalCard (hero text at 28px bold, `py-6`) will be taller for short goals and shorter for long goals. GoalEditor (TextInput with `minHeight 120px`, `py-4`) has a fixed minimum.
   - What's unclear: For very short goals (1-2 words), GoalCard might be shorter than GoalEditor, causing a layout height change on swap — which the opacity-only approach does NOT handle (it would cause a content jump).
   - **RESOLVED:** Use Strategy A — both GoalCard and GoalEditor stay mounted as siblings; apply `pointerEvents="none"` to the hidden one via Reanimated `useAnimatedStyle`. ScrollView absorbs any height difference. Implemented in Plan 04-03 (goal.tsx state machine).
   - Alternative considered + rejected: fixed `minHeight` on GoalCard — adds visual artifact on short goals.

2. **Empty state — GoalEditor reuse or dedicated layout**
   - What we know: UI-SPEC defines empty state as "GoalEditor — same component as edit mode". The Save row in empty state is full-width (not flex-row with Cancel), which differs from edit mode (flex-row with Cancel + Save).
   - What's unclear: Does GoalEditor need a `mode: 'empty' | 'editing'` prop to control the action row, or should GoalScreen render the Save button separately in empty state?
   - **RESOLVED:** Add `showCancel: boolean` prop to GoalEditor. `showCancel={false}` (empty state) → Save renders full-width. `showCancel={true}` (edit mode) → Cancel + Save render flex-row. Single component, no `mode` enum. Implemented in Plan 04-02 (GoalEditor props) and Plan 04-03 (passed from goal.tsx).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | React Native TextInput truncates silently on paste when `maxLength` is reached | Character Counter pattern | If it throws or behaves differently, the counter UI would still work correctly; the paste behavior is a UX note only |
| A2 | `minHeight` for multiline TextInput must use `style` prop, not NativeWind className | Pitfall 3 | If NativeWind supports arbitrary minHeight values, `className="min-h-[120px]"` would work instead — test in Wave 0 task |

---

## Project Constraints (from CLAUDE.md)

| Directive | Enforcement |
|-----------|-------------|
| Timezone-safe dates: `YYYY-MM-DD` in local time | Not applicable to goal text (freeform string, no date key) |
| UUID PKs | dream_goal uses singleton string `id="singleton"` — not UUID but project-approved exception [VERIFIED: schema.ts] |
| No in-app AI calls | Goal is pure local text — no API calls |
| No guilt language | Empty state, error states, and all copy must use encouraging forward-looking framing [VERIFIED: UI-SPEC Copywriting Contract] |
| 30-day notification window | Not applicable to this phase |
| NativeWind v4 className everywhere — no StyleSheet.create | All GoalCard, GoalEditor, GoalScreen styling must use className |
| expo-sqlite v2 + Drizzle ORM | Use existing `getGoal()`/`upsertGoal()` — do not bypass Drizzle |
| Reanimated v3.19.5 (pinned) | Use `withTiming` + `useSharedValue` + `useAnimatedStyle` — do not upgrade |
| V2 migration: nullable columns pre-included | dream_goal table has no `synced_at`/`remote_id`/`category` columns — V2 migration will add them additive |

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: src/db/repositories/dreamGoal.ts] — getGoal() and upsertGoal() signatures, return types, null behavior
- [VERIFIED: src/db/schema.ts] — dream_goal table structure, DreamGoal type
- [VERIFIED: src/components/DateSectionHeader.tsx] — withTiming rotation pattern (identical API to opacity fade)
- [VERIFIED: app/(tabs)/index.tsx] — KeyboardAvoidingView pattern, Platform.OS conditional, useEffect hydration pattern
- [VERIFIED: src/components/WinInputArea.tsx] — TextInput + Pressable CTA button pattern, opacity-50 disabled style
- [VERIFIED: src/components/WinCard.tsx] — card surface className pattern (bg-surface rounded-xl px-4 py-3 shadow-sm)
- [VERIFIED: package.json] — all dependency versions
- [VERIFIED: jest.config.js] — Jest configuration, test match pattern
- [VERIFIED: tailwind.config.js + src/constants/theme.ts] — color tokens, font families
- [CITED: docs.swmansion.com/react-native-reanimated/docs/animations/withTiming] — withTiming signature, duration parameter, UI thread execution
- [VERIFIED: .planning/phases/04-dream-goal/04-CONTEXT.md] — all locked decisions D-01 through D-09
- [VERIFIED: .planning/phases/04-dream-goal/04-UI-SPEC.md] — component inventory, state machine, screen layout contract, copywriting contract, accessibility contract

### Secondary (MEDIUM confidence)
- [VERIFIED: src/__tests__/winValidation.test.ts] — Jest test pattern to mirror for goalValidation tests

### Tertiary (LOW confidence)
- [ASSUMED: A1] React Native maxLength truncates silently on paste (standard RN behavior — not tested in this session)
- [ASSUMED: A2] NativeWind `min-h-[120px]` may not work for TextInput minHeight on Android — use style prop as fallback

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all verified against package.json and codebase
- Architecture: HIGH — all patterns verified against existing screen implementations
- Pitfalls: HIGH (MEDIUM for A1/A2 assumptions) — most verified from codebase reading; two assumptions flagged
- Validation: HIGH — Jest infrastructure verified, test pattern from winValidation is directly applicable

**Research date:** 2026-05-12
**Valid until:** 2026-06-12 (stable Expo/Reanimated stack; no fast-moving dependencies)

---
phase: 2
slug: core-win-entry-loop
status: research-complete
researched: 2026-05-09
confidence: HIGH
---

# Phase 2: Core Win-Entry Loop — Research

**Researched:** 2026-05-09
**Domain:** Zustand v5 store, Reanimated 3 entering animation, FlatList layout, keyboard handling, streak/label logic
**Confidence:** HIGH (existing codebase verified; library APIs verified via official docs and upstream source)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Home tab IS the win entry screen — `app/(tabs)/index.tsx` fully replaced
- D-02: Layout order top → bottom: streak header → scrollable today's-wins list → pinned input area
- D-03: No "I'm done for today" button — WIN-04 overridden; session = full calendar day; always open
- D-04: Streak header contains trophy image + baked-in encouraging label string + secondary total-wins counter
- D-05: Encouraging labels vary by tier; streak=0 label is welcoming, never shame/guilt (STREAK-04 + CLAUDE.md invariant)
- D-06: Example prompts: 3 muted lines above input, non-tappable, rotate daily via `date_key` seed into 40–50 pool
- D-07: Empty state (0 wins today): trophy image centered + "What was your win today?" heading + prompts + input
- D-08: On Add: scale+fade micro-animation on new item, input clears, keyboard stays open

### Claude's Discretion
- Exact encouraging label strings per streak tier (1, 3, 7, 14, 30, 60, 100+ days)
- Zustand store shape for today's wins + streak stats
- Keyboard avoidance behavior (KeyboardAvoidingView vs react-native-keyboard-controller)
- Prompt rotation deterministic algorithm details

### Deferred Ideas (OUT OF SCOPE)
- WIN-04 "I'm done for today" button (removed by D-03)
- Confetti/full celebration screen
- Example prompts personalization (V2+)
- Prompt pool authoring by user (Claude generates during execution)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WIN-01 | User can type a free-text win (1–200 characters) | TextInput with maxLength=200 and validation guard before insert |
| WIN-02 | 3 non-tappable daily-rotating example prompts from 40–50 pool | Deterministic daily index: `dateKeyToIndex()` seeding into pool array |
| WIN-03 | Multiple wins per session without leaving screen | Keyboard stays open after add; FlatList shows accumulated wins in-session |
| WIN-04 | (overridden by D-03) Session lock replaced by always-open calendar-day model | Document override: store tracks wins list, not session state |
| STREAK-01 | Home shows current streak prominently | `computeStreak()` already in `dateUtils.ts`; Zustand exposes `streak` computed on hydrate and after each add |
| STREAK-02 | Streak resets to 0 if no wins for a calendar day | `computeStreak()` logic handles gap detection — verified in existing code |
| STREAK-03 | Total wins counter always grows, never resets | `totalWins = wins.length` in store; no reset path |
| STREAK-04 | Encouraging labels only, no guilt/punishment language | Pure `streakLabel(count)` function; verified tier copy meets invariant |
</phase_requirements>

---

## Summary

Phase 2 is a vertical slice: Zustand store layer (new) + Home screen UI (full replacement) + pure utility functions (streak label, prompt rotation). The database layer and streak calculation algorithm are already implemented in Phase 1 (`insertWin`, `getWins`, `getDistinctDateKeys`, `computeStreak`, `toDateKey` — all verified in the codebase). Phase 2 wires those into a reactive UI.

The dominant technical decisions are: (1) store shape and hydration timing, (2) FlatList layout pattern for the "chat-style grows upward" UX, (3) keyboard avoidance that works reliably on both platforms, and (4) Reanimated 3 entering animation that fires only on genuine new-item adds.

**Primary recommendation:** Non-inverted FlatList with `data` array reversed (newest first) + `scrollToOffset(0)` after add + `KeyboardAvoidingView behavior="padding"` on iOS and `undefined` on Android. This avoids the multiple known bugs with inverted FlatList + entering animations in Reanimated.

WIN-04 override is documented: the requirement asked for an "I'm done" session-lock button, but D-03 explicitly removes this. The store has no session-lock state — the day is always open. This must be noted in REQUIREMENTS.md as "overridden by D-03" at the end of the phase.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Win text input + submit | Client (React Native View layer) | — | Pure UI interaction; no server needed |
| Win persistence | Database (expo-sqlite via Drizzle) | — | Source of truth; `insertWin()` already implemented |
| Today's wins list | Client (Zustand store + FlatList) | Database (hydrate on mount) | Zustand caches for re-render perf; DB is source of truth |
| Streak calculation | Client (pure function `computeStreak()`) | — | Already implemented in `dateUtils.ts`; runs on hydrate + after add |
| Streak display + label | Client (Zustand derived value + pure `streakLabel()`) | — | Display-only, fully derived from streak count |
| Total wins counter | Client (Zustand `totalWins = wins.length`) | — | Derived from store array length |
| Example prompt rotation | Client (pure `selectDailyPrompts(dateKey, pool)`) | — | Deterministic; no persistence needed; same result all day |
| Micro-animation | Client (Reanimated 3 entering animation) | — | UI feedback only; no data involvement |
| Keyboard avoidance | Client (KeyboardAvoidingView) | — | Platform layout concern |

---

## Context Summary

### What Phase 1 Already Delivered (Do Not Re-implement)

[VERIFIED: codebase grep]

| Asset | Location | Status |
|-------|----------|--------|
| `insertWin(text)` | `src/db/repositories/wins.ts` | Ready — writes UUID, date_key, logged_at |
| `getWins()` | `src/db/repositories/wins.ts` | Ready — returns all wins DESC by date_key |
| `getDistinctDateKeys()` | `src/db/repositories/wins.ts` | Ready — returns `string[]` DESC for streak calc |
| `computeStreak(distinctDateKeys)` | `src/utils/dateUtils.ts` | Ready — handles today/yesterday anchor + DST gap detection |
| `toDateKey(date)` | `src/utils/dateUtils.ts` | Ready — timezone-safe `YYYY-MM-DD` via `en-CA` locale |
| `generateId()` | `src/utils/uuid.ts` | Ready — `expo-crypto.randomUUID()` |
| `Colors`, `Fonts` | `src/constants/theme.ts` | Ready — NativeWind tokens locked |
| `trophy.png` | NOT YET IN assets/images/ | Must be added in Phase 2 — icon.png is the source |

**Note on trophy asset:** `assets/images/` contains only icon variants. The CONTEXT.md references `assets/images/trophy.png` but it does not exist yet. Phase 2 must copy the app icon source PNG or a cropped version of `icon.png` to `assets/images/trophy.png`.

### Installed Packages Relevant to Phase 2

[VERIFIED: package.json]

| Package | Version | Purpose |
|---------|---------|---------|
| `zustand` | ^5.0.13 | State store — Phase 2 introduces this layer |
| `react-native-reanimated` | ^3.19.5 | Entering animations for new win items |
| `date-fns` | ^4.1.0 | Available but NOT needed — `computeStreak` uses custom string logic |
| `react-native-worklets` | 0.7.4 | Reanimated worklet runtime (auto-peer) |

---

## Recommended Approach per Critical Research Target

### 1. Zustand v5 Store Pattern

[VERIFIED: github.com/pmndrs/zustand README + ignitecookbook.com Zustand recipe]

**Store shape for wins + streak:**

```typescript
// src/stores/useWinsStore.ts
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { insertWin, getWins, getDistinctDateKeys } from "@/src/db/repositories/wins";
import { computeStreak, toDateKey } from "@/src/utils/dateUtils";
import type { Win } from "@/src/db/schema";

interface WinsState {
  wins: Win[];           // ALL wins, used for totalWins count
  todayWins: Win[];      // wins where date_key === today — rendered on Home
  streak: number;        // computed consecutive day count
  totalWins: number;     // wins.length — never decreases
  isHydrated: boolean;
}

interface WinsActions {
  hydrate: () => Promise<void>;
  addWin: (text: string) => Promise<void>;
}

export const useWinsStore = create<WinsState & WinsActions>()((set, get) => ({
  wins: [],
  todayWins: [],
  streak: 0,
  totalWins: 0,
  isHydrated: false,

  hydrate: async () => {
    const wins = await getWins();
    const dateKeys = await getDistinctDateKeys();
    const today = toDateKey();
    set({
      wins,
      todayWins: wins.filter((w) => w.date_key === today),
      streak: computeStreak(dateKeys),
      totalWins: wins.length,
      isHydrated: true,
    });
  },

  addWin: async (text: string) => {
    await insertWin(text);
    // Re-hydrate streak from DB (single source of truth)
    const wins = await getWins();
    const dateKeys = await getDistinctDateKeys();
    const today = toDateKey();
    set({
      wins,
      todayWins: wins.filter((w) => w.date_key === today),
      streak: computeStreak(dateKeys),
      totalWins: wins.length,
    });
  },
}));

// Selector hooks (prevent unnecessary re-renders)
export const useTodayWins = () => useWinsStore((s) => s.todayWins);
export const useStreak = () => useWinsStore((s) => s.streak);
export const useTotalWins = () => useWinsStore((s) => s.totalWins);
export const useIsHydrated = () => useWinsStore((s) => s.isHydrated);
export const useAddWin = () => useWinsStore((s) => s.addWin);
```

**Key decisions:**
- Do NOT use `zustand/middleware/persist` — SQLite is the persistence layer, not AsyncStorage
- No `_hasHydrated` + `onRehydrateStorage` pattern (that's for persist middleware) — use simple `isHydrated: boolean` set in `hydrate()` action
- Re-query DB after every `addWin` — avoids optimistic update divergence and streak recompute errors
- Single selector per value (not `useShallow` object unless selecting 2+ values together) [VERIFIED: zustand README]

**v5-specific:** `create<State>()((set, get) => ({...}))` — double parentheses required for TypeScript inference in v5. The extra `()` after `create<State>` is a v5 TypeScript pattern change. [VERIFIED: zustand README]

---

### 2. Hydration Timing

[VERIFIED: existing `app/_layout.tsx` + architecture research]

The `app/_layout.tsx` already gates the splash screen on `migrationsSuccess && fontsLoaded`. Phase 2 must call `hydrate()` after the migrations gate clears — NOT before.

**Pattern:** Call `hydrate()` from `useEffect` inside `HomeScreen`, not from `_layout.tsx`. Reason: only the Home screen needs this data immediately; other tabs don't. Avoids loading all wins on every cold start regardless of which tab opens.

```typescript
// app/(tabs)/index.tsx
export default function HomeScreen() {
  const { hydrate, isHydrated } = useWinsStore(
    useShallow((s) => ({ hydrate: s.hydrate, isHydrated: s.isHydrated }))
  );

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, []);

  if (!isHydrated) {
    return <LoadingView />;   // or null — splashscreen already hidden by this point
  }
  // ... render home content
}
```

**Race condition:** `_layout.tsx` already returns `null` until `ready` (migrations + fonts). By the time `HomeScreen` mounts, the DB is guaranteed ready. No additional guard needed in the store.

---

### 3. Streak Label Pure Function

[ASSUMED for label strings themselves; algorithm pattern is HIGH confidence]

Tier breakpoints from CONTEXT.md D-05. Pure function with no side effects — easy to unit test:

```typescript
// src/utils/streakLabel.ts
export function streakLabel(streak: number): string {
  if (streak === 0)  return "Start your streak today! 🌟";
  if (streak === 1)  return "Day 1! Every streak starts here. 🎉";
  if (streak <= 2)   return `${streak} days! You're getting started! 🌱`;
  if (streak <= 6)   return `${streak} day streak! Keep it up! 💪`;
  if (streak <= 13)  return `${streak} day streak! You're building something real! 🔥`;
  if (streak <= 29)  return `${streak} day streak! You're on fire! 🔥🔥`;
  if (streak <= 59)  return `${streak} day streak! You're unstoppable! 🚀`;
  if (streak <= 99)  return `${streak} day streak! Legendary! 🏆`;
  return `${streak} day streak! You're a Winning Streak champion! 👑`;
}
```

**Invariant check:** streak=0 is welcoming ("Start your streak today!") — never shame/blame. All tiers positive. [VERIFIED: matches CONTEXT.md D-05 and CLAUDE.md no-guilt invariant]

---

### 4. Daily Prompt Rotation Algorithm

[VERIFIED: algorithm pattern; prompt pool strings are ASSUMED — Claude generates during execution]

**Deterministic daily selection — no randomness:**

```typescript
// src/utils/promptUtils.ts
import { EXAMPLE_PROMPTS } from "@/src/constants/examplePrompts";

export function selectDailyPrompts(dateKey: string, count = 3): string[] {
  // Convert dateKey "YYYY-MM-DD" to a stable seed integer
  // Simple approach: sum char codes of the date string
  const seed = dateKey.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  
  const pool = EXAMPLE_PROMPTS;
  const startIndex = seed % pool.length;
  
  // Take `count` prompts wrapping around the array
  return Array.from({ length: count }, (_, i) => pool[(startIndex + i) % pool.length]);
}
```

**Properties:**
- Same 3 prompts all day (seed is stable from date_key)
- Different prompts each calendar day (date_key changes daily)
- Wraps around the pool without repeating on same day (assuming pool >= 3 and count=3)
- No shuffle state to persist — pure function of dateKey

**Pool size requirement:** CONTEXT.md specifies 40–50 prompts. With 40 prompts and seed=`sum(char codes)`, collision rate (same 3 prompts on 2 consecutive days) is low but not zero. Acceptable for V1.

**Prompt pool file:** `src/constants/examplePrompts.ts` — 40–50 plain short phrases. Authored by Claude during execution. Format: `"I helped a colleague today"`, `"I finished something I'd been avoiding"`.

---

### 5. FlatList Layout — Chat-Style "Grows Upward"

[VERIFIED: React Native docs + multiple upstream discussions]

**Recommended pattern: Non-inverted FlatList, newest-first data array, scroll to offset after add**

The D-02 layout (streak header → wins list → pinned input) with wins stacking above input is best implemented as a **non-inverted** FlatList with data sorted newest-first. This avoids the known bugs with `inverted` + entering animations in Reanimated 3.

```typescript
// In HomeScreen — wins list
const flatListRef = useRef<FlatList>(null);

// Data: todayWins sorted newest-first (DB query already returns DESC by date_key)
// Within same date_key, sort by logged_at DESC:
const displayWins = [...todayWins].sort(
  (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
);

// After addWin resolves, scroll to top to show the new item
const handleAdd = async () => {
  if (!inputText.trim() || inputText.length > 200) return;
  await addWin(inputText.trim());
  setInputText("");
  flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  // keyboard stays open — do NOT call TextInput.blur()
};
```

**Why not inverted FlatList:**
- Known issue: `inverted` + Reanimated entering animation causes items to animate off-screen when list is full [VERIFIED: GitHub issue #4450 + #2769]
- Known issue: `inverted` + `itemLayoutAnimation` TypeScript type errors [VERIFIED: GitHub issue #2769]
- `inverted` is the correct pattern for true chat (newest at bottom, scrolled to bottom). Our UX is different: newest shows at top of list, user reads down. Non-inverted is correct.

**`getItemLayout` consideration:** For Phase 2, win card heights are variable (text wraps). Skip `getItemLayout` — acceptable perf for today's wins list (typically <20 items per day). Phase 3 (history with 1000+ items) will need this.

---

### 6. Reanimated 3 Entering Animation for New Win Items

[VERIFIED: official Reanimated docs + GitHub discussion #6748]

**Problem:** FlatList remounts items when scrolled out of viewport. `entering` prop fires on every mount, not just genuine first adds. For today's wins (short list, rarely scrolled), this is low-risk — but the solution is still documented here.

**Recommended approach: useRef-tracked index for conditional entering**

```typescript
// src/components/WinCard.tsx
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

// Entering animation: scale from 0.85 to 1 + fade from 0 to 1
// Closest built-in: ZoomIn (scale) — or combine via custom
// Simplest: FadeInDown (opacity + slight translateY) which reads as "appearing"
// For true scale+fade: use ZoomIn.duration(300) — scales from ~0 to 1 + fades

interface WinCardProps {
  win: Win;
  isNew: boolean;   // true only for the item just added
}

export function WinCard({ win, isNew }: WinCardProps) {
  return (
    <Animated.View entering={isNew ? ZoomIn.duration(300) : undefined}>
      {/* card content */}
    </Animated.View>
  );
}
```

**Tracking "isNew" in the parent:** After `addWin` resolves, the store updates `todayWins`. The new item is always at index 0 (newest first). Pass `isNew={index === 0}` to the first rendered item only when the list length just increased. Use a `useRef<number>` to track previous list length:

```typescript
const prevLengthRef = useRef(todayWins.length);
const justAdded = todayWins.length > prevLengthRef.current;
useEffect(() => {
  prevLengthRef.current = todayWins.length;
}, [todayWins.length]);

// renderItem:
// isNew={index === 0 && justAdded}
```

**Animation choice:** `ZoomIn.duration(300)` scales from near-zero to full size with opacity fade. This satisfies D-08 "scale + fade" precisely. Duration 250–350ms feels snappy without jarring.

**Gotcha:** Do NOT use `FadeInDown` on the first item when keyboard is open — the downward translate motion conflicts visually with keyboard slide. `ZoomIn` or `FadeIn` (opacity only) are safer.

---

### 7. Keyboard Handling — Pinned Input at Bottom

[VERIFIED: docs.expo.dev/guides/keyboard-handling + React Native docs + open GitHub issues]

**Recommended: `KeyboardAvoidingView` with platform-specific `behavior`**

```typescript
import { KeyboardAvoidingView, Platform } from "react-native";

// Wrap the entire screen content
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : undefined}
  keyboardVerticalOffset={0}  // adjust if header exists above KAV
>
  {/* streak header */}
  {/* FlatList */}
  {/* pinned input */}
</KeyboardAvoidingView>
```

**Why not `react-native-keyboard-controller`:**
- Requires development build (not Expo Go) — adds complexity
- Is a native module — needs EAS dev build to test
- Expo docs recommend it for "complex interactions beyond basic keyboard avoidance"
- Phase 2 keyboard need is simple: push input above keyboard when it opens
- `KeyboardAvoidingView` with `padding` behavior is sufficient and works in Expo Go

**Known Android issue:** `behavior="height"` + `SafeAreaView` leaves extra padding after keyboard closes [VERIFIED: GitHub issue #52596]. Mitigation: use `behavior={Platform.OS === "ios" ? "padding" : undefined}` — Android's window resize mode (`android:windowSoftInputMode="adjustResize"`) handles the keyboard natively without KAV intervention.

**Layout structure for Home screen:**

```typescript
<SafeAreaView className="flex-1 bg-background">
  <KeyboardAvoidingView
    className="flex-1"
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    {/* Streak Header — fixed height */}
    <StreakHeader />

    {/* Today's Wins List — flex-1, scrollable */}
    <FlatList ... />

    {/* Pinned Input Area — fixed at bottom */}
    <WinInputArea />
  </KeyboardAvoidingView>
</SafeAreaView>
```

**Empty state:** When `todayWins.length === 0`, replace FlatList with centered empty state view (trophy + "What was your win today?" heading). The WinInputArea remains pinned at bottom in both states.

---

### 8. WIN-04 Override Documentation

[VERIFIED: CONTEXT.md D-03]

WIN-04 requires: "User taps 'I'm done for today' to end session and sees a summary."

D-03 overrides this entirely. The store has no concept of "session locked" or "session ended." The home screen is always in entry mode during the calendar day. Today's wins accumulate inline.

**How to satisfy WIN-04 in spirit:** Today's inline wins list IS the summary. The user sees all wins logged today at all times. The streak header updates in real-time. No explicit session end action is needed.

**Planner action:** Mark WIN-04 as "overridden by D-03" in REQUIREMENTS.md after Phase 2 complete. The behavior that satisfies the intent (see your wins, know your session state) is delivered — just differently than the requirement's literal description.

---

### 9. Empty State vs. Populated State

**Empty state (0 todayWins):**
```
SafeAreaView
  KeyboardAvoidingView
    StreakHeader (always visible)
    View (flex-1, centered)
      Image: trophy.png
      Text: "What was your win today?" (Heading/28px Nunito ExtraBold)
    ExamplePrompts (3 lines, muted, above input)
    WinInputArea (pinned)
```

**Populated state (≥1 todayWins):**
```
SafeAreaView
  KeyboardAvoidingView
    StreakHeader (always visible)
    FlatList (flex-1, todayWins newest-first)
      WinCard (each win)
    ExamplePrompts (3 lines, muted, above input)
    WinInputArea (pinned)
```

**Transition:** Toggle between empty state and FlatList based on `todayWins.length === 0`. The `ExamplePrompts` and `WinInputArea` are always visible regardless of state.

---

## File Map

### New Files to Create

| File | Purpose |
|------|---------|
| `src/stores/useWinsStore.ts` | Zustand store — wins, streak, totalWins, hydrate, addWin |
| `src/utils/streakLabel.ts` | Pure function `streakLabel(count: number): string` |
| `src/utils/promptUtils.ts` | Pure function `selectDailyPrompts(dateKey, count): string[]` |
| `src/constants/examplePrompts.ts` | Static array of 40–50 prompt strings |
| `src/components/WinCard.tsx` | Animated win item (Reanimated ZoomIn entering) |
| `src/components/WinInputArea.tsx` | TextInput + Add button, 1–200 char validation |
| `src/components/StreakHeader.tsx` | Trophy image + streak label + total wins counter |
| `src/components/ExamplePrompts.tsx` | 3 muted non-tappable prompt lines |

### Existing Files to Modify

| File | Change |
|------|--------|
| `app/(tabs)/index.tsx` | Full replacement — Phase 2 Home screen implementation |
| `assets/images/trophy.png` | ADD — copy/crop from `assets/images/icon.png` source |

### Existing Files — Read-Only (Do Not Modify)

| File | Reason |
|------|--------|
| `src/db/repositories/wins.ts` | `insertWin`, `getWins`, `getDistinctDateKeys` already correct |
| `src/utils/dateUtils.ts` | `toDateKey`, `computeStreak` already correct |
| `src/utils/uuid.ts` | `generateId` already correct |
| `src/db/schema.ts` | Schema already has all needed columns |
| `app/_layout.tsx` | Migration gate and font preload already correct |
| `tailwind.config.js` | All tokens already defined |
| `src/constants/theme.ts` | Colors and Fonts already defined |

---

## Validation Architecture (Nyquist)

Nyquist validation is enabled (`workflow.nyquist_validation: true` in config.json).

Phase 1 established manual-only verification. Phase 2 introduces pure utility functions that CAN and SHOULD be unit tested in isolation. Install jest as part of Wave 0.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Jest + ts-jest (no native module dependencies needed for pure function tests) |
| Config file | `jest.config.js` — Wave 0 creates this |
| Quick run | `npx jest --testPathPattern="unit" --no-coverage` |
| Full suite | `npx jest --no-coverage` |

**Wave 0 installs:**
```bash
npm install -D jest @types/jest ts-jest
```

Create `jest.config.js`:
```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathPattern: ['src/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File |
|--------|----------|-----------|-------------------|------|
| WIN-01 | 1-char and 200-char wins accepted; 0-char and 201-char rejected | Unit | `npx jest src/__tests__/winValidation.test.ts` | Wave 0 gap |
| WIN-02 | Same 3 prompts returned for same dateKey; different for different dateKey | Unit | `npx jest src/__tests__/promptUtils.test.ts` | Wave 0 gap |
| WIN-03 | Multiple addWin calls accumulate in todayWins list | Integration (manual) | Launch app → add 3 wins → confirm all 3 visible | Manual |
| WIN-04 | (overridden) No session state; screen always accepts input | Smoke (manual) | Launch app → confirm input always accessible | Manual |
| STREAK-01 | computeStreak returns correct count | Unit | `npx jest src/__tests__/streakLabel.test.ts` | Wave 0 gap |
| STREAK-02 | streak=0 when most recent date is before yesterday | Unit | `npx jest src/__tests__/dateUtils.test.ts` | Wave 0 gap |
| STREAK-03 | totalWins increments after addWin | Integration (manual) | Add win → confirm total increments in header | Manual |
| STREAK-04 | streak=0 label contains no shame/guilt words | Unit | `npx jest src/__tests__/streakLabel.test.ts` | Wave 0 gap |

### Wave 0 Test Gaps

The following test files must be created in Wave 0 before feature implementation waves:

- [ ] `src/__tests__/streakLabel.test.ts` — covers WIN-01 char limits, STREAK-01 label tiers, STREAK-04 no-guilt audit
- [ ] `src/__tests__/promptUtils.test.ts` — covers WIN-02 determinism and rotation
- [ ] `src/__tests__/dateUtils.test.ts` — covers STREAK-02 gap detection (already has `computeStreak` from Phase 1 — extend file)
- [ ] `jest.config.js` — framework config
- [ ] Install jest dependencies: `npm install -D jest @types/jest ts-jest`

### Key Unit Test Cases

**`streakLabel` tests:**
```typescript
// All tiers produce output
expect(streakLabel(0)).not.toMatch(/miss|fail|broke|punish|shame/i);
expect(streakLabel(0)).toContain("🌟");
expect(streakLabel(7)).toContain("7 day streak");
expect(streakLabel(100)).toContain("100 day streak");
```

**`selectDailyPrompts` tests:**
```typescript
// Determinism: same dateKey → same 3 prompts
expect(selectDailyPrompts("2026-05-09")).toEqual(selectDailyPrompts("2026-05-09"));
// Rotation: different dateKey → different prompts (not guaranteed but statistically true for adjacent days)
expect(selectDailyPrompts("2026-05-09")).not.toEqual(selectDailyPrompts("2026-05-10"));
// Always returns 3 items
expect(selectDailyPrompts("2026-05-09")).toHaveLength(3);
// No duplicates in the 3 returned
const prompts = selectDailyPrompts("2026-05-09");
expect(new Set(prompts).size).toBe(3);
```

**`computeStreak` tests (extend Phase 1 notes):**
```typescript
// Streak=0 when list empty
expect(computeStreak([])).toBe(0);
// Streak=0 when most recent > yesterday
expect(computeStreak(["2026-01-01"])).toBe(0);  // assuming today is 2026-05-09
// Streak=2 for today + yesterday
// (use fixed today in test or mock toDateKey)
```

### Manual-Only Verification

| Behavior | Why Manual | Test Instructions |
|----------|------------|-------------------|
| Micro-animation (scale+fade) fires on add | Requires visual observation | Add win → confirm item animates in; existing items do not re-animate |
| Keyboard stays open after add | Device behavior | Add win → confirm keyboard stays open, input focused |
| Empty state → populated state transition | Visual | Fresh install → confirm trophy+heading, add win → FlatList appears |
| Streak label updates after adding first win of day | E2E | Add first win of day → streak increments in header |
| Input pinned above keyboard on iOS + Android | Platform check | Open keyboard → confirm input visible; verify on both simulators |

---

## Pitfalls / Landmines

### Pitfall 1: Trophy PNG Missing from Assets

**What goes wrong:** CONTEXT.md and UI-SPEC reference `assets/images/trophy.png` but this file does not exist in the repo. The `require("@/assets/images/trophy.png")` call will throw a bundle error.

**Why it happens:** Phase 1 noted "Save it to assets/images/trophy.png" but didn't create it (placeholder screens had no images).

**How to avoid:** Phase 2 Wave 0 must create `assets/images/trophy.png`. Source: the app icon (`assets/images/icon.png`) contains the trophy. Either: (a) copy `icon.png` to `trophy.png` as-is and display at small size, or (b) crop to just the trophy face. The icon.png file (384KB) is the full trophy mascot image.

---

### Pitfall 2: FlatList `entering` Triggers on Remount

**What goes wrong:** `<Animated.View entering={ZoomIn}>` in `renderItem` fires every time the item is mounted — including when FlatList recycles items as the user scrolls.

**Why it happens:** FlatList virtualizes items. Items scrolled far off-screen are unmounted and remounted when scrolled back. Each mount triggers `entering`. With a short today's-wins list (<20 items typical), the viewport rarely needs to unmount items, so this is low-risk — but must be handled correctly.

**How to avoid:** Use the `isNew` prop pattern documented in Section 6. Pass `isNew={index === 0 && justAdded}` — only the just-added item at index 0 animates.

**Warning sign:** Every win re-animates when user scrolls down and back up.

---

### Pitfall 3: `behavior="height"` + SafeAreaView Bottom Padding Bug

**What goes wrong:** Using `KeyboardAvoidingView behavior="height"` on Android inside a `SafeAreaView` leaves extra bottom padding after the keyboard closes. The input area appears to float above the bottom of the screen.

**Why it happens:** `behavior="height"` reduces the KAV's height when keyboard opens, which conflicts with SafeAreaView's bottom inset. On keyboard dismiss, the height is restored but the inset is double-counted.

**How to avoid:** Use `behavior={Platform.OS === "ios" ? "padding" : undefined}` — Android doesn't need KAV at all when `windowSoftInputMode="adjustResize"` is set (Expo default). [VERIFIED: GitHub issue #52596]

---

### Pitfall 4: `toDateKey()` Called Without Argument Gives "Today" — Always Correct

**What goes wrong:** Developer calls `toDateKey(new Date())` instead of `toDateKey()` — both are fine since the default is `new Date()`. BUT: `new Date('2026-05-09')` (string parsing) returns UTC midnight, not local. Hermes parses ISO-format date strings as UTC.

**Why it happens:** Copy-paste from a utility that passes a date object parsed from a string.

**How to avoid:** `toDateKey()` (no argument) is always safe. Never pass `new Date(isoString)` directly to `toDateKey` — parse strings correctly. [VERIFIED: PITFALLS.md Pitfall 14 + Phase 1 DST fix]

---

### Pitfall 5: `insertWin` Already Handles date_key — Do Not Duplicate

**What goes wrong:** Phase 2 code computes `date_key` in the UI layer and passes it to a modified `insertWin(text, dateKey)`. This duplicates timezone logic and risks divergence.

**Why it happens:** Developer thinks the repository needs the date injected.

**How to avoid:** `insertWin(text)` in `wins.ts` already calls `toDateKey(now)` internally. Pass only `text`. Do not modify the repository function signature.

---

### Pitfall 6: Zustand Store Not Hydrated When Home Screen Renders (Brief Flicker)

**What goes wrong:** `isHydrated: false` on first render causes the component to show a blank/loading view while the async `hydrate()` call runs. If not handled, this shows as a white flash after the splash hides.

**Why it happens:** SQLite reads are async. `hydrate()` takes 20–100ms. The splash screen hides before hydration completes.

**How to avoid:** Render a minimal loading skeleton (just the streak header with placeholder text, or `null`) while `!isHydrated`. The input area can render immediately (it doesn't depend on hydration). Only the wins list and streak stats need the guard.

---

### Pitfall 7: `FlatList` keyExtractor Must Use Win ID, Not Index

**What goes wrong:** `keyExtractor={(item, index) => String(index)}` causes React to re-render all items on any list mutation, losing animation state and causing jank.

**Why it happens:** Default behavior or naive implementation.

**How to avoid:** `keyExtractor={(item) => item.id}` — use the UUID primary key. This is stable across re-renders. [VERIFIED: Phase 1 UUID PK design, FNDTN-03]

---

### Pitfall 8: Multiple `addWin` Calls Before Hydration Completes (Race Condition)

**What goes wrong:** User taps Add very quickly twice before the first `addWin` re-hydration completes. The second call runs `getWins()` before the first insert is committed, returning stale data.

**Why it happens:** Async operations without in-flight guard.

**How to avoid:** Disable the Add button while `addWin` is in-flight. Use `isAdding: boolean` state in the component (not the store):

```typescript
const [isAdding, setIsAdding] = useState(false);
const handleAdd = async () => {
  if (isAdding || !inputText.trim()) return;
  setIsAdding(true);
  try {
    await addWin(inputText.trim());
    setInputText("");
  } finally {
    setIsAdding(false);
  }
};
```

---

### Pitfall 9: Example Prompts Seed Collision (Same Prompts Two Days in a Row)

**What goes wrong:** The char-code-sum seed may produce the same `startIndex` for two adjacent dates, showing identical prompts.

**Why it happens:** Date strings like "2026-05-08" and "2026-05-09" differ by 1 in char sum. If `pool.length` is 40, and `seed % 40` happens to produce the same index for adjacent dates, the prompts repeat.

**Probability:** Low but possible. For a 40-prompt pool, the probability any two adjacent dates get the same start index is 1/40 = 2.5%.

**How to avoid:** Use a slightly better mixing function — multiply each character position:

```typescript
const seed = dateKey.split("").reduce(
  (acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0
);
```

This produces more distinct values for adjacent date strings. For V1 this is sufficient; V2 can personalize prompts anyway.

---

## Open Questions

None that block planning. All critical research targets are resolved.

**Resolved topics (documented above):**
- Zustand v5 store shape — resolved (Section 1)
- Streak label tiers — resolved (Section 3, strings are Claude's discretion)
- Prompt rotation algorithm — resolved (Section 4)
- FlatList direction — resolved: non-inverted, newest-first (Section 5)
- Entering animation — resolved: ZoomIn.duration(300) with isNew guard (Section 6)
- Keyboard handling — resolved: KAV padding on iOS, undefined on Android (Section 7)
- WIN-04 override — resolved: documented as overridden (Section 8)
- Trophy asset — resolved: must be created in Wave 0 (Pitfall 1)
- Test framework — resolved: Jest + ts-jest, Wave 0 installs (Validation section)

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| zustand | Zustand store | Yes | 5.0.13 | — |
| react-native-reanimated | ZoomIn entering animation | Yes | 3.19.5 (pinned) | — |
| expo-sqlite | DB reads/writes | Yes | ~55.0.15 | — |
| Expo Go simulator | Development testing | Yes | SDK 55 | EAS dev build |
| jest + ts-jest | Unit tests | No (Wave 0 installs) | — | Manual-only fallback |
| assets/images/trophy.png | Empty state + header | No (Wave 0 creates) | — | None — required |

**Missing dependencies with no fallback:**
- `assets/images/trophy.png` — must be created before any component that references it can render

**Missing dependencies with fallback:**
- `jest` + `ts-jest` — Wave 0 installs; pure function tests can be deferred to end-of-phase if needed (but Wave 0 is strongly recommended)

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Exact encouraging label strings (wording, emoji) | Section 3 | Low — strings are Claude's discretion per CONTEXT.md; user can tweak in review |
| A2 | 40–50 prompt strings content | Section 4 | Low — Claude generates during execution; format (short plain phrases) is locked |
| A3 | trophy.png can be sourced from icon.png crop | Pitfall 1 | Low — icon.png is the trophy mascot; crop is cosmetic |
| A4 | `jest` + `ts-jest` works for pure TS tests without native module mocks | Validation | Medium — if `src/utils/dateUtils.ts` imports anything native, tests fail. Verify imports in test files are node-compatible |

**Notes on A4:** `dateUtils.ts` uses only `Intl.DateTimeFormat` (available in Node.js) and basic `Date` math. No expo-crypto, no expo-sqlite. Tests will work in Node. `uuid.ts` imports `expo-crypto` — do NOT import uuid.ts in unit tests; test ID generation separately with a mock.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Zustand v4: `create<State>(...)` | Zustand v5: `create<State>()(...)` (double parentheses) | TypeScript inference fix; pattern changed |
| Reanimated 2: `useAnimatedStyle` viewability trick | Reanimated 3: `entering` prop on Animated.View | Simpler API; still needs isNew guard for FlatList |
| inverted FlatList for chat-style | Non-inverted + data reversal for item-prepend lists | Avoids Reanimated bugs with inverted |
| KAV `behavior="height"` on Android | `behavior={Platform.OS === "ios" ? "padding" : undefined}` | Fixes bottom-padding bug on Android |

---

## Sources

### Primary (HIGH confidence)
- `src/db/repositories/wins.ts` — verified `insertWin`, `getWins`, `getDistinctDateKeys` signatures
- `src/utils/dateUtils.ts` — verified `computeStreak` already implemented with DST-safe noon anchor
- `package.json` — verified zustand@5.0.13, reanimated@3.19.5 installed
- [github.com/pmndrs/zustand README](https://github.com/pmndrs/zustand) — Zustand v5 `create<State>()()` pattern, useShallow selector
- [docs.swmansion.com/react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/list-layout-animations/) — Animated.FlatList, itemLayoutAnimation, entering props
- [docs.expo.dev/guides/keyboard-handling](https://docs.expo.dev/guides/keyboard-handling/) — KeyboardAvoidingView behavior values, react-native-keyboard-controller guidance
- [github.com/software-mansion/react-native-reanimated discussions #6748](https://github.com/software-mansion/react-native-reanimated/discussions/6748) — FlatList new-item entering animation pattern

### Secondary (MEDIUM confidence)
- [ignitecookbook.com/docs/recipes/Zustand](https://ignitecookbook.com/docs/recipes/Zustand/) — React Native Zustand store pattern with StateCreator, selectors
- [reactiive.io/articles/animated-flat-list](https://reactiive.io/articles/animated-flat-list) — FlatList animation patterns with Reanimated

### Tertiary (LOW confidence / ASSUMED)
- Exact encouraging label strings — Claude's discretion, not verified against any external spec
- Prompt pool content — generated during execution, format locked

---

## Metadata

**Confidence breakdown:**
- Store pattern (Zustand v5): HIGH — verified against official README
- Animation (Reanimated entering): HIGH — verified against official docs + GitHub discussions
- Keyboard handling: HIGH — verified against Expo docs + known bug tracking
- Streak label algorithm: HIGH — pure function, testable
- Prompt rotation algorithm: HIGH — pure function, testable; pool content is ASSUMED
- Trophy asset path: MEDIUM — file must be created; source asset exists

**Research date:** 2026-05-09
**Valid until:** 2026-06-09 (30 days; Expo SDK 55 and Reanimated 3.19.5 are pinned, so validity window is longer than typical)

---

## RESEARCH COMPLETE

# Phase 2: Core Win-Entry Loop - Pattern Map

**Mapped:** 2026-05-10
**Files analyzed:** 10 new/modified files
**Analogs found:** 8 / 10

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/stores/useWinsStore.ts` | store | request-response (async DB read/write) | `src/db/repositories/wins.ts` (data layer reference) | partial — no store analog exists yet |
| `src/utils/streakLabel.ts` | utility | transform | `src/utils/dateUtils.ts` | exact — pure function, same file role |
| `src/utils/promptUtils.ts` | utility | transform | `src/utils/dateUtils.ts` | exact — pure function, same file role |
| `src/constants/examplePrompts.ts` | config | — | `src/constants/theme.ts` | role-match — static export constant file |
| `src/components/WinCard.tsx` | component | event-driven (animation) | `components/Themed.tsx` (only component in repo) | partial — different styling approach |
| `src/components/WinInputArea.tsx` | component | request-response (user input → DB) | `app/(tabs)/goal.tsx` (closest existing screen pattern) | partial — same SafeAreaView + NativeWind pattern |
| `src/components/StreakHeader.tsx` | component | request-response | `app/(tabs)/index.tsx` (screen root pattern) | partial — NativeWind className pattern |
| `src/components/ExamplePrompts.tsx` | component | transform | `src/utils/dateUtils.ts` + theme.ts pattern | partial — pure display component |
| `app/(tabs)/index.tsx` | screen | CRUD + event-driven | `app/(tabs)/wins.tsx` (same tab structure) | role-match — same SafeAreaView root pattern |
| `assets/images/trophy.png` | asset | — | `assets/images/icon.png` (source image) | exact — same file, copy/crop |

---

## Pattern Assignments

### `src/stores/useWinsStore.ts` (store, async CRUD)

**No direct store analog exists** — Phase 2 introduces the first Zustand store in the project. Pattern is derived from RESEARCH.md (verified against Zustand v5 README) and the existing repository layer it wraps.

**Repository imports pattern** — from `src/db/repositories/wins.ts` (lines 1–5):
```typescript
import { desc } from "drizzle-orm";
import { db } from "../client";
import { wins, type NewWin } from "../schema";
import { generateId } from "@/src/utils/uuid";
import { toDateKey } from "@/src/utils/dateUtils";
```

**Repository async pattern** — from `src/db/repositories/wins.ts` (lines 7–27):
```typescript
export async function insertWin(text: string): Promise<void> {
  const now = new Date();
  await db.insert(wins).values({
    id: generateId(),
    text,
    date_key: toDateKey(now),
    logged_at: now.toISOString(),
  });
}

export async function getWins(): Promise<typeof wins.$inferSelect[]> {
  return db.select().from(wins).orderBy(desc(wins.date_key));
}

export async function getDistinctDateKeys(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ date_key: wins.date_key })
    .from(wins)
    .orderBy(desc(wins.date_key));
  return rows.map((r) => r.date_key);
}
```

**Store shape** (from RESEARCH.md Section 1 — verified against Zustand v5 README):
```typescript
// src/stores/useWinsStore.ts
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { insertWin, getWins, getDistinctDateKeys } from "@/src/db/repositories/wins";
import { computeStreak, toDateKey } from "@/src/utils/dateUtils";
import type { Win } from "@/src/db/schema";

// v5 pattern: create<State>()(...) — double parentheses required for TS inference
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

// Selector hooks — single value per hook, no useShallow needed for scalar values
export const useTodayWins = () => useWinsStore((s) => s.todayWins);
export const useStreak = () => useWinsStore((s) => s.streak);
export const useTotalWins = () => useWinsStore((s) => s.totalWins);
export const useIsHydrated = () => useWinsStore((s) => s.isHydrated);
export const useAddWin = () => useWinsStore((s) => s.addWin);
```

**Critical rules:**
- Do NOT use `zustand/middleware/persist` — SQLite is the persistence layer, not AsyncStorage
- `isHydrated` is a simple boolean set in `hydrate()` — not the persist middleware `_hasHydrated` pattern
- Re-query DB after every `addWin` — prevents optimistic update divergence

---

### `src/utils/streakLabel.ts` (utility, transform)

**Analog:** `src/utils/dateUtils.ts`

**File structure pattern** — from `src/utils/dateUtils.ts` (lines 1–34):
```typescript
// CRITICAL: 'en-CA' locale produces YYYY-MM-DD in device LOCAL time
// NEVER use date.toISOString().slice(0,10) — that returns UTC date
export function toDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA").format(date);
}

export function computeStreak(distinctDateKeys: string[]): number {
  if (distinctDateKeys.length === 0) return 0;
  // ... pure function logic, no imports, no side effects
}
```

**Pattern to copy:** Single-export-per-function, comment above explaining invariant, no imports needed for pure functions. No `default` export — named exports only.

**Streak label implementation** (from RESEARCH.md Section 3, UI-SPEC Streak Label Copy Contract):
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

**Invariant:** streak=0 must never contain guilt/shame words. All tiers are positive and forward-looking (CLAUDE.md no-guilt invariant + STREAK-04).

---

### `src/utils/promptUtils.ts` (utility, transform)

**Analog:** `src/utils/dateUtils.ts`

**File structure pattern** — same as `streakLabel.ts` above. Named exports, no default export, comment explaining the algorithm's properties.

**Implementation** (from RESEARCH.md Section 4, improved seed per Pitfall 9):
```typescript
// src/utils/promptUtils.ts
import { EXAMPLE_PROMPTS } from "@/src/constants/examplePrompts";

// Deterministic daily selection — same 3 prompts all day, different each calendar day
// Seed uses position-weighted char codes to avoid adjacent-day collision (RESEARCH Pitfall 9)
export function selectDailyPrompts(dateKey: string, count = 3): string[] {
  const seed = dateKey
    .split("")
    .reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);

  const pool = EXAMPLE_PROMPTS;
  const startIndex = seed % pool.length;

  return Array.from({ length: count }, (_, i) => pool[(startIndex + i) % pool.length]);
}
```

**Path alias pattern** — from `src/db/repositories/wins.ts` (lines 4–5):
```typescript
import { generateId } from "@/src/utils/uuid";
import { toDateKey } from "@/src/utils/dateUtils";
```
Use `@/` prefix for all cross-directory imports, matching established project convention.

---

### `src/constants/examplePrompts.ts` (config, static)

**Analog:** `src/constants/theme.ts`

**File structure pattern** — from `src/constants/theme.ts` (lines 1–26):
```typescript
// Color tokens — mirrors tailwind.config.js extend.colors
// Use NativeWind className utilities in components; use these for imperative style objects only
export const Colors = {
  background: "#FAF8F4",
  // ...
} as const;

export const Fonts = {
  regular: "Nunito_400Regular",
  // ...
} as const;
```

**Pattern to copy:** Named `const` export with `as const` for TypeScript literal types, top comment explaining purpose. For the prompts array:
```typescript
// src/constants/examplePrompts.ts
// Static pool of 40–50 example win prompts. Rotated daily via selectDailyPrompts().
// Format: first-person, past tense, short phrases (see CONTEXT.md D-09).
// V2+: replace with personalized prompts from user data.
export const EXAMPLE_PROMPTS: string[] = [
  "I helped a colleague today",
  "I finished something I'd been avoiding",
  // ... 40–50 total entries
] as const;
```

---

### `src/components/WinCard.tsx` (component, event-driven animation)

**Analog:** `components/Themed.tsx` (only component file in project) — but note: existing components use `StyleSheet` (old pattern). Phase 2 components must use NativeWind `className` exclusively, matching `app/(tabs)/index.tsx` pattern.

**NativeWind className pattern** — from `app/(tabs)/index.tsx` (lines 1–15, current placeholder):
```typescript
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="font-nunito-semibold text-xl text-text-primary">Home</Text>
        <Text className="font-nunito-regular text-base text-text-secondary">
          Your wins and streak are coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}
```

**IMPORTANT:** Do NOT copy the StyleSheet approach from `components/Themed.tsx` — that is a legacy pattern. New components use only NativeWind className.

**WinCard implementation pattern** (from RESEARCH.md Section 6, UI-SPEC WinCard):
```typescript
// src/components/WinCard.tsx
import Animated, { ZoomIn } from "react-native-reanimated";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Win } from "@/src/db/schema";

interface WinCardProps {
  win: Win;
  isNew: boolean;   // true only for index=0 immediately after an add
}

export function WinCard({ win, isNew }: WinCardProps) {
  return (
    <Animated.View
      entering={isNew ? ZoomIn.duration(300) : undefined}
      className="bg-surface rounded-xl px-4 py-3 mb-2 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-nunito-regular text-base text-text-primary leading-relaxed flex-1 mr-2">
          {win.text}
        </Text>
        <Ionicons name="heart-outline" size={16} className="text-accent" />
      </View>
    </Animated.View>
  );
}
```

**isNew tracking pattern in parent** (from RESEARCH.md Section 6):
```typescript
const prevLengthRef = useRef(todayWins.length);
const justAdded = todayWins.length > prevLengthRef.current;
useEffect(() => {
  prevLengthRef.current = todayWins.length;
}, [todayWins.length]);

// In renderItem:
// isNew={index === 0 && justAdded}
```

**keyExtractor rule** — from RESEARCH.md Pitfall 7: always `(item) => item.id` (UUID), never index.

---

### `src/components/WinInputArea.tsx` (component, request-response)

**Analog:** `app/(tabs)/goal.tsx` — same SafeAreaView + NativeWind className root; goal.tsx is the only tab screen with form-entry intent (text input for dream goal, coming Phase 3+).

**Root structure pattern** — from `app/(tabs)/goal.tsx` (lines 1–15):
```typescript
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function GoalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="font-nunito-semibold text-xl text-text-primary">Dream Goal</Text>
      </View>
    </SafeAreaView>
  );
}
```

**WinInputArea implementation pattern** (from UI-SPEC WinInputArea + RESEARCH.md Pitfall 8):
```typescript
// src/components/WinInputArea.tsx
import { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";

interface WinInputAreaProps {
  onAdd: (text: string) => Promise<void>;
}

export function WinInputArea({ onAdd }: WinInputAreaProps) {
  const [inputText, setInputText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (isAdding || !inputText.trim()) return;
    setIsAdding(true);
    try {
      await onAdd(inputText.trim());
      setInputText("");
      // keyboard stays open — do NOT call blur()
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View className="bg-surface px-4 py-3 border-t border-border flex-row gap-3 items-center">
      <TextInput
        className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-nunito-regular text-base text-text-primary"
        placeholder="What did you win today?"
        placeholderTextColor="#8E8E93"
        value={inputText}
        onChangeText={setInputText}
        maxLength={200}
        multiline={false}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
        autoFocus={true}
        accessibilityLabel="Win text input"
        accessibilityHint="Type your win for today, up to 200 characters"
      />
      <Pressable
        onPress={handleAdd}
        disabled={isAdding || inputText.trim().length === 0}
        className="bg-primary rounded-lg min-h-[44px] min-w-[44px] items-center justify-center px-3"
        style={{ opacity: isAdding || inputText.trim().length === 0 ? 0.5 : 1 }}
        accessibilityLabel="Add win"
        accessibilityRole="button"
      >
        <Text className="font-nunito-bold text-sm text-white">Add Win</Text>
      </Pressable>
    </View>
  );
}
```

---

### `src/components/StreakHeader.tsx` (component, request-response)

**Analog:** `app/(tabs)/index.tsx` — same SafeAreaView/NativeWind root pattern; `app/(tabs)/_layout.tsx` for Ionicons import pattern.

**Ionicons import pattern** — from `app/(tabs)/_layout.tsx` (line 2):
```typescript
import { Ionicons } from "@expo/vector-icons";
```

**Color token usage** — from `app/(tabs)/_layout.tsx` (lines 6–17):
```typescript
tabBarActiveTintColor: "#F5A623",    // primary orange
tabBarInactiveTintColor: "#8E8E93",  // text-secondary
tabBarStyle: {
  backgroundColor: "#FFFFFF",        // surface
  borderTopColor: "#F0EDE8",         // border
  borderTopWidth: 1,
},
tabBarLabelStyle: {
  fontFamily: "Nunito_600SemiBold",  // use className equivalent in components
  fontSize: 12,
},
```

**StreakHeader implementation pattern** (from UI-SPEC StreakHeader):
```typescript
// src/components/StreakHeader.tsx
import { View, Text, Image } from "react-native";
import { streakLabel } from "@/src/utils/streakLabel";

interface StreakHeaderProps {
  streak: number;
  totalWins: number;
}

export function StreakHeader({ streak, totalWins }: StreakHeaderProps) {
  return (
    <View
      className="px-4 py-6 border-b border-border flex-row items-center gap-4"
      accessibilityLabel={streakLabel(streak)}
    >
      <Image
        source={require("@/assets/images/trophy.png")}
        style={{ width: 48, height: 48 }}
        resizeMode="contain"
        accessibilityLabel="Winning Streak trophy"
      />
      <View className="flex-1">
        <Text className="font-nunito-bold text-xl text-text-primary">
          {streakLabel(streak)}
        </Text>
        <Text className="font-nunito-bold text-sm text-text-secondary">
          {totalWins} total wins
        </Text>
      </View>
    </View>
  );
}
```

---

### `src/components/ExamplePrompts.tsx` (component, transform)

**Analog:** `src/utils/dateUtils.ts` and `src/constants/theme.ts` — pure display, data-in, nothing out.

**ExamplePrompts implementation pattern** (from UI-SPEC ExamplePrompts):
```typescript
// src/components/ExamplePrompts.tsx
import { View, Text } from "react-native";

interface ExamplePromptsProps {
  prompts: string[];  // exactly 3 items from selectDailyPrompts()
}

export function ExamplePrompts({ prompts }: ExamplePromptsProps) {
  return (
    <View className="px-4 pt-3 pb-2 border-t border-border">
      {prompts.map((prompt, i) => (
        <Text
          key={i}
          className="font-nunito-regular text-base text-text-secondary"
          numberOfLines={1}
          ellipsizeMode="tail"
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          e.g. {prompt}
        </Text>
      ))}
    </View>
  );
}
```

---

### `app/(tabs)/index.tsx` (screen, CRUD + event-driven)

**Analog:** `app/(tabs)/wins.tsx` — identical tab structure; same `SafeAreaView className="flex-1 bg-background"` root pattern.

**Tab screen root pattern** — from `app/(tabs)/wins.tsx` (lines 1–15):
```typescript
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function WinsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="font-nunito-semibold text-xl text-text-primary">My Wins</Text>
      </View>
    </SafeAreaView>
  );
}
```

**Migration gate pattern** (used by `app/_layout.tsx`, needed by HomeScreen for hydration timing) — from `app/_layout.tsx` (lines 33–40):
```typescript
const ready = (migrationsSuccess && fontsLoaded) || !!migrationsError || !!fontError;

useEffect(() => {
  if (ready) {
    SplashScreen.hideAsync();
  }
}, [ready]);

if (!ready) return null;
```

**HomeScreen structure** (from RESEARCH.md Section 2 + 7, UI-SPEC Screen Layout):
```typescript
// app/(tabs)/index.tsx — full replacement
import { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAvoidingView, Platform, FlatList, View, Text, Image } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useWinsStore } from "@/src/stores/useWinsStore";
import { selectDailyPrompts } from "@/src/utils/promptUtils";
import { toDateKey } from "@/src/utils/dateUtils";
import { StreakHeader } from "@/src/components/StreakHeader";
import { WinCard } from "@/src/components/WinCard";
import { WinInputArea } from "@/src/components/WinInputArea";
import { ExamplePrompts } from "@/src/components/ExamplePrompts";
import type { Win } from "@/src/db/schema";

export default function HomeScreen() {
  const { hydrate, isHydrated, todayWins, streak, totalWins, addWin } = useWinsStore(
    useShallow((s) => ({
      hydrate: s.hydrate,
      isHydrated: s.isHydrated,
      todayWins: s.todayWins,
      streak: s.streak,
      totalWins: s.totalWins,
      addWin: s.addWin,
    }))
  );

  const flatListRef = useRef<FlatList>(null);
  const prevLengthRef = useRef(todayWins.length);
  const justAdded = todayWins.length > prevLengthRef.current;

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, []);

  useEffect(() => {
    prevLengthRef.current = todayWins.length;
  }, [todayWins.length]);

  const displayWins = [...todayWins].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );

  const prompts = selectDailyPrompts(toDateKey());

  const handleAdd = async (text: string) => {
    await addWin(text);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    // keyboard stays open — do NOT call blur()
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StreakHeader streak={streak} totalWins={totalWins} />

        {isHydrated ? (
          todayWins.length === 0 ? (
            // Empty state
            <View className="flex-1 items-center justify-center px-4">
              <Image
                source={require("@/assets/images/trophy.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
                className="mb-8"
                accessibilityLabel="Winning Streak trophy"
              />
              <Text
                className="font-nunito-bold text-[28px] text-text-primary text-center"
                style={{ maxWidth: "80%" }}
              >
                What was your win today?
              </Text>
            </View>
          ) : (
            // Populated state
            <FlatList
              ref={flatListRef}
              className="flex-1"
              data={displayWins}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }: { item: Win; index: number }) => (
                <WinCard win={item} isNew={index === 0 && justAdded} />
              )}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            />
          )
        ) : null}

        <ExamplePrompts prompts={prompts} />
        <WinInputArea onAdd={handleAdd} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

---

### Test files (utility tests, node-compatible)

**Test file structure** (from RESEARCH.md Validation Architecture):

No existing test files in project — Phase 2 introduces the first. Pattern from RESEARCH.md:

```typescript
// src/__tests__/streakLabel.test.ts
import { streakLabel } from "@/src/utils/streakLabel";

describe("streakLabel", () => {
  it("streak=0 is welcoming, contains no guilt words", () => {
    expect(streakLabel(0)).not.toMatch(/miss|fail|broke|punish|shame/i);
    expect(streakLabel(0)).toContain("🌟");
  });
  it("streak=7 embeds count in string", () => {
    expect(streakLabel(7)).toContain("7 day streak");
  });
});
```

**jest.config.js pattern** (from RESEARCH.md Validation section):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

---

## Shared Patterns

### NativeWind className (applies to ALL components and screens)

**Source:** `app/(tabs)/index.tsx` line 6, `app/(tabs)/wins.tsx` line 6
**Apply to:** All new component and screen files — never use `StyleSheet.create` for new files.
```typescript
// Root screen wrapper — identical across all tab screens
<SafeAreaView className="flex-1 bg-background">
```

### Path Alias `@/` (applies to ALL new files)

**Source:** `src/db/repositories/wins.ts` lines 4–5
```typescript
import { generateId } from "@/src/utils/uuid";
import { toDateKey } from "@/src/utils/dateUtils";
```
Always use `@/` for imports crossing directory boundaries. Relative imports (`../`) are used only within the same feature folder (e.g., `../client` within `src/db/`).

### Named exports (applies to all utility and component files)

**Source:** `src/utils/dateUtils.ts` lines 3, 9 — `src/db/repositories/wins.ts` lines 7, 17, 21
```typescript
export function toDateKey(...) { ... }
export function computeStreak(...) { ... }
export async function insertWin(...) { ... }
```
Named exports only. No `default` export on utility and component files. Only `app/(tabs)/*.tsx` screen files use `export default` (Expo Router file-based routing requirement).

### DB type inference (applies to store and any future repository files)

**Source:** `src/db/schema.ts` lines 39–42
```typescript
export type Win = typeof wins.$inferSelect;
export type NewWin = typeof wins.$inferInsert;
```
Import `Win` type from schema for component props and store interfaces. Never redefine the type.

### Ionicons import

**Source:** `app/(tabs)/_layout.tsx` line 2
```typescript
import { Ionicons } from "@expo/vector-icons";
```
Use `@expo/vector-icons` — already a project dependency. Use for the heart icon in WinCard.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/stores/useWinsStore.ts` | store | CRUD + async | No Zustand stores exist yet — Phase 2 introduces the store layer. Use RESEARCH.md Section 1 pattern directly. |

---

## Critical Constraints Summary

| Constraint | Source | Apply To |
|------------|--------|----------|
| NativeWind className only — no StyleSheet | Phase 1 decision, `app/(tabs)/*.tsx` pattern | All new components |
| `@/` path alias for cross-directory imports | `src/db/repositories/wins.ts` | All new files |
| Named exports, no `default` on components/utils | Existing utility files | `src/components/`, `src/utils/`, `src/stores/` |
| `export default` only on `app/(tabs)/*.tsx` | Expo Router file routing | Screen files only |
| `toDateKey()` with no args for "today" — never `new Date(isoString)` | `src/utils/dateUtils.ts` comment + RESEARCH Pitfall 4 | Any date_key usage |
| `insertWin(text)` — pass text only, no date_key arg | `src/db/repositories/wins.ts` already handles date internally | `useWinsStore.addWin` |
| UUID `item.id` as FlatList keyExtractor — never index | RESEARCH Pitfall 7 + Phase 1 UUID PK design | HomeScreen FlatList |
| Reanimated pinned at 3.19.5 — do not upgrade | UI-SPEC Platform Safety | `WinCard.tsx` |
| No guilt/shame language in any streak label | CLAUDE.md invariant + STREAK-04 | `streakLabel.ts` |
| `behavior={Platform.OS === "ios" ? "padding" : undefined}` | RESEARCH Pitfall 3 | `KeyboardAvoidingView` in HomeScreen |

---

## Metadata

**Analog search scope:** `app/`, `src/`, `components/`, `constants/`
**Files scanned:** 18
**Pattern extraction date:** 2026-05-10

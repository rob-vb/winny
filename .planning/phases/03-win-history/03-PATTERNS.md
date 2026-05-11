# Phase 3: Win History - Pattern Map

**Mapped:** 2026-05-11
**Files analyzed:** 6 new/modified files
**Analogs found:** 6 / 6

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `app/(tabs)/wins.tsx` | screen/component | request-response (store read) | `app/(tabs)/index.tsx` | exact |
| `src/components/HistoryHeroHeader.tsx` | component | request-response (props) | `src/components/StreakHeader.tsx` | exact |
| `src/components/DateSectionHeader.tsx` | component | event-driven (collapse toggle) | `src/components/WinInputArea.tsx` | role-match |
| `src/utils/dateUtils.ts` | utility | transform | `src/utils/dateUtils.ts` (extend) | exact (additive) |
| `src/__tests__/historyUtils.test.ts` | test | batch | `src/__tests__/dateUtils.test.ts` | exact |

---

## Pattern Assignments

### `app/(tabs)/wins.tsx` (screen, store-read + SectionList)

**Analog:** `app/(tabs)/index.tsx`

**Imports pattern** (lines 1-17):
```typescript
import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,          // → replace with SectionList
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { useWinsStore } from "@/src/stores/useWinsStore";
import { StreakHeader } from "@/src/components/StreakHeader";   // → replace with HistoryHeroHeader
import { WinCard } from "@/src/components/WinCard";
import type { Win } from "@/src/db/schema";
```

**For wins.tsx, replace with:**
```typescript
import { useMemo, useState } from "react";
import { SectionList, View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { useWinsStore } from "@/src/stores/useWinsStore";
import { HistoryHeroHeader } from "@/src/components/HistoryHeroHeader";
import { DateSectionHeader } from "@/src/components/DateSectionHeader";
import { WinCard } from "@/src/components/WinCard";
import { formatDateKey } from "@/src/utils/dateUtils";
import type { Win } from "@/src/db/schema";
```

**Store read + hydration guard pattern** (lines 24-77 of index.tsx):
```typescript
// Exact multi-field useShallow pattern — copy this verbatim for wins.tsx
const { wins, totalWins, streak, isHydrated } = useWinsStore(
  useShallow((s) => ({
    wins: s.wins,
    totalWins: s.totalWins,
    streak: s.streak,
    isHydrated: s.isHydrated,
  }))
);

// Hydration guard (Pitfall 4 in RESEARCH.md) — do NOT call hydrate() again
// index.tsx calls hydrate() on mount; wins.tsx must only guard, never re-hydrate
if (!isHydrated) return null;                          // blank bg-background screen
if (totalWins === 0) return <EmptyState />;            // D-08
```

**Screen root wrapper pattern** (lines 80, 129 of index.tsx):
```typescript
// SafeAreaView is always the root — bg-background, flex-1
<SafeAreaView className="flex-1 bg-background">
  ...
</SafeAreaView>
```

**Empty state pattern** (lines 87-103 of index.tsx):
```typescript
// Empty state: trophy centered + text. wins.tsx uses same structural pattern
// (different copy and a second text line, but same Image + Text + Text layout)
<View className="flex-1 items-center justify-center px-8">
  <Image
    source={require("@/assets/images/trophy.png")}
    style={{ width: 120, height: 120 }}
    resizeMode="contain"
    className="mb-8"
    accessibilityLabel="Winning Streak trophy"
  />
  <Text
    className="font-nunito-bold text-[28px] text-text-primary text-center leading-tight"
    style={{ maxWidth: "80%" } as any}
  >
    What was your win today?
  </Text>
</View>
```

**FlatList → SectionList migration pattern** (lines 106-121 of index.tsx):
```typescript
// index.tsx uses FlatList — the wins.tsx SectionList must mirror these props:
<FlatList
  ref={flatListRef}
  data={displayWins}
  keyExtractor={(item) => item.id}        // → keep; UUID pk, never array index
  renderItem={({ item, index }) => (
    <WinCard win={item} isNew={index === 0 && justAdded} />
  )}
  contentContainerStyle={{
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,                     // → change to 16 per UI-SPEC
  }}
  showsVerticalScrollIndicator={false}    // → keep
  className="flex-1"
/>
```

**Section data grouping (useMemo):**
```typescript
// Co-locate with WinsScreen component — pure transform of store data
interface WinSection {
  date_key: string;
  data: Win[];
}

function groupWinsByDate(wins: Win[]): WinSection[] {
  // wins[] from store is already date_key DESC (getWins uses orderBy desc)
  const map = new Map<string, Win[]>();
  for (const win of wins) {
    const existing = map.get(win.date_key);
    if (existing) existing.push(win);
    else map.set(win.date_key, [win]);
  }
  return Array.from(map.entries()).map(([date_key, data]) => ({
    date_key,
    data: data.sort(
      (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    ),
  }));
}

// In component:
const sections = useMemo(() => groupWinsByDate(wins), [wins]);
```

**Collapse state + SectionList wiring:**
```typescript
// Local state only — D-15 (not persisted)
const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

const toggleSection = (date_key: string) => {
  setCollapsedSections(prev => ({
    ...prev,
    [date_key]: !prev[date_key],
  }));
};

<SectionList
  sections={sections}
  extraData={collapsedSections}        // REQUIRED — PureComponent won't re-render without this
  stickySectionHeadersEnabled          // D-03
  keyExtractor={(item) => item.id}     // UUID pk
  showsVerticalScrollIndicator={false}
  initialNumToRender={20}
  renderItem={({ item, section }) =>
    collapsedSections[(section as WinSection).date_key]
      ? null                           // collapsed sections return null — cheaper than empty data[]
      : <WinCard win={item} isNew={false} />   // D-10: always false in history
  }
  renderSectionHeader={({ section }) => (
    <DateSectionHeader
      section={section as WinSection}
      isCollapsed={!!collapsedSections[(section as WinSection).date_key]}
      onToggle={() => toggleSection((section as WinSection).date_key)}
    />
  )}
  ListHeaderComponent={
    <HistoryHeroHeader totalWins={totalWins} streak={streak} />
  }
  contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}
/>
```

---

### `src/components/HistoryHeroHeader.tsx` (component, props)

**Analog:** `src/components/StreakHeader.tsx`

**Full analog for reference** (lines 1-32 of StreakHeader.tsx):
```typescript
import { View, Text, Image } from "react-native";
import { streakLabel } from "@/src/utils/streakLabel";

interface StreakHeaderProps {
  streak: number;
  totalWins: number;
}

export function StreakHeader({ streak, totalWins }: StreakHeaderProps) {
  const label = streakLabel(streak);
  return (
    <View
      className="flex-row items-center px-4 py-6 border-b border-border bg-background"
      accessibilityLabel={label}
    >
      <Image
        source={require("@/assets/images/trophy.png")}
        style={{ width: 48, height: 48 }}
        resizeMode="contain"
        accessibilityLabel="Winning Streak trophy"
      />
      <View className="ml-3 flex-1">
        <Text className="font-nunito-bold text-xl text-text-primary leading-tight">
          {label}
        </Text>
        <Text className="font-nunito-bold text-sm text-text-secondary mt-1">
          {totalWins} total wins
        </Text>
      </View>
    </View>
  );
}
```

**HistoryHeroHeader differences from StreakHeader (D-05):**
- Layout: column stack (`items-center`), not `flex-row` — trophy above number, not beside it
- Trophy: 64×64 (not 48×48), `mb-4` below it
- Total wins number: `font-nunito-black text-[64px] text-gold leading-none` — the visual centerpiece
- Sub-label "total wins": `font-nunito-bold text-sm text-text-secondary mt-1`
- Streak line: `font-nunito-bold text-sm text-text-secondary mt-2` — via `streakLabel(streak)`
- accessibilityLabel on outer View: `` `${totalWins} total wins. ${streakLabel(streak)}` ``

**HistoryHeroHeader pattern:**
```typescript
import { View, Text, Image } from "react-native";
import { streakLabel } from "@/src/utils/streakLabel";

interface HistoryHeroHeaderProps {
  totalWins: number;
  streak: number;
}

export function HistoryHeroHeader({ totalWins, streak }: HistoryHeroHeaderProps) {
  return (
    <View
      className="items-center px-4 py-6 border-b border-border bg-background"
      accessibilityLabel={`${totalWins} total wins. ${streakLabel(streak)}`}
    >
      <Image
        source={require("@/assets/images/trophy.png")}
        style={{ width: 64, height: 64 }}
        resizeMode="contain"
        className="mb-4"
        accessibilityLabel="Winning Streak trophy"
      />
      <Text className="font-nunito-black text-[64px] text-gold leading-none">
        {totalWins}
      </Text>
      <Text className="font-nunito-bold text-sm text-text-secondary mt-1">
        total wins
      </Text>
      <Text className="font-nunito-bold text-sm text-text-secondary mt-2">
        {streakLabel(streak)}
      </Text>
    </View>
  );
}
```

---

### `src/components/DateSectionHeader.tsx` (component, event-driven + Reanimated)

**Analog:** `src/components/WinCard.tsx` (Reanimated pattern) + `src/components/WinInputArea.tsx` (Pressable + local state pattern)

**Reanimated import pattern** (lines 1-2 of WinCard.tsx):
```typescript
import Animated, { ZoomIn } from "react-native-reanimated";
// → for DateSectionHeader, replace ZoomIn with:
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
```

**Pressable + accessibilityRole pattern** (lines 46-55 of WinInputArea.tsx):
```typescript
<Pressable
  onPress={handleSubmit}
  disabled={isDisabled}
  className={`bg-primary rounded-lg min-h-[44px] min-w-[44px] items-center justify-center px-3 ...`}
  accessibilityLabel="Add win"
  accessibilityRole="button"
>
```

**Ionicons pattern** (lines 21-24 of WinCard.tsx):
```typescript
<Ionicons
  name="heart-outline"
  size={16}
  color="#FF6B6B"          // → use "#8E8E93" (Colors.textSecondary) for chevron
  style={{ marginLeft: 8, marginTop: 2 }}
/>
```

**DateSectionHeader full pattern:**
```typescript
import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { formatDateKey } from "@/src/utils/dateUtils";

// winCountLabel is a pure function — defined at module level
const winCountLabel = (count: number): string =>
  count === 1 ? "1 win" : `${count} wins`;

interface WinSection {
  date_key: string;
  data: { id: string; [key: string]: unknown }[];
}

interface DateSectionHeaderProps {
  section: WinSection;
  isCollapsed: boolean;
  onToggle: () => void;
}

// React.memo is MANDATORY — mitigates RN #43597 sticky header + virtualization glitch
export const DateSectionHeader = React.memo(function DateSectionHeader({
  section,
  isCollapsed,
  onToggle,
}: DateSectionHeaderProps) {
  const rotation = useSharedValue(isCollapsed ? 180 : 0);

  useEffect(() => {
    rotation.value = withTiming(isCollapsed ? 180 : 0, { duration: 200 });
  }, [isCollapsed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const dateLabel = formatDateKey(section.date_key);
  const count = section.data.length;

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center px-4 py-3 bg-background border-b border-border"
      accessibilityRole="button"
      accessibilityLabel={`${dateLabel}, ${winCountLabel(count)}, ${isCollapsed ? "collapsed" : "expanded"}`}
    >
      <Text className="font-nunito-bold text-sm text-text-primary flex-1">
        {dateLabel}
      </Text>
      {/* Pill badge — accessibilityElementsHidden since label is on Pressable */}
      <View
        className="bg-gold/20 rounded-full px-2 py-0.5"
        accessibilityElementsHidden
      >
        <Text className="font-nunito-bold text-xs text-text-primary">
          {winCountLabel(count)}
        </Text>
      </View>
      {/* Chevron — decorative, hidden from accessibility tree */}
      <Animated.View style={[animatedStyle, { marginLeft: 8 }]} accessibilityElementsHidden>
        <Ionicons name="chevron-down" size={16} color="#8E8E93" />
      </Animated.View>
    </Pressable>
  );
});
```

---

### `src/utils/dateUtils.ts` (utility, additive — add `formatDateKey`)

**Analog:** `src/utils/dateUtils.ts` (existing file — additive export)

**Existing noon-anchor pattern** (lines 17, 24 of dateUtils.ts):
```typescript
// Noon anchor is already established in computeStreak — copy this pattern exactly
const yesterday = toDateKey(new Date(new Date(today + "T12:00:00").getTime() - 86400000));
const prev = new Date(sorted[i - 1] + "T12:00:00");
```

**New export to add at end of file:**
```typescript
// Add after existing exports — do NOT modify toDateKey or computeStreak
import { isToday, isYesterday, isSameYear, format } from "date-fns";

export function formatDateKey(dateKey: string): string {
  // Noon anchor prevents DST edge-case misclassification
  // Same pattern as computeStreak — never use new Date(dateKey) directly
  const d = new Date(dateKey + "T12:00:00");
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isSameYear(d, new Date())) return format(d, "EEE, MMM d"); // "Sat, May 9"
  return format(d, "MMM d, yyyy");                               // "Dec 1, 2025"
}
```

---

### `src/__tests__/historyUtils.test.ts` (test, unit)

**Analog:** `src/__tests__/dateUtils.test.ts`

**Test file structure pattern** (lines 1-16 of dateUtils.test.ts):
```typescript
import { computeStreak } from "@/src/utils/dateUtils";

// Pin "today" to a fixed date so tests are deterministic across days (STREAK-02).
const TODAY = "2026-05-10";
const YESTERDAY = "2026-05-09";

beforeEach(() => {
  // Freeze Date.now() so functions' internal toDateKey() returns TODAY
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-05-10T12:00:00"));
});

afterEach(() => {
  jest.useRealTimers();
});
```

**describe block naming pattern** (lines 21-57 of dateUtils.test.ts):
```typescript
describe("computeStreak (STREAK-02)", () => {
  it("returns 0 for empty array", () => { ... });
  it("returns 0 when ...", () => { ... });
  // ...
});
```

**historyUtils.test.ts structure to follow:**
```typescript
import { formatDateKey } from "@/src/utils/dateUtils";

// Date constants — pin to 2026-05-11 (project reference date)
const TODAY_KEY = "2026-05-11";
const YESTERDAY_KEY = "2026-05-10";
const SAME_YEAR_KEY = "2026-05-09";     // Sat, May 9
const PRIOR_YEAR_KEY = "2025-12-01";   // Dec 1, 2025

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-05-11T12:00:00"));
});
afterEach(() => { jest.useRealTimers(); });

describe("formatDateKey (HIST-01)", () => {
  it('returns "Today" for today\'s date_key', () => { ... });
  it('returns "Yesterday" for yesterday\'s date_key', () => { ... });
  it('returns "EEE, MMM d" format for same-year non-recent date', () => { ... });
  it('returns "MMM d, yyyy" format for prior-year date', () => { ... });
});

describe("winCountLabel (HIST-02)", () => {
  it('returns "1 win" for count 1', () => { ... });
  it('returns "N wins" for count > 1', () => { ... });
});

describe("groupWinsByDate (HIST-01)", () => {
  it("returns empty array for empty wins input", () => { ... });
  it("groups wins by date_key, newest section first", () => { ... });
  it("sorts within each group by logged_at DESC (D-11)", () => { ... });
  it("handles single date with multiple wins", () => { ... });
});
```

---

## Shared Patterns

### SafeAreaView Screen Root
**Source:** `app/(tabs)/wins.tsx` (line 6) and `app/(tabs)/index.tsx` (line 80)
**Apply to:** `app/(tabs)/wins.tsx`
```typescript
<SafeAreaView className="flex-1 bg-background">
  ...
</SafeAreaView>
```

### useShallow Store Subscription
**Source:** `app/(tabs)/index.tsx` (lines 24-34)
**Apply to:** `app/(tabs)/wins.tsx`
```typescript
// Always use useShallow for multi-field subscriptions — prevents re-renders from unrelated field changes
const { wins, totalWins, streak, isHydrated } = useWinsStore(
  useShallow((s) => ({
    wins: s.wins,
    totalWins: s.totalWins,
    streak: s.streak,
    isHydrated: s.isHydrated,
  }))
);
```

### NativeWind className — No StyleSheet.create
**Source:** All existing components (WinCard.tsx, StreakHeader.tsx, WinInputArea.tsx)
**Apply to:** All new Phase 3 components
```typescript
// NEVER use StyleSheet.create for new components — className only (Phase 1 + 2 convention)
// Exception: style prop for imperative pixel values (e.g. style={{ width: 64, height: 64 }})
```

### Ionicons Color — Imperative Prop, Not className
**Source:** `src/components/WinCard.tsx` (line 22-24)
**Apply to:** `src/components/DateSectionHeader.tsx` (chevron)
```typescript
// Ionicons does not accept NativeWind className — color is always an imperative prop
<Ionicons name="chevron-down" size={16} color="#8E8E93" />
// Colors.textSecondary = "#8E8E93" — use the literal or import from src/constants/theme.ts
```

### trophy.png Import
**Source:** `app/(tabs)/index.tsx` (line 95), `src/components/StreakHeader.tsx` (line 17)
**Apply to:** `src/components/HistoryHeroHeader.tsx`, empty state in `app/(tabs)/wins.tsx`
```typescript
source={require("@/assets/images/trophy.png")}
```

### Reanimated — Animated.View Wrapping
**Source:** `src/components/WinCard.tsx` (lines 13-16)
**Apply to:** `src/components/DateSectionHeader.tsx` (chevron wrapper)
```typescript
// WinCard wraps the entire card in Animated.View for entering animation
<Animated.View entering={isNew ? ZoomIn.duration(300) : undefined} ...>

// DateSectionHeader wraps ONLY the chevron icon in Animated.View for rotation
<Animated.View style={animatedStyle}>
  <Ionicons ... />
</Animated.View>
```

### No-guilt Copy Invariant
**Source:** `CLAUDE.md` Critical Invariant #4; `src/utils/streakLabel.ts` (lines 7-16)
**Apply to:** Empty state copy in `app/(tabs)/wins.tsx`
```typescript
// streakLabel.ts shows the pattern — every branch is welcoming, no shame words
// Empty state heading: "Your wins will live here"
// Empty state subtext: "Head to Home and log your first win."
// Audit: no "oops", "failed", "missed", "empty", "nothing", "yet" in shame context
```

### Date Noon Anchor
**Source:** `src/utils/dateUtils.ts` (lines 17, 24)
**Apply to:** `formatDateKey` in `src/utils/dateUtils.ts`
```typescript
// ALWAYS: new Date(dateKey + "T12:00:00")
// NEVER:  new Date(dateKey)   ← parses as UTC midnight, off-by-one in negative UTC offsets
```

### Jest Fake Timers Pattern
**Source:** `src/__tests__/dateUtils.test.ts` (lines 11-18)
**Apply to:** `src/__tests__/historyUtils.test.ts`
```typescript
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-05-11T12:00:00")); // noon anchor in test too
});
afterEach(() => { jest.useRealTimers(); });
```

---

## No Analog Found

All Phase 3 files have close analogs in the codebase. No files require falling back to RESEARCH.md-only patterns.

| File | Notes |
|------|-------|
| `DateSectionHeader.tsx` | Composite analog: Reanimated from `WinCard.tsx`, Pressable from `WinInputArea.tsx`, layout from `StreakHeader.tsx`. All patterns present — no truly novel pattern. |

---

## Metadata

**Analog search scope:** `app/(tabs)/`, `src/components/`, `src/stores/`, `src/utils/`, `src/__tests__/`, `src/constants/`
**Files scanned:** 18
**Pattern extraction date:** 2026-05-11

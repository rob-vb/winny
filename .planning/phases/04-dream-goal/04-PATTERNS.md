# Phase 4: Dream Goal — Pattern Map

**Mapped:** 2026-05-12
**Files analyzed:** 5 (2 create utility/test, 2 create components, 1 modify screen)
**Analogs found:** 5 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/utils/goalValidation.ts` | utility | transform | `src/utils/winValidation.ts` | exact |
| `src/__tests__/goalValidation.test.ts` | test | transform | `src/__tests__/winValidation.test.ts` | exact |
| `src/components/GoalCard.tsx` | component | request-response | `src/components/WinCard.tsx` | exact (card surface, Nunito, NativeWind) |
| `src/components/GoalEditor.tsx` | component | request-response | `src/components/WinInputArea.tsx` | role-match (TextInput + Pressable CTA, NativeWind) |
| `app/(tabs)/goal.tsx` | screen | request-response | `app/(tabs)/index.tsx` | role-match (SafeAreaView root, useEffect load, KeyboardAvoidingView) |

---

## Pattern Assignments

### `src/utils/goalValidation.ts` (utility, transform)

**Analog:** `src/utils/winValidation.ts`

**What is the same:** Single exported function, pure string transform (trim → length check), JSDoc comment header, no imports needed.

**What differs:** Max length is 500 (not 200). The function must also expose `isDirty` comparison logic and `showCounter` threshold as helpers so they can be unit tested in isolation (per RESEARCH.md Wave 0 test map).

**Full analog** (`src/utils/winValidation.ts`, lines 1–9):
```typescript
/**
 * Validates win text per WIN-01: must be 1–200 characters after trim.
 * Whitespace-only strings are rejected (trim makes them empty).
 * Used by WinInputArea (Plan 03) to guard the submit button.
 */
export function validateWinText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length >= 1 && trimmed.length <= 200;
}
```

**Pattern to replicate for `goalValidation.ts`:**
- One function per exported concern (validate, isDirty, showCounter)
- JSDoc header per function referencing the requirement ID (GOAL-01)
- Pure functions — no imports, no side effects
- File lives at `src/utils/` beside `winValidation.ts`

---

### `src/__tests__/goalValidation.test.ts` (test, transform)

**Analog:** `src/__tests__/winValidation.test.ts`

**What is the same:** Jest `describe` block named after the utility + requirement ID. `it()` cases follow the pattern: rejects empty, rejects whitespace-only, accepts boundary value (exactly N chars), rejects boundary+1, verifies trim-before-check behavior.

**What differs:** Max length boundary is 500 (not 200). Additional `describe` blocks needed for `isDirty` logic and `showCounter` threshold (≤100 remaining triggers visibility) — these are new behaviors with no analog, but the `it()` case style is identical.

**Full analog** (`src/__tests__/winValidation.test.ts`, lines 1–31):
```typescript
import { validateWinText } from "@/src/utils/winValidation";

describe("validateWinText (WIN-01)", () => {
  it("rejects empty string", () => {
    expect(validateWinText("")).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(validateWinText("   ")).toBe(false);
  });

  it("accepts single character", () => {
    expect(validateWinText("a")).toBe(true);
  });

  it("accepts exactly 200 characters", () => {
    expect(validateWinText("a".repeat(200))).toBe(true);
  });

  it("rejects 201 characters", () => {
    expect(validateWinText("a".repeat(201))).toBe(false);
  });

  it("trims before checking length: 200-char string with leading space is rejected", () => {
    expect(validateWinText(" " + "a".repeat(200))).toBe(true); // trimmed = 200 chars, valid
    expect(validateWinText(" " + "a".repeat(201))).toBe(false); // trimmed = 201 chars, invalid
  });
});
```

**Pattern for new `describe` blocks to add (no analog — follow same `it()` style):**
```typescript
describe("isDirty (GOAL-01)", () => {
  // same text → false
  // different text → true
  // whitespace-padded equals original after trim → false
  // empty vs non-empty → true
});

describe("showCounter (GOAL-01)", () => {
  // 499 chars remaining (>100) → false
  // 100 chars remaining → true (boundary)
  // 99 chars remaining → true
  // 0 chars remaining → true
});
```

---

### `src/components/GoalCard.tsx` (component, request-response)

**Analog:** `src/components/WinCard.tsx`

**What is the same:**
- `Animated.View` as root element (for future animation extensibility)
- Card surface classNames: `bg-surface rounded-xl px-4 shadow-sm`
- `accessibilityLabel` on the card root
- Nunito font classNames on `Text` elements
- `text-text-primary` for content text, `text-text-secondary` for secondary copy

**What differs:**
- No `isNew` / `ZoomIn` entering animation prop (GoalCard is static in view mode)
- No `Ionicons` heart icon
- Vertical padding is `py-6` (not `py-3`) — UI-SPEC specifies larger breathing room for hero text
- Has TWO `Text` nodes: hero text at `text-[28px] font-nunito-bold leading-tight`, motivational copy at `text-base font-nunito-regular text-text-secondary` below
- No `flex-row` — card is a vertical stack
- Accepts `text: string` prop (not a full `Win` object)
- Also needs `border border-border` per UI-SPEC layout contract

**Full analog** (`src/components/WinCard.tsx`, lines 1–29):
```typescript
import { View, Text } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { Win } from "@/src/db/schema";

interface WinCardProps {
  win: Win;
  isNew: boolean;
}

export function WinCard({ win, isNew }: WinCardProps) {
  return (
    <Animated.View
      entering={isNew ? ZoomIn.duration(300) : undefined}
      className="bg-surface rounded-xl px-4 py-3 mb-2 shadow-sm flex-row items-start"
      accessibilityLabel={win.text}
    >
      <Text className="font-nunito-regular text-base text-text-primary leading-relaxed flex-1">
        {win.text}
      </Text>
      <Ionicons
        name="heart-outline"
        size={16}
        color="#FF6B6B"
        style={{ marginLeft: 8, marginTop: 2 }}
      />
    </Animated.View>
  );
}
```

**GoalCard structure to produce:**
```typescript
import { View, Text } from "react-native";
import Animated from "react-native-reanimated";

interface GoalCardProps {
  text: string;
  style?: object; // for useAnimatedStyle opacity from parent
}

export function GoalCard({ text, style }: GoalCardProps) {
  return (
    <Animated.View
      style={style}
      className="bg-surface rounded-xl px-4 py-6 shadow-sm border border-border mt-2"
      accessibilityLabel={text}
    >
      <Text className="font-nunito-bold text-[28px] text-text-primary leading-tight">
        {text}
      </Text>
      {/* motivational copy — below hero text, per D-03 */}
      <Text className="font-nunito-regular text-base text-text-secondary leading-relaxed mt-4 text-center">
        You're building your dream one win at a time.
      </Text>
    </Animated.View>
  );
}
```

Note: The `style` prop accepts `useAnimatedStyle()` return value from the parent (GoalScreen) for the opacity crossfade — this is how Strategy A (always-mounted, opacity-controlled) wires up per RESEARCH.md Pitfall 2 recommendation.

---

### `src/components/GoalEditor.tsx` (component, request-response)

**Analog:** `src/components/WinInputArea.tsx`

**What is the same:**
- `TextInput` with `placeholderTextColor="#8E8E93"`, `font-nunito-regular text-base text-text-primary` className
- `Pressable` CTA button: `bg-primary rounded-lg min-h-[44px]`, `opacity-50` when disabled
- `Text` inside Pressable: `font-nunito-bold text-sm text-white`
- Cancel ghost button uses `text-text-secondary` and `min-h-[44px]`
- `accessibilityRole="button"` on all Pressables
- `accessibilityState={{ disabled: ... }}` on Save Pressable

**What differs:**
- `multiline={true}` (WinInputArea uses `multiline={false}`)
- `maxLength={500}` (WinInputArea uses `maxLength={200}`)
- `autoFocus={false}` — keyboard appears when edit mode is entered, not on component mount
- `minHeight: 120` via `style` prop (cannot use NativeWind — see RESEARCH.md Assumption A2)
- Character counter `Text` rendered conditionally when `remaining <= 100`
- Action row has TWO buttons (Cancel + Save) in flex-row when `showCancel=true`; Save is full-width when `showCancel=false` (empty state)
- Props are fully controlled: `currentText`, `onChangeText`, `onSave`, `onCancel`, `isDirty`, `isSaving`, `showCancel`
- Wrap in `Animated.View` with `style` prop for parent-driven opacity crossfade

**Full analog** (`src/components/WinInputArea.tsx`, lines 1–60):
```typescript
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { validateWinText } from "@/src/utils/winValidation";

interface WinInputAreaProps {
  onSubmit: (text: string) => Promise<void>;
}

export function WinInputArea({ onSubmit }: WinInputAreaProps) {
  const [inputText, setInputText] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const isDisabled = !validateWinText(inputText) || isAdding;

  const handleSubmit = async () => {
    if (isDisabled) return;
    setIsAdding(true);
    try {
      await onSubmit(inputText.trim());
      setInputText("");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View className="border-t border-border bg-surface px-4 py-3">
      <View className="flex-row items-center gap-3">
        <TextInput
          className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-nunito-regular text-base text-text-primary"
          placeholder="What did you win today?"
          placeholderTextColor="#8E8E93"
          value={inputText}
          onChangeText={setInputText}
          maxLength={200}
          autoFocus={true}
          returnKeyType="done"
          multiline={false}
          onSubmitEditing={handleSubmit}
          accessibilityLabel="Win text input"
          accessibilityHint="Type your win for today, up to 200 characters"
        />
        <Pressable
          onPress={handleSubmit}
          disabled={isDisabled}
          className={`bg-primary rounded-lg min-h-[44px] min-w-[44px] items-center justify-center px-3 ${
            isDisabled ? "opacity-50" : "opacity-100"
          }`}
          accessibilityLabel="Add win"
          accessibilityRole="button"
        >
          <Text className="font-nunito-bold text-sm text-white">Add Win</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

**GoalEditor structure to produce:**
```typescript
import { View, Text, TextInput, Pressable } from "react-native";
import Animated from "react-native-reanimated";

interface GoalEditorProps {
  currentText: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
  isSaving: boolean;
  showCancel: boolean;  // false in empty state, true in edit mode
  style?: object;       // useAnimatedStyle for crossfade from parent
}

export function GoalEditor({ currentText, onChangeText, onSave, onCancel,
                             isDirty, isSaving, showCancel, style }: GoalEditorProps) {
  const canSave = isDirty && currentText.trim().length > 0 && !isSaving;
  const remaining = 500 - currentText.length;
  const showCounter = remaining <= 100;

  return (
    <Animated.View style={style}>
      {/* TextInput card */}
      <View className="bg-surface rounded-xl px-4 py-4 shadow-sm border border-border mt-2">
        <TextInput
          className="font-nunito-regular text-base text-text-primary"
          style={{ minHeight: 120 }}  // style prop required for Android multiline
          placeholder="What are you working toward?"
          placeholderTextColor="#8E8E93"
          value={currentText}
          onChangeText={onChangeText}
          maxLength={500}
          multiline={true}
          autoFocus={false}
          accessibilityLabel="Dream Goal text"
          accessibilityHint="Type your dream goal, up to 500 characters"
        />
        {showCounter && (
          <Text
            className="font-nunito-bold text-sm text-text-secondary text-right mt-1"
            accessibilityLabel={`${currentText.length} of 500 characters used`}
          >
            {remaining} / 500
          </Text>
        )}
      </View>

      {/* Action row */}
      <View className={`mt-4 ${showCancel ? 'flex-row gap-3' : ''}`}>
        {showCancel && (
          <Pressable
            onPress={onCancel}
            className="flex-1 min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Cancel editing"
          >
            <Text className="font-nunito-bold text-sm text-text-secondary">Cancel</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          className={`bg-primary rounded-lg min-h-[44px] items-center justify-center px-3 ${
            showCancel ? 'flex-1' : 'w-full'
          } ${!canSave ? 'opacity-50' : 'opacity-100'}`}
          accessibilityRole="button"
          accessibilityLabel="Save Goal"
          accessibilityState={{ disabled: !canSave }}
          accessibilityHint={!canSave ? "Edit your goal text to enable saving" : undefined}
        >
          <Text className="font-nunito-bold text-sm text-white">Save Goal</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
```

---

### `app/(tabs)/goal.tsx` (screen, request-response)

**Analog:** `app/(tabs)/index.tsx` (primary) + `app/(tabs)/wins.tsx` (secondary)

**What is the same from `index.tsx`:**
- `SafeAreaView className="flex-1 bg-background"` as screen root (line 80)
- `KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}` wrapping content (lines 81–83)
- `useEffect` for DB load on mount, with `[]` dependency array (lines 46–50)
- Loading state renders minimal `SafeAreaView` with no content to avoid flash (lines 64–77)

**What is the same from `wins.tsx`:**
- Import style: named imports from `react-native`, then `react-native-safe-area-context`, then local paths (lines 1–9)
- `export default function ScreenName()` at the bottom

**What differs from both analogs:**
- No Zustand store — uses local `useState` + `useEffect` instead of `useWinsStore`
- State machine is a discriminated union string (`'loading' | 'empty' | 'view' | 'editing' | 'saving' | 'error'`) rather than `isHydrated` boolean
- Reanimated `useSharedValue` / `useAnimatedStyle` / `withTiming` for crossfade (not in either analog tab screen — pattern comes from `DateSectionHeader.tsx`)
- Pencil icon Pressable in header row (not in either analog)
- `ScrollView` (not `FlatList` or `SectionList`)

**Screen imports pattern** (`app/(tabs)/index.tsx`, lines 1–18):
```typescript
import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ... store and component imports via @/ path alias
```

**Loading state pattern** (`app/(tabs)/index.tsx`, lines 64–77):
```typescript
if (!isHydrated) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* minimal content — prevents empty flash */}
    </SafeAreaView>
  );
}
```

**KeyboardAvoidingView wrapper pattern** (`app/(tabs)/index.tsx`, lines 81–84):
```typescript
<SafeAreaView className="flex-1 bg-background">
  <KeyboardAvoidingView
    className="flex-1"
    behavior={Platform.OS === "ios" ? "padding" : undefined}
  >
    {/* ScrollView + content inside */}
  </KeyboardAvoidingView>
</SafeAreaView>
```

**Reanimated crossfade pattern** (`src/components/DateSectionHeader.tsx`, lines 1–7, 34–44):
```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

// Inside component:
const rotation = useSharedValue(isCollapsed ? 180 : 0);

useEffect(() => {
  rotation.value = withTiming(isCollapsed ? 180 : 0, { duration: 200 });
}, [isCollapsed, rotation]);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${rotation.value}deg` }],
}));
```

**Adaptation for GoalScreen crossfade (two opacity shared values):**
```typescript
// Declare at component top (before any conditional returns)
const cardOpacity = useSharedValue(0);
const editorOpacity = useSharedValue(0);
const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));
const editorStyle = useAnimatedStyle(() => ({ opacity: editorOpacity.value }));

// On load → view:
cardOpacity.value = withTiming(1, { duration: 200 });

// On pencil tap (enter edit):
cardOpacity.value = withTiming(0, { duration: 200 });
editorOpacity.value = withTiming(1, { duration: 200 });

// On Save/Cancel (exit edit):
editorOpacity.value = withTiming(0, { duration: 200 });
cardOpacity.value = withTiming(1, { duration: 200 });
```

**GoalScreen structure to produce (abbreviated):**
```typescript
import { useState, useEffect } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { getGoal, upsertGoal } from "@/src/db/repositories/dreamGoal";
import { GoalCard } from "@/src/components/GoalCard";
import { GoalEditor } from "@/src/components/GoalEditor";

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
        if (goal === null || goal.text === '') {
          editorOpacity.value = withTiming(1, { duration: 200 });
          setScreenState('empty');
        } else {
          setSavedText(goal.text);
          setCurrentText(goal.text);
          cardOpacity.value = withTiming(1, { duration: 200 });
          setScreenState('view');
        }
      } catch {
        setScreenState('error');
      }
    })();
  }, []);

  // loading state — empty SafeAreaView, same background, no flash
  if (screenState === 'loading') {
    return <SafeAreaView className="flex-1 bg-background" />;
  }

  // ... render with ScrollView, conditional header pencil icon, GoalCard + GoalEditor
  // Both GoalCard and GoalEditor are always mounted; opacity controls visibility (Strategy A)
}
```

---

## Shared Patterns

### NativeWind className conventions
**Source:** `src/components/WinCard.tsx`, `src/components/WinInputArea.tsx`
**Apply to:** All new component files (GoalCard, GoalEditor, GoalScreen)

- Card surface: `bg-surface rounded-xl px-4 shadow-sm border border-border`
- Screen root: `SafeAreaView className="flex-1 bg-background"`
- Primary CTA: `bg-primary rounded-lg min-h-[44px] items-center justify-center px-3`
- Disabled state: append `opacity-50` (via template literal conditional) — never `opacity-100` explicitly unless toggling
- Body text: `font-nunito-regular text-base text-text-primary leading-relaxed`
- Secondary text: `font-nunito-regular text-base text-text-secondary`
- Bold headings: `font-nunito-bold text-xl` (heading) or `font-nunito-bold text-[28px]` (display hero)
- Label/button text: `font-nunito-bold text-sm text-white` (CTA) or `font-nunito-bold text-sm text-text-secondary` (ghost)
- NO `StyleSheet.create` anywhere — project invariant

### Reanimated withTiming opacity pattern
**Source:** `src/components/DateSectionHeader.tsx` (lines 1–7, 34–44)
**Apply to:** `app/(tabs)/goal.tsx` (crossfade), `src/components/GoalCard.tsx` and `src/components/GoalEditor.tsx` (accept `style` prop)

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

// Shared value initialized at 0; animated to 1 after first load
const cardOpacity = useSharedValue(0);
const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));
cardOpacity.value = withTiming(1, { duration: 200 });
```

### KeyboardAvoidingView + Platform pattern
**Source:** `app/(tabs)/index.tsx` (lines 81–84)
**Apply to:** `app/(tabs)/goal.tsx` (edit mode and empty state both have a TextInput)

```typescript
<KeyboardAvoidingView
  className="flex-1"
  behavior={Platform.OS === "ios" ? "padding" : undefined}
>
  {/* ScrollView inside */}
</KeyboardAvoidingView>
```

### Path alias convention
**Source:** All existing files
**Apply to:** All new files

- Use `@/src/...` for src imports, `@/assets/...` for assets
- No relative paths (`../../`) in component or screen files
- Barrel imports not used — import directly from the file that exports the symbol

### Pressable disabled pattern
**Source:** `src/components/WinInputArea.tsx` (lines 46–55)
**Apply to:** `src/components/GoalEditor.tsx` Save button

```typescript
<Pressable
  onPress={handleSubmit}
  disabled={isDisabled}
  className={`bg-primary rounded-lg min-h-[44px] min-w-[44px] items-center justify-center px-3 ${
    isDisabled ? "opacity-50" : "opacity-100"
  }`}
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
>
```

---

## No Analog Found

All 5 files have close analogs. The following behaviors within new files have no direct analog and must be built from RESEARCH.md patterns:

| Behavior | Within File | Reason |
|----------|-------------|--------|
| Discriminated union state machine (`GoalState`) | `app/(tabs)/goal.tsx` | Existing screens use boolean `isHydrated` guard, not a multi-mode state machine |
| Character counter conditional render | `src/components/GoalEditor.tsx` | No existing component has a character counter |
| `showCancel` prop to switch between empty-state and edit-mode action row | `src/components/GoalEditor.tsx` | No existing component has a context-switching action row |
| `isDirty` helpers | `src/utils/goalValidation.ts` | `winValidation.ts` only has `validateWinText`; no dirty-check utility exists |

---

## Metadata

**Analog search scope:** `app/(tabs)/`, `src/components/`, `src/utils/`, `src/__tests__/`
**Files scanned:** 7 (goal.tsx placeholder, index.tsx, wins.tsx, WinCard.tsx, WinInputArea.tsx, DateSectionHeader.tsx, winValidation.ts + winValidation.test.ts)
**Pattern extraction date:** 2026-05-12

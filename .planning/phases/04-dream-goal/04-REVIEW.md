---
phase: 04-dream-goal
reviewed: 2026-05-12T17:12:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/utils/goalValidation.ts
  - src/__tests__/goalValidation.test.ts
  - src/components/GoalCard.tsx
  - src/components/GoalEditor.tsx
  - src/__tests__/GoalCard.test.ts
  - src/__tests__/GoalEditor.test.ts
  - app/(tabs)/goal.tsx
findings:
  critical: 0
  warning: 5
  info: 4
  total: 9
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-05-12T17:12:00Z
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Seven files were reviewed covering the Dream Goal phase: the validation utility, two presentational components, their file-contract tests, and the goal screen. The implementation is broadly correct and internally consistent — no data-loss or crash-level bugs were found. However there are five warnings of meaningful consequence: dead validation utilities in production code (the components reimplement the logic inline), a real accessibility regression in `GoalCard`, a misleading test description that could cause future failures to be missed, and loose `style` types that accept anything silently. Four info-level items round out the review.

---

## Warnings

### WR-01: `validateGoalText` and `shouldShowCounter` are dead code in production — inline reimplementations diverge under future changes

**File:** `src/components/GoalEditor.tsx:25-27`

**Issue:** `GoalEditor` never imports from `goalValidation.ts`. Instead it reimplements both pieces of logic inline:

```ts
// GoalEditor.tsx (inline — line 25-27)
const canSave = isDirty && currentText.trim().length > 0 && !isSaving;
const remaining = 500 - currentText.length;
const showCounter = remaining <= 100;
```

`validateGoalText` and `shouldShowCounter` are only imported in their test files. This means:

- Any change to the validation rule (e.g., raising the minimum, tightening the max) in `goalValidation.ts` will not propagate to the running UI — the inline check remains.
- The threshold `<= 100` in `GoalEditor` line 27 is hardcoded and will diverge silently if `shouldShowCounter` is ever updated.

**Fix:** Import and use the utilities instead of duplicating:

```ts
import { validateGoalText, shouldShowCounter } from "@/src/utils/goalValidation";
import { isDirty as checkDirty } from "@/src/utils/goalValidation";

// In GoalEditor body:
const canSave = isDirty && validateGoalText(currentText) && !isSaving;
const showCounter = shouldShowCounter(currentText);
```

Note: `validateGoalText` trims before checking length, which is the correct behaviour for the save guard. The raw-length `remaining` display is fine to keep computed inline since it mirrors what the user typed.

---

### WR-02: `accessibilityLabel` on `GoalCard` container suppresses child text for screen readers

**File:** `src/components/GoalCard.tsx:14`

**Issue:** `accessibilityLabel={text}` is set on the outer `Animated.View` container:

```tsx
<Animated.View
  style={style}
  className="..."
  accessibilityLabel={text}   // <-- line 14
>
  <Text ...>{text}</Text>
  <Text ...>You're building your dream one win at a time.</Text>
</Animated.View>
```

On both iOS and Android, setting `accessibilityLabel` on a view container turns the view into an accessibility element and suppresses its children. Screen readers will announce only the goal text — the motivational subtitle ("You're building your dream one win at a time.") is completely silenced. This is an accessibility regression.

**Fix:** Remove `accessibilityLabel` from the container and add `accessible={false}` to let the individual `Text` children be discovered normally, or combine both strings into a single label:

```tsx
<Animated.View
  style={style}
  className="..."
  accessible={true}
  accessibilityLabel={`${text}. You're building your dream one win at a time.`}
>
```

Alternatively, remove the container label entirely — React Native will read both `Text` children in order automatically.

---

### WR-03: Test description contradicts assertion — "returns false" but asserts `toBe(true)`

**File:** `src/__tests__/goalValidation.test.ts:57`

**Issue:** The `it()` description says **"returns false for 400 chars"** but the assertion is `toBe(true)`:

```ts
it("returns false for 400 chars (100 remaining) — boundary: exactly 100 remaining triggers counter", () => {
  expect(shouldShowCounter("a".repeat(400))).toBe(true);  // asserts TRUE
});
```

The assertion is correct per the implementation (`<= 100` includes exactly 100 remaining, so `shouldShowCounter` returns `true` at 400 chars). The test description is wrong. When this test fails in the future (e.g., after a refactor), the failure message will be deeply confusing because the test name says the opposite of what the assertion checks.

**Fix:**

```ts
it("returns true for 400 chars (100 remaining) — boundary: exactly 100 remaining triggers counter", () => {
  expect(shouldShowCounter("a".repeat(400))).toBe(true);
});
```

---

### WR-04: `style` prop typed as `object` instead of `StyleProp<ViewStyle>`

**File:** `src/components/GoalCard.tsx:6`, `src/components/GoalEditor.tsx:12`

**Issue:** Both components declare `style?: object` for the animated style prop. `object` accepts any non-primitive TypeScript value. Passing a completely invalid style (e.g., a plain `{}` with unrelated keys, or a non-style class instance) will compile without error and fail silently at runtime. The correct type for an `Animated.View` style from `useAnimatedStyle` is `AnimatedStyleProp<ViewStyle>` from reanimated.

```ts
// GoalCardProps (line 6)
style?: object;
// GoalEditorProps (line 12)
style?: object;
```

**Fix:**

```ts
import type { AnimatedStyleProp } from "react-native-reanimated";
import type { ViewStyle } from "react-native";

interface GoalCardProps {
  text: string;
  style?: AnimatedStyleProp<ViewStyle>;
}
```

---

### WR-05: Save guard in `GoalEditor` allows saving whitespace-only text when `isDirty` is true and `currentText` is all spaces

**File:** `src/components/GoalEditor.tsx:25`

**Issue:** `canSave` is computed as:

```ts
const canSave = isDirty && currentText.trim().length > 0 && !isSaving;
```

Consider the case where `savedText` is `"My goal"` and the user clears the input and types `"   "` (spaces only). `currentText.trim().length` is 0, so `canSave` is `false` — correct. However, the TextInput's `maxLength={500}` is applied to *raw* `currentText.length`, while `validateGoalText` trims first. This means a user can type 499 spaces followed by a single character (500 raw chars — `maxLength` allows it), which passes both `canSave` and `validateGoalText`. After save, `upsertGoal(currentText.trim())` saves only the single non-space character (1 char). This is arguably correct, but the visible character count in the counter (`remaining = 500 - currentText.length`) would show 0 remaining while the actual saved content would be 1 character. The user receives misleading feedback.

This is a minor UX inconsistency rather than a data corruption issue, but it can confuse users who pad their text with leading/trailing spaces.

**Fix:** Compute `remaining` from `currentText.trim().length` for the counter display, or add a note in the component that the counter intentionally shows raw character count. If the intent is to show remaining space after trim, use:

```ts
const remaining = 500 - currentText.trim().length;
```

Note: changing this would require re-aligning the `shouldShowCounter` utility and its tests which also use raw length.

---

## Info

### IN-01: Motivational copy string duplicated across `GoalCard` and `goal.tsx`

**File:** `src/components/GoalCard.tsx:19`, `app/(tabs)/goal.tsx:108`

**Issue:** The string `"You're building your dream one win at a time."` appears verbatim in both `GoalCard.tsx` (line 19, inside the card) and `goal.tsx` (line 108, as a standalone header in the empty state). If the copy changes, both files must be updated.

**Fix:** Extract to a shared constant:

```ts
// src/utils/copy.ts
export const DREAM_GOAL_TAGLINE = "You're building your dream one win at a time.";
```

---

### IN-02: `isDirty` test suite mislabeled as GOAL-01

**File:** `src/__tests__/goalValidation.test.ts:30`

**Issue:** The `describe` block reads `"isDirty (GOAL-01)"` but `isDirty` is tagged as spec D-06 in `goalValidation.ts` (line 13 comment). All three suites carry `(GOAL-01)` but only `validateGoalText` is GOAL-01.

**Fix:** Update the describe labels:

```ts
describe("isDirty (D-06)", () => { ... });
describe("shouldShowCounter (D-07)", () => { ... });
```

---

### IN-03: `accessibilityHint` on disabled Save button does not cover the `isDirty=false` case

**File:** `src/components/GoalEditor.tsx:80-82`

**Issue:** The hint says `"Edit your goal text to enable saving"` but the Save button is also disabled when the text is unchanged (`isDirty` is false). If the user has not edited the text, the hint text is misleading — the goal text is already non-empty but saving is still disabled.

**Fix:**

```tsx
accessibilityHint={
  !canSave
    ? isSaving
      ? "Saving in progress"
      : !isDirty
      ? "No changes to save"
      : "Enter goal text to enable saving"
    : undefined
}
```

---

### IN-04: `autoFocus={false}` is redundant on `TextInput`

**File:** `src/components/GoalEditor.tsx:42`

**Issue:** `autoFocus={false}` is the default for `TextInput`. The prop is noise.

**Fix:** Remove line 42 (`autoFocus={false}`).

---

_Reviewed: 2026-05-12T17:12:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_

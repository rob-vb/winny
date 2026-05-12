---
status: partial
phase: 04-dream-goal
source: [04-VERIFICATION.md]
started: 2026-05-12T17:50:00Z
updated: 2026-05-12T17:50:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Confirm goal persists across force-quit and relaunch
expected: Goal text typed and saved survives a complete app force-quit and relaunch — appears in view mode on the Goal tab
result: [pending]

### 2. Confirm empty state shows TextInput immediately focused (no extra tap)
expected: When no goal is saved, the TextInput is visible and ready to type without an extra tap. Motivational copy appears above the input.
result: [pending]

### 3. Confirm Reanimated crossfade between GoalCard and GoalEditor animates correctly (no visual glitch)
expected: Tapping the pencil icon fades GoalCard out and GoalEditor in over 200ms. No content flash or layout jump.
result: [pending]

### 4. Confirm character counter shows at exactly 400 characters typed (100 remaining boundary)
expected: Counter '{N} / 500' appears when 400 or more characters are typed; absent below 400
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps

/**
 * Validates goal text per GOAL-01: must be 1–500 characters after trim.
 * Whitespace-only strings are rejected (trim makes them empty).
 * Used by GoalEditor (Plan 02) to guard the Save button.
 */
export function validateGoalText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length >= 1 && trimmed.length <= 500;
}

/**
 * Returns true when currentText differs from savedText after trimming both.
 * Per D-06: Save is disabled until isDirty — prevents no-op saves.
 * Pure string comparison; no side effects.
 */
export function isDirty(currentText: string, savedText: string): boolean {
  return currentText.trim() !== savedText.trim();
}

/**
 * Returns true when the character counter should be shown.
 * Per D-07: counter appears only when ≤100 characters remain (maxLength - text.length ≤ 100).
 * Uses text.length (not trimmed) to match the TextInput maxLength prop behaviour.
 */
export function shouldShowCounter(text: string, maxLength: number = 500): boolean {
  return (maxLength - text.length) <= 100;
}

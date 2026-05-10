/**
 * Validates win text per WIN-01: must be 1–200 characters after trim.
 * Whitespace-only strings are rejected (trim makes them empty).
 * Used by WinInputArea (Plan 03) to guard the submit button.
 */
export function validateWinText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length >= 1 && trimmed.length <= 200;
}

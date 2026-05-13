import { getStreakCopy } from "@/src/copy/catalog";

/**
 * Returns an encouraging label string for the given streak count.
 * STREAK-04: No guilt or shame language anywhere. streak=0 is welcoming.
 * D-04: Count is embedded in the label string — not a separate display element.
 */
export function streakLabel(streak: number): string {
  return getStreakCopy(streak);
}

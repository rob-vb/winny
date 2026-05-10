import { EXAMPLE_PROMPTS } from "@/src/constants/examplePrompts";

/**
 * Returns `count` distinct daily prompts deterministically seeded by dateKey.
 * WIN-02: Same 3 prompts for the full calendar day; different prompts next day.
 * D-06: Non-tappable, non-interactive — pure display content.
 * Uses position-weighted char-code sum (Pitfall 9 fix) to reduce adjacent-day collisions.
 */
export function selectDailyPrompts(dateKey: string, count = 3): string[] {
  const pool = EXAMPLE_PROMPTS;
  // Position-weighted sum reduces same-prompts-on-adjacent-days probability (Pitfall 9)
  const seed = dateKey
    .split("")
    .reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 1), 0);

  const startIndex = seed % pool.length;
  // Wrap around pool without duplicates within the selected 3
  return Array.from({ length: count }, (_, i) => pool[(startIndex + i) % pool.length]);
}

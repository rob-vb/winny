import { isToday, isYesterday, isSameYear, format } from "date-fns";
import i18n from "i18next";
import { dateLocaleFor } from "@/src/i18n/dateLocale";
import { isSupportedLocale, FALLBACK_LOCALE } from "@/src/i18n/languages";

// CRITICAL: 'en-CA' locale produces YYYY-MM-DD in device LOCAL time
// NEVER use date.toISOString().slice(0,10) — that returns UTC date (RESEARCH Pitfall 4)
export function toDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA").format(date);
}

// Computes streak from distinct date keys (sorted DESC most-recent-first)
// D-04: streak is calculated on-the-fly from wins table, no separate streak table
export function computeStreak(distinctDateKeys: string[]): number {
  if (distinctDateKeys.length === 0) return 0;

  const sorted = [...distinctDateKeys].sort().reverse();
  const today = toDateKey();

  if (sorted[0] !== today) {
    // Grace: streak still alive if most recent win was yesterday
    const yesterday = toDateKey(new Date(new Date(today + "T12:00:00").getTime() - 86400000));
    if (sorted[0] !== yesterday) return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    // Use T12:00:00 noon anchor to avoid DST boundary issues (RESEARCH Pattern 7)
    const prev = new Date(sorted[i - 1] + "T12:00:00");
    const curr = new Date(sorted[i] + "T12:00:00");
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Converts a YYYY-MM-DD date_key to a human-readable relative-then-absolute label (D-01).
// Uses noon anchor to prevent DST edge-case misclassification — same pattern as computeStreak.
// - Today's date_key → "Today"
// - Yesterday's date_key → "Yesterday"
// - Same calendar year → "EEE, MMM d" (e.g. "Sat, May 9")
// - Prior year → "MMM d, yyyy" (e.g. "Dec 1, 2025")
export function formatDateKey(dateKey: string): string {
  // Noon anchor: prevents UTC midnight off-by-one in negative UTC offsets (RESEARCH Pitfall 3)
  const d = new Date(dateKey + "T12:00:00");
  if (isToday(d)) return i18n.t("date.today");
  if (isYesterday(d)) return i18n.t("date.yesterday");
  const code = isSupportedLocale(i18n.language) ? i18n.language : FALLBACK_LOCALE;
  const locale = dateLocaleFor(code);
  const fmt = isSameYear(d, new Date())
    ? i18n.t("date.formatSameYear")
    : i18n.t("date.formatPriorYear");
  return format(d, fmt, { locale });
}

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

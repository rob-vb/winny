export type PostWinMoment =
  | { type: "first-win" }
  | { type: "milestone"; milestone: 7 | 30 | 100 }
  | { type: "comeback" }
  | { type: "post-save" };

export function getStreakMilestone(streak: number): 7 | 30 | 100 | null {
  if (streak === 7 || streak === 30 || streak === 100) return streak;
  return null;
}

function dayDiff(fromDateKey: string, toDateKey: string): number {
  const from = new Date(`${fromDateKey}T12:00:00`);
  const to = new Date(`${toDateKey}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export function isComebackWin(
  previousLatestDateKey: string | null,
  todayDateKey: string
): boolean {
  if (previousLatestDateKey === null) return false;
  return dayDiff(previousLatestDateKey, todayDateKey) > 1;
}

export function getPostWinMoment(input: {
  previousTotalWins: number;
  nextStreak: number;
  previousLatestDateKey: string | null;
  todayDateKey: string;
}): PostWinMoment {
  if (input.previousTotalWins === 0) return { type: "first-win" };

  const milestone = getStreakMilestone(input.nextStreak);
  if (milestone !== null) return { type: "milestone", milestone };

  if (isComebackWin(input.previousLatestDateKey, input.todayDateKey)) {
    return { type: "comeback" };
  }

  return { type: "post-save" };
}

/**
 * Returns an encouraging label string for the given streak count.
 * STREAK-04: No guilt or shame language anywhere. streak=0 is welcoming.
 * D-04: Count is embedded in the label string — not a separate display element.
 */
export function streakLabel(streak: number): string {
  if (streak === 0)   return "Start your streak today! 🌟";
  if (streak === 1)   return "Day 1! Every streak starts here. 🎉";
  if (streak === 2)   return "2 days! You're getting started! 🌱";
  if (streak <= 6)    return `${streak} day streak! Keep it up! 💪`;
  if (streak <= 13)   return `${streak} day streak! You're building something real! 🔥`;
  if (streak <= 29)   return `${streak} day streak! You're on fire! 🔥🔥`;
  if (streak <= 59)   return `${streak} day streak! You're unstoppable! 🚀`;
  if (streak <= 99)   return `${streak} day streak! Legendary! 🏆`;
  return `${streak} day streak! You're a Winning Streak champion! 👑`;
}

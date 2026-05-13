import type { PostWinMoment } from "@/src/utils/postWinMoment";

export type CopyState =
  | "firstWin"
  | "milestone7"
  | "milestone30"
  | "milestone100"
  | "comeback"
  | "postSave"
  | "longStreak"
  | "homeEmpty"
  | "historyEmpty"
  | "dreamGoalEmpty"
  | "notificationDisabled"
  | "saveError"
  | "loadError"
  | "notificationPrompt";

export interface CopyMessage {
  title: string;
  body: string;
}

export const notificationPrompts = [
  "What was your win today?",
  "One small win counts. Log it.",
  "Time to notice what's working.",
  "Your dream is built one win at a time.",
  "Add one win — that's enough.",
] as const;

export const COPY_CATALOG: Record<CopyState, readonly string[] | CopyMessage> = {
  firstWin: {
    title: "First win logged",
    body: "That's the whole move. Notice one win, then come back tomorrow.",
  },
  milestone7: {
    title: "7 days of wins",
    body: "A full week of noticing what is working. Keep building.",
  },
  milestone30: {
    title: "30 days strong",
    body: "That's a real rhythm. Your wins are starting to stack.",
  },
  milestone100: {
    title: "100 days of proof",
    body: "You have built something rare. One win at a time.",
  },
  comeback: {
    title: "You're back in motion",
    body: "Today counts. Start from this win and keep going.",
  },
  postSave: {
    title: "Win added",
    body: "One more piece of proof that you're moving.",
  },
  longStreak: [
    "{n} day streak! You're building something real!",
    "{n} day streak! Keep stacking proof.",
    "{n} day streak! Your rhythm is real.",
  ],
  homeEmpty: [
    "What was your win today?",
    "Start with one win today.",
    "Notice one thing that moved you forward.",
  ],
  historyEmpty: [
    "Your wins will show up here.",
    "Log your first win and your history starts here.",
    "Every win you add becomes part of your proof.",
  ],
  dreamGoalEmpty: [
    "You're building your dream one win at a time.",
    "Name what your wins are building toward.",
    "Set a Dream Goal when you're ready.",
  ],
  notificationDisabled: [
    "Notifications disabled — tap to open Settings",
    "Reminders are off for now.",
    "You can turn reminders back on any time.",
  ],
  saveError: [
    "Couldn't save — tap to try again.",
    "That did not save yet. Try once more.",
    "Save did not finish. Your text is still here.",
  ],
  loadError: [
    "Couldn't load this yet — please restart the app.",
    "This did not load yet. Restarting the app should help.",
    "We could not load this screen yet. Please restart the app.",
  ],
  notificationPrompt: notificationPrompts,
};

export function pickCopyVariant(
  variants: readonly string[],
  seed: string | number
): string {
  if (variants.length === 0) {
    throw new Error("pickCopyVariant requires at least one variant");
  }

  const source = String(seed);
  let hash = 0;
  for (let index = 0; index < source.length; index++) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }
  return variants[hash % variants.length];
}

export function getStreakCopy(streak: number): string {
  if (streak === 0) return "Start your streak today! 🌟";
  if (streak === 1) return "Day 1! Every streak starts here. 🎉";
  if (streak === 2) return "2 days! You're getting started! 🌱";
  if (streak <= 6) return `${streak} day streak! Keep it up! 💪`;
  if (streak <= 13) return `${streak} day streak! You're building something real! 🔥`;
  if (streak <= 29) return `${streak} day streak! You're on fire! 🔥🔥`;
  if (streak <= 59) return `${streak} day streak! You're unstoppable! 🚀`;
  if (streak <= 99) return `${streak} day streak! Legendary! 🏆`;
  return `${streak} day streak! You're a Winning Streak champion! 👑`;
}

export function getPostWinCopy(moment: PostWinMoment): CopyMessage {
  if (moment.type === "first-win") return COPY_CATALOG.firstWin as CopyMessage;
  if (moment.type === "comeback") return COPY_CATALOG.comeback as CopyMessage;
  if (moment.type === "post-save") return COPY_CATALOG.postSave as CopyMessage;

  if (moment.milestone === 7) return COPY_CATALOG.milestone7 as CopyMessage;
  if (moment.milestone === 30) return COPY_CATALOG.milestone30 as CopyMessage;
  return COPY_CATALOG.milestone100 as CopyMessage;
}

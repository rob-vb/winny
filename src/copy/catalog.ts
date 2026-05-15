import type { PostWinMoment } from "@/src/utils/postWinMoment";

const POST_SAVE_BODIES = [
  "One more piece of proof that you're moving.",
  "That's a W. No takebacks.",
  "Future you is already thanking you.",
  "Another brick. Your wall of wins is real.",
  "Logged. Can't unhappen.",
  "Small wins build big things. This is proof.",
  "Your brain just asked for more of this. Feed it.",
  "You showed up. That's the whole game.",
  "Stack enough of these and watch what happens.",
  "The streak is alive. So are you.",
  "One win closer to who you're becoming.",
  "That counts. Every single time.",
];

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
    "Add a goal you want to remember.",
    "Keep a goal visible until it is done.",
    "Set a goal when you're ready.",
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
  return `${streak} day streak! You're a Winny champion! 👑`;
}

export function getPostWinCopy(moment: PostWinMoment, name?: string): CopyMessage {
  const n = name?.trim() || "";

  if (moment.type === "first-win") {
    const base = COPY_CATALOG.firstWin as CopyMessage;
    return n
      ? { title: base.title, body: `That's the whole move, ${n}. Notice one win, then come back tomorrow.` }
      : base;
  }
  if (moment.type === "comeback") {
    const base = COPY_CATALOG.comeback as CopyMessage;
    return n
      ? { title: base.title, body: `Today counts, ${n}. Start from this win and keep going.` }
      : base;
  }
  if (moment.type === "post-save") {
    const { title } = COPY_CATALOG.postSave as CopyMessage;
    return {
      title: n ? `Win added, ${n}!` : title,
      body: POST_SAVE_BODIES[Math.floor(Math.random() * POST_SAVE_BODIES.length)],
    };
  }

  if (moment.milestone === 7) {
    const base = COPY_CATALOG.milestone7 as CopyMessage;
    return n
      ? { title: base.title, body: `A full week of noticing what is working, ${n}. Keep building.` }
      : base;
  }
  if (moment.milestone === 30) {
    const base = COPY_CATALOG.milestone30 as CopyMessage;
    return n
      ? { title: base.title, body: `That's a real rhythm, ${n}. Your wins are starting to stack.` }
      : base;
  }
  const base = COPY_CATALOG.milestone100 as CopyMessage;
  return n
    ? { title: base.title, body: `${n}, you have built something rare. One win at a time.` }
    : base;
}

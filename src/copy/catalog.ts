import i18n from "i18next";
import type { PostWinMoment } from "@/src/utils/postWinMoment";

export interface CopyMessage {
  title: string;
  body: string;
}

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

export function getNotificationPrompts(): readonly string[] {
  const prompts = i18n.t("notifications.prompts", {
    returnObjects: true,
  }) as unknown;
  return Array.isArray(prompts) ? (prompts as string[]) : [];
}

export function getNotificationTitle(): string {
  return i18n.t("notifications.title");
}

export function getStreakCopy(streak: number): string {
  const key = streakLabelKey(streak);
  return i18n.t(key, { count: streak });
}

function streakLabelKey(streak: number): string {
  if (streak === 0) return "streak.label.zero";
  if (streak === 1) return "streak.label.one";
  if (streak === 2) return "streak.label.two";
  if (streak <= 6) return "streak.label.small";
  if (streak <= 13) return "streak.label.growing";
  if (streak <= 29) return "streak.label.fire";
  if (streak <= 59) return "streak.label.rocket";
  if (streak <= 99) return "streak.label.legendary";
  return "streak.label.champion";
}

export function getPostWinCopy(moment: PostWinMoment, name?: string): CopyMessage {
  const trimmed = name?.trim() || "";
  const hasName = trimmed.length > 0;

  if (moment.type === "post-save") {
    const bodies = i18n.t("postWin.postSave.bodies", {
      returnObjects: true,
    }) as unknown;
    const list = Array.isArray(bodies) ? (bodies as string[]) : [];
    return {
      title: hasName
        ? i18n.t("postWin.postSave.titleNamed", { name: trimmed })
        : i18n.t("postWin.postSave.title"),
      body:
        list.length > 0
          ? pickCopyVariant(list, `${moment.type}:${trimmed}`)
          : "",
    };
  }

  const base =
    moment.type === "first-win"
      ? "postWin.firstWin"
      : moment.type === "comeback"
      ? "postWin.comeback"
      : moment.milestone === 7
      ? "postWin.milestone7"
      : moment.milestone === 30
      ? "postWin.milestone30"
      : "postWin.milestone100";

  return {
    title: i18n.t(`${base}.title`),
    body: hasName
      ? i18n.t(`${base}.bodyNamed`, { name: trimmed })
      : i18n.t(`${base}.body`),
  };
}

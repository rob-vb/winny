import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
  insertWin,
  getWins,
  getDistinctDateKeys,
  deleteWin,
} from "@/src/db/repositories/wins";
import { getSetting, setSetting } from "@/src/db/repositories/settings";
import {
  requestPermission,
  scheduleNext30Days,
} from "@/src/notifications/notificationService";
import { computeStreak, toDateKey } from "@/src/utils/dateUtils";
import type { PostWinMoment } from "@/src/utils/postWinMoment";
import { getPostWinMoment } from "@/src/utils/postWinMoment";
import type { Win } from "@/src/db/schema";
import {
  parseStoredPref,
  resolveLocale,
  type LocaleCode,
  type LocalePref,
} from "@/src/i18n/languages";
import { i18n } from "@/src/i18n";

export interface AddWinResult {
  moment: PostWinMoment;
  previousTotalWins: number;
  previousLatestDateKey: string | null;
  nextStreak: number;
  todayDateKey: string;
}

interface WinsState {
  wins: Win[];
  todayWins: Win[];
  streak: number;
  totalWins: number;
  displayName: string;
  isHydrated: boolean;
  localePref: LocalePref;
  resolvedLocale: LocaleCode;
}

interface WinsActions {
  hydrate: () => Promise<void>;
  addWin: (text: string) => Promise<AddWinResult>;
  removeWin: (id: string) => Promise<void>;
  setDisplayName: (name: string) => void;
  setLocalePref: (pref: LocalePref) => Promise<void>;
}

export const useWinsStore = create<WinsState & WinsActions>()(
  (set) => ({
    wins: [],
    todayWins: [],
    streak: 0,
    totalWins: 0,
    displayName: "",
    isHydrated: false,
    localePref: "auto",
    resolvedLocale: "en",

    hydrate: async () => {
      const wins = await getWins();
      const dateKeys = await getDistinctDateKeys();
      const today = toDateKey();
      const displayName = (await getSetting("display_name")) ?? "";
      const localePref = parseStoredPref(await getSetting("locale"));
      const resolvedLocale = resolveLocale(localePref);
      set({
        wins,
        todayWins: wins.filter((w) => w.date_key === today),
        streak: computeStreak(dateKeys),
        totalWins: wins.length,
        displayName,
        isHydrated: true,
        localePref,
        resolvedLocale,
      });
    },

    setDisplayName: (name: string) => set({ displayName: name }),

    setLocalePref: async (pref: LocalePref) => {
      await setSetting("locale", pref);
      const resolved = resolveLocale(pref);
      if (i18n.language !== resolved) {
        await i18n.changeLanguage(resolved);
      }
      set({ localePref: pref, resolvedLocale: resolved });

      const [enabled, status, time] = await Promise.all([
        getSetting("reminder_enabled"),
        getSetting("notification_permission_status"),
        getSetting("reminder_time"),
      ]);
      if (enabled === "true" && status === "granted" && time) {
        await scheduleNext30Days(time);
        await setSetting("lastBakedLocale", resolved);
      }
    },

    addWin: async (text: string) => {
      const previousWins = await getWins();
      const previousTotalWins = previousWins.length;
      const previousLatestDateKey = previousWins[0]?.date_key ?? null;

      // insertWin handles UUID pk, date_key, logged_at internally (Pitfall 5)
      await insertWin(text);
      // Re-query DB as single source of truth (avoids optimistic update divergence)
      const wins = await getWins();
      const dateKeys = await getDistinctDateKeys();
      const today = toDateKey();
      const nextStreak = computeStreak(dateKeys);
      const moment = getPostWinMoment({
        previousTotalWins,
        nextStreak,
        previousLatestDateKey,
        todayDateKey: today,
      });

      set({
        wins,
        todayWins: wins.filter((w) => w.date_key === today),
        streak: nextStreak,
        totalWins: wins.length,
      });

      const permStatus = await getSetting("notification_permission_status");
      if (permStatus === null || permStatus === "undetermined") {
        const result = await requestPermission();
        await setSetting("notification_permission_status", result);
        if (result === "granted") {
          await setSetting("reminder_enabled", "true");
          await setSetting("reminder_time", "20:00");
          await scheduleNext30Days("20:00");
        }
      }

      return {
        moment,
        previousTotalWins,
        previousLatestDateKey,
        nextStreak,
        todayDateKey: today,
      };
    },

    removeWin: async (id: string) => {
      await deleteWin(id);
      const wins = await getWins();
      const dateKeys = await getDistinctDateKeys();
      const today = toDateKey();
      set({
        wins,
        todayWins: wins.filter((w) => w.date_key === today),
        streak: computeStreak(dateKeys),
        totalWins: wins.length,
      });
    },
  })
);

// Individual selector hooks — one value per hook prevents unnecessary re-renders
export const useTodayWins = () => useWinsStore((s) => s.todayWins);
export const useStreak = () => useWinsStore((s) => s.streak);
export const useTotalWins = () => useWinsStore((s) => s.totalWins);
export const useDisplayName = () => useWinsStore((s) => s.displayName);
export const useIsHydrated = () => useWinsStore((s) => s.isHydrated);
export const useAddWin = () => useWinsStore((s) => s.addWin);
export const useRemoveWin = () => useWinsStore((s) => s.removeWin);
export const useLocalePref = () => useWinsStore((s) => s.localePref);
export const useResolvedLocale = () => useWinsStore((s) => s.resolvedLocale);
export const useSetLocalePref = () => useWinsStore((s) => s.setLocalePref);

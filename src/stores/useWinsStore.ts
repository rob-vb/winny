import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
  insertWin,
  getWins,
  getDistinctDateKeys,
} from "@/src/db/repositories/wins";
import { computeStreak, toDateKey } from "@/src/utils/dateUtils";
import type { Win } from "@/src/db/schema";

interface WinsState {
  wins: Win[];
  todayWins: Win[];
  streak: number;
  totalWins: number;
  isHydrated: boolean;
}

interface WinsActions {
  hydrate: () => Promise<void>;
  addWin: (text: string) => Promise<void>;
}

export const useWinsStore = create<WinsState & WinsActions>()(
  (set) => ({
    wins: [],
    todayWins: [],
    streak: 0,
    totalWins: 0,
    isHydrated: false,

    hydrate: async () => {
      const wins = await getWins();
      const dateKeys = await getDistinctDateKeys();
      const today = toDateKey();
      set({
        wins,
        todayWins: wins.filter((w) => w.date_key === today),
        streak: computeStreak(dateKeys),
        totalWins: wins.length,
        isHydrated: true,
      });
    },

    addWin: async (text: string) => {
      // insertWin handles UUID pk, date_key, logged_at internally (Pitfall 5)
      await insertWin(text);
      // Re-query DB as single source of truth (avoids optimistic update divergence)
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
export const useIsHydrated = () => useWinsStore((s) => s.isHydrated);
export const useAddWin = () => useWinsStore((s) => s.addWin);

import { formatDateKey } from "@/src/utils/dateUtils";
import type { Win } from "@/src/db/schema";

// Date constants — pin to 2026-05-11 (project reference date)
const TODAY_KEY = "2026-05-11";
const YESTERDAY_KEY = "2026-05-10";
const SAME_YEAR_KEY = "2026-05-09"; // Sat, May 9
const PRIOR_YEAR_KEY = "2025-12-01"; // Dec 1, 2025

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-05-11T12:00:00"));
});

afterEach(() => {
  jest.useRealTimers();
});

// --- formatDateKey ---

describe("formatDateKey (HIST-01)", () => {
  it('returns "Today" for today\'s date_key', () => {
    expect(formatDateKey(TODAY_KEY)).toBe("Today");
  });

  it('returns "Yesterday" for yesterday\'s date_key', () => {
    expect(formatDateKey(YESTERDAY_KEY)).toBe("Yesterday");
  });

  it('returns "EEE, MMM d" format for same-year non-recent date', () => {
    expect(formatDateKey(SAME_YEAR_KEY)).toBe("Sat, May 9");
  });

  it('returns "MMM d, yyyy" format for prior-year date', () => {
    expect(formatDateKey(PRIOR_YEAR_KEY)).toBe("Dec 1, 2025");
  });
});

// --- winCountLabel ---
// Pure function defined locally — same implementation that will be inlined in DateSectionHeader.tsx
const winCountLabel = (count: number): string =>
  count === 1 ? "1 win" : `${count} wins`;

describe("winCountLabel (HIST-02)", () => {
  it('returns "1 win" for count 1 (singular)', () => {
    expect(winCountLabel(1)).toBe("1 win");
  });

  it('returns "0 wins" for count 0', () => {
    expect(winCountLabel(0)).toBe("0 wins");
  });

  it('returns "3 wins" for count 3', () => {
    expect(winCountLabel(3)).toBe("3 wins");
  });

  it('returns "10 wins" for count 10', () => {
    expect(winCountLabel(10)).toBe("10 wins");
  });
});

// --- groupWinsByDate ---
// Pure function defined locally — same implementation that will appear in wins.tsx (useMemo)
interface WinSection {
  date_key: string;
  data: Win[];
}

function groupWinsByDate(wins: Win[]): WinSection[] {
  // wins[] from store is already date_key DESC (getWins uses orderBy desc)
  const map = new Map<string, Win[]>();
  for (const win of wins) {
    const existing = map.get(win.date_key);
    if (existing) existing.push(win);
    else map.set(win.date_key, [win]);
  }
  return Array.from(map.entries()).map(([date_key, data]) => ({
    date_key,
    data: data.sort(
      (a, b) =>
        new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
    ),
  }));
  // Section order is preserved from `wins` which is `date_key DESC` — newest section first
}

// Helper to build a minimal Win for tests
function makeWin(
  id: string,
  text: string,
  date_key: string,
  logged_at: string
): Win {
  return {
    id,
    text,
    date_key,
    logged_at,
    created_at: logged_at,
    synced_at: null,
    remote_id: null,
    category: null,
  };
}

describe("groupWinsByDate (HIST-01)", () => {
  it("returns empty array for empty wins input", () => {
    expect(groupWinsByDate([])).toEqual([]);
  });

  it("groups wins by date_key, newest section first (D-11)", () => {
    const wins: Win[] = [
      makeWin("1", "win A", TODAY_KEY, "2026-05-11T09:00:00.000Z"),
      makeWin("2", "win B", YESTERDAY_KEY, "2026-05-10T09:00:00.000Z"),
    ];
    const sections = groupWinsByDate(wins);
    expect(sections).toHaveLength(2);
    // Newest section first
    expect(sections[0].date_key).toBe(TODAY_KEY);
    expect(sections[1].date_key).toBe(YESTERDAY_KEY);
  });

  it("sorts wins within each group by logged_at DESC (D-11)", () => {
    const wins: Win[] = [
      makeWin("1", "first logged", TODAY_KEY, "2026-05-11T08:00:00.000Z"),
      makeWin("2", "second logged", TODAY_KEY, "2026-05-11T10:00:00.000Z"),
    ];
    const sections = groupWinsByDate(wins);
    expect(sections).toHaveLength(1);
    // Later logged_at appears first
    expect(sections[0].data[0].id).toBe("2");
    expect(sections[0].data[1].id).toBe("1");
  });

  it("handles single date with one win", () => {
    const wins: Win[] = [
      makeWin("1", "only win", TODAY_KEY, "2026-05-11T09:00:00.000Z"),
    ];
    const sections = groupWinsByDate(wins);
    expect(sections).toHaveLength(1);
    expect(sections[0].date_key).toBe(TODAY_KEY);
    expect(sections[0].data).toHaveLength(1);
  });
});

import { computeStreak } from "@/src/utils/dateUtils";

// Pin "today" to a fixed date so tests are deterministic across days (STREAK-02).
// "2026-05-10" is the reference date used throughout this file.
const TODAY = "2026-05-10";
const YESTERDAY = "2026-05-09";
const TWO_DAYS_AGO = "2026-05-08";
const THREE_DAYS_AGO = "2026-05-07";
const OLD_DATE = "2026-01-01";

beforeEach(() => {
  // Freeze Date.now() so computeStreak's internal toDateKey() returns TODAY
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-05-10T12:00:00"));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("computeStreak (STREAK-02)", () => {
  it("returns 0 for empty array", () => {
    expect(computeStreak([])).toBe(0);
  });

  it("returns 0 when most recent date is older than yesterday", () => {
    expect(computeStreak([OLD_DATE])).toBe(0);
  });

  it("returns 0 when most recent date is two days ago (missed a day)", () => {
    expect(computeStreak([TWO_DAYS_AGO, THREE_DAYS_AGO])).toBe(0);
  });

  it("returns 1 when only yesterday is present", () => {
    expect(computeStreak([YESTERDAY])).toBe(1);
  });

  it("returns 1 when only today is present", () => {
    expect(computeStreak([TODAY])).toBe(1);
  });

  it("returns 2 for today + yesterday", () => {
    expect(computeStreak([TODAY, YESTERDAY])).toBe(2);
  });

  it("returns 3 for three consecutive days ending today", () => {
    expect(computeStreak([TODAY, YESTERDAY, TWO_DAYS_AGO])).toBe(3);
  });

  it("returns 3 for three consecutive days ending yesterday", () => {
    expect(computeStreak([YESTERDAY, TWO_DAYS_AGO, THREE_DAYS_AGO])).toBe(3);
  });

  it("stops at gap: [today, yesterday, three-days-ago] skips two-days-ago → streak = 2", () => {
    expect(computeStreak([TODAY, YESTERDAY, THREE_DAYS_AGO])).toBe(2);
  });
});

import {
  getPostWinMoment,
  getStreakMilestone,
  isComebackWin,
} from "@/src/utils/postWinMoment";

describe("getStreakMilestone", () => {
  it.each([
    [7, 7],
    [30, 30],
    [100, 100],
  ] as const)("returns %s for exact milestone", (streak, milestone) => {
    expect(getStreakMilestone(streak)).toBe(milestone);
  });

  it.each([6, 8, 29, 31, 99, 101])(
    "returns null for non-threshold %s",
    (streak) => {
      expect(getStreakMilestone(streak)).toBeNull();
    }
  );
});

describe("isComebackWin", () => {
  it("returns false without prior wins", () => {
    expect(isComebackWin(null, "2026-05-13")).toBe(false);
  });

  it("returns false when prior latest date is yesterday", () => {
    expect(isComebackWin("2026-05-12", "2026-05-13")).toBe(false);
  });

  it("returns true when prior latest date is more than one day before today", () => {
    expect(isComebackWin("2026-05-11", "2026-05-13")).toBe(true);
  });
});

describe("getPostWinMoment", () => {
  it("returns first win for the first saved win ever", () => {
    expect(
      getPostWinMoment({
        previousTotalWins: 0,
        nextStreak: 1,
        previousLatestDateKey: null,
        todayDateKey: "2026-05-13",
      })
    ).toEqual({ type: "first-win" });
  });

  it("gives milestone priority over comeback", () => {
    expect(
      getPostWinMoment({
        previousTotalWins: 10,
        nextStreak: 7,
        previousLatestDateKey: "2026-05-01",
        todayDateKey: "2026-05-13",
      })
    ).toEqual({ type: "milestone", milestone: 7 });
  });

  it("returns comeback when prior wins exist and date gap is greater than one day", () => {
    expect(
      getPostWinMoment({
        previousTotalWins: 10,
        nextStreak: 2,
        previousLatestDateKey: "2026-05-11",
        todayDateKey: "2026-05-13",
      })
    ).toEqual({ type: "comeback" });
  });

  it("returns post-save for normal saves", () => {
    expect(
      getPostWinMoment({
        previousTotalWins: 10,
        nextStreak: 3,
        previousLatestDateKey: "2026-05-12",
        todayDateKey: "2026-05-13",
      })
    ).toEqual({ type: "post-save" });
  });
});

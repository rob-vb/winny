import { streakLabel } from "@/src/utils/streakLabel";

describe("streakLabel", () => {
  it("returns non-empty string for all tiers", () => {
    [0, 1, 2, 3, 6, 7, 13, 14, 29, 30, 59, 60, 99, 100, 200].forEach((n) => {
      expect(streakLabel(n)).toBeTruthy();
    });
  });

  it("streak=0: does not contain guilt or shame language (STREAK-04)", () => {
    expect(streakLabel(0)).not.toMatch(/miss|fail|broke|punish|shame|sorry|oops/i);
  });

  it("streak=0: contains welcoming copy and 🌟", () => {
    expect(streakLabel(0)).toContain("Start");
    expect(streakLabel(0)).toContain("🌟");
  });

  it("streak=1: contains 'Day 1' and 🎉", () => {
    expect(streakLabel(1)).toContain("Day 1");
    expect(streakLabel(1)).toContain("🎉");
  });

  it("streak=2: contains '2 days'", () => {
    expect(streakLabel(2)).toContain("2 days");
  });

  it("streak=7: contains '7 day streak'", () => {
    expect(streakLabel(7)).toContain("7 day streak");
  });

  it("streak=14: contains '14 day streak'", () => {
    expect(streakLabel(14)).toContain("14 day streak");
  });

  it("streak=30: contains '30 day streak'", () => {
    expect(streakLabel(30)).toContain("30 day streak");
  });

  it("streak=60: contains '60 day streak'", () => {
    expect(streakLabel(60)).toContain("60 day streak");
  });

  it("streak=100: contains '100 day streak'", () => {
    expect(streakLabel(100)).toContain("100 day streak");
  });
});

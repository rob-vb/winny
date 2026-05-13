import {
  COPY_CATALOG,
  getPostWinCopy,
  getStreakCopy,
  notificationPrompts,
  pickCopyVariant,
} from "@/src/copy/catalog";

const BANNED_COPY_PATTERN =
  /missed|forgot|failed|failure|broke|broken|lost|punish|shame|guilt|sorry|oops|should have|don't break/i;

function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

describe("copy catalog", () => {
  it("contains all required emotional state keys", () => {
    expect(COPY_CATALOG).toHaveProperty("firstWin");
    expect(COPY_CATALOG).toHaveProperty("milestone7");
    expect(COPY_CATALOG).toHaveProperty("milestone30");
    expect(COPY_CATALOG).toHaveProperty("milestone100");
    expect(COPY_CATALOG).toHaveProperty("comeback");
    expect(COPY_CATALOG).toHaveProperty("postSave");
    expect(COPY_CATALOG).toHaveProperty("longStreak");
    expect(COPY_CATALOG).toHaveProperty("homeEmpty");
    expect(COPY_CATALOG).toHaveProperty("historyEmpty");
    expect(COPY_CATALOG).toHaveProperty("dreamGoalEmpty");
    expect(COPY_CATALOG).toHaveProperty("notificationDisabled");
    expect(COPY_CATALOG).toHaveProperty("saveError");
    expect(COPY_CATALOG).toHaveProperty("loadError");
    expect(COPY_CATALOG).toHaveProperty("notificationPrompt");
  });

  it("contains no guilt or shame language", () => {
    for (const copy of collectStrings(COPY_CATALOG)) {
      expect(copy).not.toMatch(BANNED_COPY_PATTERN);
    }
  });

  it("selects variants deterministically for the same seed", () => {
    expect(pickCopyVariant(["A", "B", "C"], "2026-05-13")).toBe(
      pickCopyVariant(["A", "B", "C"], "2026-05-13")
    );
  });

  it("distributes variants across date-key seeds", () => {
    const values = new Set(
      Array.from({ length: 30 }, (_, index) =>
        pickCopyVariant(
          ["A", "B", "C"],
          `2026-05-${String(index + 1).padStart(2, "0")}`
        )
      )
    );
    expect(values.size).toBeGreaterThanOrEqual(2);
  });

  it("returns expected streak tier strings", () => {
    expect(getStreakCopy(0)).toContain("Start");
    expect(getStreakCopy(1)).toContain("Day 1");
    expect(getStreakCopy(7)).toContain("7 day streak");
    expect(getStreakCopy(30)).toContain("30 day streak");
    expect(getStreakCopy(100)).toContain("100 day streak");
  });

  it("contains at least five notification prompt variants", () => {
    expect(notificationPrompts.length).toBeGreaterThanOrEqual(5);
    for (const prompt of notificationPrompts) {
      expect(prompt).toBeTruthy();
    }
  });

  it("returns locked post-win copy", () => {
    expect(getPostWinCopy({ type: "first-win" })).toMatchObject({
      title: "First win logged",
    });
    expect(getPostWinCopy({ type: "milestone", milestone: 7 })).toMatchObject({
      title: "7 days of wins",
    });
  });
});

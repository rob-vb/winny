import { selectDailyPrompts } from "@/src/utils/promptUtils";

describe("selectDailyPrompts", () => {
  const DATE_A = "2026-05-09";
  const DATE_B = "2026-05-10";

  it("always returns exactly 3 prompts", () => {
    expect(selectDailyPrompts(DATE_A)).toHaveLength(3);
  });

  it("is deterministic: same dateKey → same 3 prompts", () => {
    expect(selectDailyPrompts(DATE_A)).toEqual(selectDailyPrompts(DATE_A));
  });

  it("rotates: different dateKey → different prompts", () => {
    expect(selectDailyPrompts(DATE_A)).not.toEqual(selectDailyPrompts(DATE_B));
  });

  it("returns no duplicate prompts within the 3 selected", () => {
    const prompts = selectDailyPrompts(DATE_A);
    expect(new Set(prompts).size).toBe(3);
  });

  it("each prompt is a non-empty string", () => {
    selectDailyPrompts(DATE_A).forEach((p) => {
      expect(typeof p).toBe("string");
      expect(p.length).toBeGreaterThan(0);
    });
  });
});

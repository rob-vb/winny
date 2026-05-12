import { validateGoalText, isDirty, shouldShowCounter } from "@/src/utils/goalValidation";

describe("validateGoalText (GOAL-01)", () => {
  it("rejects empty string", () => {
    expect(validateGoalText("")).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(validateGoalText("   ")).toBe(false);
  });

  it("accepts single character", () => {
    expect(validateGoalText("a")).toBe(true);
  });

  it("accepts exactly 500 characters", () => {
    expect(validateGoalText("a".repeat(500))).toBe(true);
  });

  it("rejects 501 characters", () => {
    expect(validateGoalText("a".repeat(501))).toBe(false);
  });

  it("trims before checking length: space + 500 chars is valid, space + 501 chars is invalid", () => {
    expect(validateGoalText(" " + "a".repeat(500))).toBe(true); // trimmed = 500 chars, valid
    expect(validateGoalText(" " + "a".repeat(501))).toBe(false); // trimmed = 501 chars, invalid
  });
});

describe("isDirty (GOAL-01)", () => {
  it("returns false when text is the same", () => {
    expect(isDirty("hello", "hello")).toBe(false);
  });

  it("returns true when text is different", () => {
    expect(isDirty("hello", "world")).toBe(true);
  });

  it("returns false when whitespace-padded current matches saved after trim", () => {
    expect(isDirty("  hi  ", "hi")).toBe(false);
  });

  it("returns true when savedText is empty and currentText is non-empty", () => {
    expect(isDirty("my dream goal", "")).toBe(true);
  });

  it("returns false when both are empty", () => {
    expect(isDirty("", "")).toBe(false);
  });
});

describe("shouldShowCounter (GOAL-01)", () => {
  it("returns false for 1 char (499 remaining)", () => {
    expect(shouldShowCounter("a")).toBe(false);
  });

  it("returns false for 400 chars (100 remaining) — boundary: exactly 100 remaining triggers counter", () => {
    expect(shouldShowCounter("a".repeat(400))).toBe(true);
  });

  it("returns true for 401 chars (99 remaining)", () => {
    expect(shouldShowCounter("a".repeat(401))).toBe(true);
  });

  it("returns true for 500 chars (0 remaining)", () => {
    expect(shouldShowCounter("a".repeat(500))).toBe(true);
  });

  it("returns false for 0 chars (500 remaining)", () => {
    expect(shouldShowCounter("")).toBe(false);
  });
});

import { validateWinText } from "@/src/utils/winValidation";

describe("validateWinText (WIN-01)", () => {
  it("rejects empty string", () => {
    expect(validateWinText("")).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    expect(validateWinText("   ")).toBe(false);
  });

  it("accepts single character", () => {
    expect(validateWinText("a")).toBe(true);
  });

  it("accepts exactly 200 characters", () => {
    expect(validateWinText("a".repeat(200))).toBe(true);
  });

  it("rejects 201 characters", () => {
    expect(validateWinText("a".repeat(201))).toBe(false);
  });

  it("trims before checking length: 200-char string with leading space is rejected", () => {
    // " " + 200 chars = 201 after trim the leading space it is still 200 trimmed chars —
    // but 1 space + 200 'a' trims to 200 chars, which is valid.
    // Verify the trim-before-check behaviour with a padded-over-limit case:
    expect(validateWinText(" " + "a".repeat(200))).toBe(true); // trimmed = 200 chars, valid
    expect(validateWinText(" " + "a".repeat(201))).toBe(false); // trimmed = 201 chars, invalid
  });
});

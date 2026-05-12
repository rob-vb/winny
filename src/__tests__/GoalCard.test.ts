/**
 * TDD RED: Verify GoalCard.tsx exists with required content.
 * These tests check the component file contract for GoalCard.
 * Fails until GoalCard.tsx is created.
 *
 * Note: React Native components cannot be imported in the node test
 * environment without a full RN mock setup. These tests verify the
 * file-level contract (existence, required patterns) via fs.
 */
import * as fs from "fs";
import * as path from "path";

const GOAL_CARD_PATH = path.resolve(__dirname, "../../src/components/GoalCard.tsx");

describe("GoalCard component contract", () => {
  it("GoalCard.tsx file exists", () => {
    expect(fs.existsSync(GOAL_CARD_PATH)).toBe(true);
  });

  it("exports a GoalCard function", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain("export function GoalCard");
  });

  it("contains motivational copy (GOAL-02)", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain("You're building your dream one win at a time.");
  });

  it("uses Display size hero text (28px bold)", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain("font-nunito-bold text-[28px]");
  });

  it("uses Animated.View from react-native-reanimated", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain("react-native-reanimated");
    expect(content).toContain("Animated.View");
  });

  it("passes style prop through to Animated.View (for opacity crossfade)", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toMatch(/style=\{style\}/);
  });

  it("does NOT contain StyleSheet or ZoomIn", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).not.toContain("StyleSheet");
    expect(content).not.toContain("ZoomIn");
  });
});

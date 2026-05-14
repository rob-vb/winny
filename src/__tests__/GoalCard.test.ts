/**
 * File-contract tests for GoalCard.tsx.
 * Phase 6 redesigned GoalCard from a hero display card to a checklist
 * list-item card. These tests verify the NEW interface contract.
 *
 * Note: React Native components cannot be imported in the node test
 * environment without a full RN mock setup. These tests verify the
 * file-level contract (existence, required patterns) via fs.
 */
import * as fs from "fs";
import * as path from "path";

const GOAL_CARD_PATH = path.resolve(__dirname, "../../src/components/GoalCard.tsx");

describe("GoalCard component contract", () => {
  // --- Passing tests kept from before Phase 6 ---

  it("GoalCard.tsx file exists", () => {
    expect(fs.existsSync(GOAL_CARD_PATH)).toBe(true);
  });

  it("exports a GoalCard function", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain("export function GoalCard");
  });

  it("does NOT contain StyleSheet, ZoomIn, or react-native-reanimated", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).not.toContain("StyleSheet");
    expect(content).not.toContain("ZoomIn");
    expect(content).not.toContain("react-native-reanimated");
  });

  // --- New tests for Phase 6 list-item interface ---

  it("imports Ionicons from @expo/vector-icons", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain('@expo/vector-icons');
    expect(content).toContain('Ionicons');
  });

  it("has onToggle and onDelete in props interface", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain("onToggle");
    expect(content).toContain("onDelete");
  });

  it("toggle Pressable uses accessibilityRole checkbox", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain('accessibilityRole="checkbox"');
  });

  it("delete Pressable uses accessibilityRole button", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain('accessibilityRole="button"');
  });

  it("shows Alert.alert confirmation before deleting", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).toContain("Alert.alert");
  });

  it("does NOT contain Animated.View (plain View, no animation)", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).not.toContain("Animated.View");
  });

  it("does NOT contain motivational hero copy from old design", () => {
    const content = fs.readFileSync(GOAL_CARD_PATH, "utf8");
    expect(content).not.toContain("building your dream");
  });
});

/**
 * TDD RED: Verify GoalEditor.tsx exists with required content.
 * These tests check the component file contract for GoalEditor.
 * Fails until GoalEditor.tsx is created.
 *
 * Note: React Native components cannot be imported in the node test
 * environment without a full RN mock setup. These tests verify the
 * file-level contract (existence, required patterns) via fs.
 */
import * as fs from "fs";
import * as path from "path";

const GOAL_EDITOR_PATH = path.resolve(__dirname, "../../src/components/GoalEditor.tsx");

describe("GoalEditor component contract", () => {
  it("GoalEditor.tsx file exists", () => {
    expect(fs.existsSync(GOAL_EDITOR_PATH)).toBe(true);
  });

  it("exports a GoalEditor function", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toContain("export function GoalEditor");
  });

  it("has maxLength={500} and multiline={true}", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toContain("maxLength={500}");
    expect(content).toContain("multiline={true}");
  });

  it("has minHeight: 120 as style prop (not className)", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toContain("minHeight: 120");
  });

  it("contains canSave logic combining isDirty + trim check + !isSaving", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toContain("canSave");
    expect(content).toContain("isDirty");
    expect(content).toContain("isSaving");
    expect(content).toContain(".trim()");
  });

  it("contains showCounter conditional logic", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toContain("showCounter");
  });

  it("contains showCancel prop controlling Cancel button render", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toContain("showCancel");
    expect(content).toContain("Cancel");
  });

  it("uses i18n key for TextInput aria label", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toMatch(/accessibilityLabel=\{t\(["']goalEditor\.inputAria["']\)\}/);
  });

  it("uses i18n key for Save Pressable aria label", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toMatch(/accessibilityLabel=\{t\(["']goalEditor\.saveAria["']\)\}/);
  });

  it("passes style prop through to Animated.View root (for opacity crossfade)", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).toMatch(/style=\{style\}/);
  });

  it("does NOT contain StyleSheet", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    expect(content).not.toContain("StyleSheet");
  });

  it("uses Animated.View from react-native (built-in Animated API)", () => {
    const content = fs.readFileSync(GOAL_EDITOR_PATH, "utf8");
    // GoalEditor uses React Native's own Animated module, not reanimated
    expect(content).toContain("Animated.View");
    expect(content).not.toContain("react-native-reanimated");
  });
});

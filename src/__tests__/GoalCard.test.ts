/**
 * TDD RED: Verify GoalCard module exports a GoalCard component.
 * These tests check the module contract (exports) for GoalCard.
 * They fail until GoalCard.tsx is created (module not found).
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GoalCard } = require("@/src/components/GoalCard");

describe("GoalCard module contract", () => {
  it("exports GoalCard as a function (React component)", () => {
    expect(typeof GoalCard).toBe("function");
  });
});

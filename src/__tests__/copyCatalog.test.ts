import { initI18n } from "@/src/i18n";
import en from "@/src/i18n/locales/en.json";
import nl from "@/src/i18n/locales/nl.json";
import es from "@/src/i18n/locales/es.json";
import fr from "@/src/i18n/locales/fr.json";
import de from "@/src/i18n/locales/de.json";
import {
  getPostWinCopy,
  getStreakCopy,
  getNotificationPrompts,
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

beforeAll(() => {
  initI18n("en");
});

describe("copy catalog", () => {
  it.each([
    ["en", en],
    ["nl", nl],
    ["es", es],
    ["fr", fr],
    ["de", de],
  ])("contains no guilt or shame language (%s)", (_code, bundle) => {
    for (const copy of collectStrings(bundle)) {
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

  it("returns streak tier strings with the count interpolated", () => {
    // Assert the contract (non-empty + count interpolation), not exact
    // marketing copy — the strings are reworded freely between releases.
    expect(getStreakCopy(0)).toBeTruthy();
    expect(getStreakCopy(1)).toBeTruthy();
    expect(getStreakCopy(7)).toContain("7");
    expect(getStreakCopy(30)).toContain("30");
    expect(getStreakCopy(100)).toContain("100");
  });

  it("contains at least five notification prompt variants", () => {
    const prompts = getNotificationPrompts();
    expect(prompts.length).toBeGreaterThanOrEqual(5);
    for (const prompt of prompts) {
      expect(prompt).toBeTruthy();
    }
  });

  it("returns locked post-win copy", () => {
    expect(getPostWinCopy({ type: "first-win" })).toMatchObject({
      title: "First win, in the books",
    });
    expect(getPostWinCopy({ type: "milestone", milestone: 7 })).toMatchObject({
      title: "A whole week",
    });
  });
});

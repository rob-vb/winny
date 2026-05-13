import {
  completeOnboarding,
  hasCompletedOnboarding,
  subscribeOnboardingCompleted,
} from "@/src/db/repositories/onboarding";
import { getSetting, setSetting } from "@/src/db/repositories/settings";

jest.mock("@/src/db/repositories/settings", () => ({
  getSetting: jest.fn(),
  setSetting: jest.fn(),
}));

const mockedGetSetting = getSetting as jest.MockedFunction<typeof getSetting>;
const mockedSetSetting = setSetting as jest.MockedFunction<typeof setSetting>;

describe("onboarding settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns false when onboarding setting is missing", async () => {
    mockedGetSetting.mockResolvedValue(null);
    await expect(hasCompletedOnboarding()).resolves.toBe(false);
  });

  it("returns false when onboarding setting is false", async () => {
    mockedGetSetting.mockResolvedValue("false");
    await expect(hasCompletedOnboarding()).resolves.toBe(false);
  });

  it("returns true only for exact true string", async () => {
    mockedGetSetting.mockResolvedValue("true");
    await expect(hasCompletedOnboarding()).resolves.toBe(true);
  });

  it("writes onboarding_completed true on completion", async () => {
    await completeOnboarding();
    expect(mockedSetSetting).toHaveBeenCalledWith(
      "onboarding_completed",
      "true"
    );
  });

  it("notifies completion subscribers after setting is written", async () => {
    const listener = jest.fn();
    const unsubscribe = subscribeOnboardingCompleted(listener);

    await completeOnboarding();

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});

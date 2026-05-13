import * as Notifications from "expo-notifications";
import {
  COPY_POOL,
  dateToHHmm,
  formatHHmmFor12h,
  parseHHmmToDate,
  pickPromptForDate,
  requestPermission,
  scheduleNext30Days,
} from "@/src/notifications/notificationService";

jest.mock("expo-notifications", () => ({
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: "date" },
}));

jest.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

const mockedNotifications = Notifications as jest.Mocked<typeof Notifications>;

describe("pickPromptForDate", () => {
  it("returns the same value for the same date key", () => {
    expect(pickPromptForDate("2026-01-01")).toBe(
      pickPromptForDate("2026-01-01")
    );
  });

  it("returns a string from the copy pool", () => {
    expect(COPY_POOL).toContain(pickPromptForDate("2026-01-01"));
  });

  it("distributes across at least two values over 30 dates", () => {
    const values = new Set(
      Array.from({ length: 30 }, (_, index) =>
        pickPromptForDate(`2026-01-${String(index + 1).padStart(2, "0")}`)
      )
    );
    expect(values.size).toBeGreaterThanOrEqual(2);
  });

  it("contains no guilt language", () => {
    for (const copy of COPY_POOL) {
      expect(copy).not.toMatch(/missed|forgot|broke(?:n)?|failed|don't|streak broken/i);
    }
  });
});

describe("time helpers (formatHHmmFor12h, parseHHmmToDate, dateToHHmm)", () => {
  it.each([
    ["20:00", "8:00 PM"],
    ["08:00", "8:00 AM"],
    ["00:00", "12:00 AM"],
    ["12:00", "12:00 PM"],
  ])("formats %s as %s", (input, output) => {
    expect(formatHHmmFor12h(input)).toBe(output);
  });

  it("parses HH:mm to local Date time", () => {
    const date = parseHHmmToDate("20:00");
    expect(date.getHours()).toBe(20);
    expect(date.getMinutes()).toBe(0);
  });

  it("round-trips HH:mm", () => {
    expect(dateToHHmm(parseHHmmToDate("20:00"))).toBe("20:00");
  });
});

describe("scheduleNext30Days", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T08:00:00"));
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("schedules at most 30 notifications", async () => {
    await scheduleNext30Days("20:00");
    expect(mockedNotifications.scheduleNotificationAsync.mock.calls.length).toBeGreaterThan(0);
    expect(mockedNotifications.scheduleNotificationAsync.mock.calls.length).toBeLessThanOrEqual(30);
  });

  it("cancels existing scheduled notifications before scheduling", async () => {
    await scheduleNext30Days("20:00");
    expect(mockedNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    const cancelOrder = mockedNotifications.cancelAllScheduledNotificationsAsync.mock.invocationCallOrder[0];
    const scheduleOrder = mockedNotifications.scheduleNotificationAsync.mock.invocationCallOrder[0];
    expect(cancelOrder).toBeLessThan(scheduleOrder);
  });

  it("skips today's slot when reminder time is in the past", async () => {
    await scheduleNext30Days("00:00");
    expect(mockedNotifications.scheduleNotificationAsync.mock.calls.length).toBe(29);
  });

  it("uses future DATE triggers for every scheduled notification", async () => {
    await scheduleNext30Days("20:00");
    const now = Date.now();
    for (const [request] of mockedNotifications.scheduleNotificationAsync.mock.calls) {
      expect(request.trigger).toMatchObject({
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      });
      expect((request.trigger as { date: Date }).date.getTime()).toBeGreaterThan(now);
    }
  });
});

describe("permission guard logic", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not prompt when permission is already granted", async () => {
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: "granted" } as never);
    await requestPermission();
    expect(mockedNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it("prompts when permission has not been decided", async () => {
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: "undetermined" } as never);
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({ status: "granted" } as never);
    await expect(requestPermission()).resolves.toBe("granted");
    expect(mockedNotifications.requestPermissionsAsync).toHaveBeenCalled();
  });
});

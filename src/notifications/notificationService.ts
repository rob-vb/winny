import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { notificationPrompts, pickCopyVariant } from "@/src/copy/catalog";
import { toDateKey } from "@/src/utils/dateUtils";

const CHANNEL_ID = "daily-reminder";
const NOTIFICATION_TITLE = "Just Keep Winning";

export const COPY_POOL = notificationPrompts;

export function initNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export function pickPromptForDate(dateKey: string): string {
  return pickCopyVariant(COPY_POOL, dateKey);
}

export function parseHHmmToDate(hhMm: string): Date {
  const [hours, minutes] = hhMm.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function dateToHHmm(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

export function formatHHmmFor12h(hhMm: string): string {
  const [hours, minutes] = hhMm.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
}

export async function requestPermission(): Promise<"granted" | "denied"> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Daily Reminder",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: current } = await Notifications.getPermissionsAsync();
  if (current === "granted") return "granted";

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return status === "granted" ? "granted" : "denied";
}

export async function scheduleNext30Days(reminderTimeHHmm: string): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hours, minutes] = reminderTimeHHmm.split(":").map(Number);
  const now = new Date();

  for (let offset = 0; offset < 30; offset++) {
    const target = new Date(now);
    target.setDate(now.getDate() + offset);
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) continue;

    const dateKey = toDateKey(target);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_TITLE,
        body: pickPromptForDate(dateKey),
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: target,
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

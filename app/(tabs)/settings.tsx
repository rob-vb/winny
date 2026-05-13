import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getSetting, setSetting } from "@/src/db/repositories/settings";
import {
  cancelAll,
  formatHHmmFor12h,
  requestPermission,
  scheduleNext30Days,
} from "@/src/notifications/notificationService";
import { SettingsRow } from "@/src/components/settings/SettingsRow";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { TimePickerRow } from "@/src/components/settings/TimePickerRow";

const DEFAULT_REMINDER_TIME = "20:00";

export default function SettingsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [permissionStatus, setPermissionStatus] = useState<
    "undetermined" | "granted" | "denied"
  >("undetermined");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const [enabled, time, status] = await Promise.all([
          getSetting("reminder_enabled"),
          getSetting("reminder_time"),
          getSetting("notification_permission_status"),
        ]);
        if (!isMounted) return;
        setReminderEnabled(enabled !== "false");
        setReminderTime(time ?? DEFAULT_REMINDER_TIME);
        setPermissionStatus(
          status === "granted" || status === "denied" ? status : "undetermined"
        );
      } catch {
        if (isMounted) {
          setLoadError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!confirmation) return;
    const timer = setTimeout(() => setConfirmation(""), 2000);
    return () => clearTimeout(timer);
  }, [confirmation]);

  const handleToggleReminder = async () => {
    if (permissionStatus === "denied") {
      setReminderEnabled(false);
      return;
    }

    const nextEnabled = !reminderEnabled;
    if (!nextEnabled) {
      setReminderEnabled(false);
      await setSetting("reminder_enabled", "false");
      await cancelAll();
      return;
    }

    let status: "undetermined" | "granted" | "denied" = permissionStatus;
    if (status === "undetermined") {
      status = await requestPermission();
      await setSetting("notification_permission_status", status);
      setPermissionStatus(status);
    }

    if (status !== "granted") {
      setReminderEnabled(false);
      return;
    }

    setReminderEnabled(true);
    await setSetting("reminder_enabled", "true");
    await setSetting("reminder_time", reminderTime);
    await scheduleNext30Days(reminderTime);
  };

  const handleTimeSelected = async (hhMm: string) => {
    setReminderTime(hhMm);
    await setSetting("reminder_time", hhMm);
    if (reminderEnabled && permissionStatus === "granted") {
      await scheduleNext30Days(hhMm);
    }
    setConfirmation(`Reminders set for ${formatHHmmFor12h(hhMm)}`);
  };

  if (isLoading) {
    return <SafeAreaView className="flex-1 bg-background" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4" contentContainerClassName="py-6">
        {loadError ? (
          <Text className="font-nunito-regular text-base text-text-secondary">
            Couldn't load settings - please restart the app.
          </Text>
        ) : (
          <>
            <SettingsSection title="Reminders">
              <SettingsRow
                icon="notifications-outline"
                label="Daily Reminder"
                onPress={handleToggleReminder}
                showChevron={false}
                accessibilityLabel="Daily Reminder"
                right={
                  <Switch
                    value={reminderEnabled && permissionStatus !== "denied"}
                    onValueChange={handleToggleReminder}
                    disabled={permissionStatus === "denied"}
                    trackColor={{ false: "#F0EDE8", true: "#F5A623" }}
                    thumbColor="#FFFFFF"
                    accessibilityRole="switch"
                    accessibilityLabel="Daily Reminder"
                    accessibilityState={{
                      checked: reminderEnabled && permissionStatus !== "denied",
                      disabled: permissionStatus === "denied",
                    }}
                  />
                }
              />
              <TimePickerRow
                currentTime={reminderTime}
                onTimeSelected={handleTimeSelected}
                disabled={!reminderEnabled || permissionStatus === "denied"}
                isLast={permissionStatus !== "denied"}
              />
              {permissionStatus === "denied" && (
                <Pressable
                  onPress={() => Linking.openSettings()}
                  className="px-4 py-3"
                  accessibilityRole="button"
                  accessibilityLabel="Notifications disabled - tap to open Settings"
                >
                  <Text className="font-nunito-regular text-sm text-text-secondary">
                    Notifications disabled - tap to open Settings
                  </Text>
                </Pressable>
              )}
            </SettingsSection>
            {confirmation && (
              <View className="-mt-5 mb-4 px-4">
                <Text className="font-nunito-regular text-sm text-text-secondary">
                  {confirmation}
                </Text>
              </View>
            )}

            <SettingsSection title="Profile" />
            <SettingsSection title="About" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

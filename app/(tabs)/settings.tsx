import { useEffect, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Share,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as StoreReview from "expo-store-review";
import * as WebBrowser from "expo-web-browser";
import { getSetting, setSetting } from "@/src/db/repositories/settings";
import {
  useWinsStore,
  useLocalePref,
  useResolvedLocale,
} from "@/src/stores/useWinsStore";
import { nativeNameFor } from "@/src/i18n/languages";
import {
  cancelAll,
  formatHHmmFor12h,
  requestPermission,
  scheduleNext30Days,
} from "@/src/notifications/notificationService";
import { SettingsRow } from "@/src/components/settings/SettingsRow";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { TimePickerRow } from "@/src/components/settings/TimePickerRow";
import { EditableNameRow } from "@/src/components/settings/EditableNameRow";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import {
  APP_STORE_URL,
  PRIVACY_URL,
  SHARE_MESSAGE,
  TERMS_URL,
} from "@/src/constants/links";

const DEFAULT_REMINDER_TIME = "20:00";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const setStoreDisplayName = useWinsStore((s) => s.setDisplayName);
  const localePref = useLocalePref();
  const resolvedLocale = useResolvedLocale();
  const languageValue =
    localePref === "auto"
      ? t("settings.languageAuto", { name: nativeNameFor(resolvedLocale) })
      : nativeNameFor(localePref);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(DEFAULT_REMINDER_TIME);
  const [permissionStatus, setPermissionStatus] = useState<
    "undetermined" | "granted" | "denied"
  >("undetermined");
  const [displayName, setDisplayName] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const [enabled, time, status, name] = await Promise.all([
          getSetting("reminder_enabled"),
          getSetting("reminder_time"),
          getSetting("notification_permission_status"),
          getSetting("display_name"),
        ]);
        if (!isMounted) return;
        setReminderEnabled(enabled !== "false");
        setReminderTime(time ?? DEFAULT_REMINDER_TIME);
        setPermissionStatus(
          status === "granted" || status === "denied" ? status : "undetermined"
        );
        setDisplayName(name ?? "");
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
    setConfirmation(
      t("settings.remindersSetFor", { time: formatHHmmFor12h(hhMm) })
    );
  };

  const handleOpenBrowser = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      // External action failures are non-blocking.
    }
  };

  const handleRateApp = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        await Linking.openURL(APP_STORE_URL);
      }
    } catch {
      // Store review can fail or be throttled; no UI needed.
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `${SHARE_MESSAGE} ${APP_STORE_URL}`,
        title: "Winny",
        url: APP_STORE_URL,
      });
    } catch {
      // Some platforms reject when share is cancelled.
    }
  };

  if (isLoading) {
    return <SafeAreaView className="flex-1 bg-background" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4" contentContainerClassName="py-4">
        {loadError ? (
          <Text className="font-nunito-regular text-base text-text-secondary">
            {t("settings.loadError")}
          </Text>
        ) : (
          <>
            <ScreenHeader
              eyebrow={t("settings.eyebrow")}
              title={t("settings.title")}
              body={t("settings.body")}
            />
            <SettingsSection title={t("settings.sectionReminders")}>
              <SettingsRow
                icon="notifications-outline"
                label={t("settings.dailyReminder")}
                onPress={handleToggleReminder}
                showChevron={false}
                accessibilityLabel={t("settings.dailyReminder")}
                right={
                  <Switch
                    value={reminderEnabled && permissionStatus !== "denied"}
                    onValueChange={handleToggleReminder}
                    disabled={permissionStatus === "denied"}
                    trackColor={{ false: "#D4CFC2", true: "#F1AF2E" }}
                    thumbColor="#FFFDF8"
                    ios_backgroundColor="#D4CFC2"
                    accessibilityRole="switch"
                    accessibilityLabel={t("settings.dailyReminder")}
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
                  accessibilityLabel={t("settings.notifDisabled")}
                >
                  <Text className="font-nunito-regular text-sm text-text-secondary">
                    {t("settings.notifDisabled")}
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

            <SettingsSection title={t("settings.sectionProfile")}>
              <EditableNameRow
                value={displayName}
                onSave={async (name) => {
                  await setSetting("display_name", name);
                  setDisplayName(name);
                  setStoreDisplayName(name);
                }}
                placeholder={t("editableName.placeholder")}
              />
              <SettingsRow
                icon="language-outline"
                label={t("settings.language")}
                value={languageValue}
                onPress={() => router.push("/settings/language" as never)}
                isLast
              />
            </SettingsSection>
            <SettingsSection title={t("settings.sectionAbout")}>
              <SettingsRow
                icon="information-circle-outline"
                label={t("settings.howItWorks")}
                onPress={() => router.push("/settings/how-it-works")}
              />
              <SettingsRow
                icon="lock-closed-outline"
                label={t("settings.privacy")}
                onPress={() => handleOpenBrowser(PRIVACY_URL)}
              />
              <SettingsRow
                icon="document-text-outline"
                label={t("settings.terms")}
                onPress={() => handleOpenBrowser(TERMS_URL)}
              />
              <SettingsRow
                icon="star-outline"
                label={t("settings.rate")}
                onPress={handleRateApp}
              />
              <SettingsRow
                icon="share-outline"
                label={t("settings.share")}
                onPress={handleShareApp}
                isLast
              />
            </SettingsSection>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

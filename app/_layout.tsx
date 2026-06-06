import { useEffect, useState } from "react";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { AppState, type AppStateStatus } from "react-native";
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from "@expo-google-fonts/nunito";
import { useFonts } from "@expo-google-fonts/nunito/useFonts";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import { db } from "@/src/db/client";
import migrations from "@/drizzle/migrations";
import { getSetting, setSetting } from "@/src/db/repositories/settings";
import {
  hasCompletedOnboarding,
  subscribeOnboardingCompleted,
} from "@/src/db/repositories/onboarding";
import {
  initNotificationHandler,
  scheduleNext30Days,
} from "@/src/notifications/notificationService";
import { initI18n } from "@/src/i18n";
import {
  parseStoredPref,
  resolveLocale,
  isSupportedLocale,
} from "@/src/i18n/languages";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  initNotificationHandler();

  const { success: migrationsSuccess, error: migrationsError } =
    useMigrations(db, migrations);
  const segments = useSegments();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [i18nReady, setI18nReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  // Gate splash on migrations + fonts + i18n — prevents FOUT, DB race, and untranslated flash
  const ready =
    ((migrationsSuccess && fontsLoaded && i18nReady) ||
      !!migrationsError ||
      !!fontError);

  useEffect(() => {
    if (!migrationsSuccess) return;
    let cancelled = false;
    (async () => {
      const raw = await getSetting("locale");
      const pref = parseStoredPref(raw);
      const resolved = resolveLocale(pref);
      initI18n(resolved);
      if (!cancelled) setI18nReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [migrationsSuccess]);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    const unsubscribe = subscribeOnboardingCompleted(() => {
      setOnboardingComplete(true);
      setOnboardingChecked(true);
    });

    (async () => {
      const completed = await hasCompletedOnboarding();
      if (!cancelled) {
        setOnboardingComplete(completed);
        setOnboardingChecked(true);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;

    const topUpReminderSchedule = async () => {
      const [enabled, status, time, prefRaw, lastBaked] = await Promise.all([
        getSetting("reminder_enabled"),
        getSetting("notification_permission_status"),
        getSetting("reminder_time"),
        getSetting("locale"),
        getSetting("lastBakedLocale"),
      ]);
      const pref = parseStoredPref(prefRaw);
      const resolved = resolveLocale(pref);
      if (i18n.language !== resolved) {
        await initI18n(resolved).changeLanguage(resolved);
      }
      if (enabled === "true" && status === "granted" && time) {
        const drift = isSupportedLocale(lastBaked) ? lastBaked !== resolved : true;
        if (drift) {
          await scheduleNext30Days(time);
          await setSetting("lastBakedLocale", resolved);
        } else {
          await scheduleNext30Days(time);
        }
      }
    };

    topUpReminderSchedule();

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          topUpReminderSchedule();
        }
      }
    );

    return () => subscription.remove();
  }, [ready]);

  // OTA self-heal: apply the newest published update immediately instead of
  // next-launch. The installed binary boots the cached/embedded bundle first
  // (fallbackToCacheTimeout: 0), so without this a single cold open can show a
  // stale bundle. Check on cold start and on every foreground; reload only when
  // a new update was actually fetched. No-ops in dev / Expo Go.
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let cancelled = false;
    const syncUpdate = async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (cancelled || !check.isAvailable) return;
        const fetched = await Updates.fetchUpdateAsync();
        if (cancelled || !fetched.isNew) return;
        await Updates.reloadAsync();
      } catch {
        // Offline or transient — try again on next foreground.
      }
    };

    syncUpdate();

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") syncUpdate();
      }
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  if (!ready || !onboardingChecked) return null;

  if (migrationsError) {
    console.error("Migration failed:", migrationsError);
  }

  const inOnboarding = segments[0] === "onboarding";
  if (!onboardingComplete && !inOnboarding) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <AppStack />;
}

function AppStack() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding/dream-goal"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings/how-it-works"
        options={{
          title: t("settings.howItWorksTitle"),
          headerBackTitle: t("settings.howItWorksBack"),
        }}
      />
      <Stack.Screen
        name="settings/language"
        options={{
          title: t("settings.languagePickerTitle"),
          headerBackTitle: t("settings.howItWorksBack"),
        }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

import { useEffect, useState } from "react";
import { Redirect, Stack, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
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
import { db } from "@/src/db/client";
import migrations from "@/drizzle/migrations";
import { getSetting } from "@/src/db/repositories/settings";
import {
  hasCompletedOnboarding,
  subscribeOnboardingCompleted,
} from "@/src/db/repositories/onboarding";
import {
  initNotificationHandler,
  scheduleNext30Days,
} from "@/src/notifications/notificationService";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  initNotificationHandler();

  const { success: migrationsSuccess, error: migrationsError } =
    useMigrations(db, migrations);
  const segments = useSegments();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  // Gate splash on BOTH migrations AND fonts — prevents FOUT and DB-not-ready race (RESEARCH Pitfall 5)
  const ready = (migrationsSuccess && fontsLoaded) || !!migrationsError || !!fontError;

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
      const [enabled, status, time] = await Promise.all([
        getSetting("reminder_enabled"),
        getSetting("notification_permission_status"),
        getSetting("reminder_time"),
      ]);
      if (enabled === "true" && status === "granted" && time) {
        await scheduleNext30Days(time);
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

  if (!ready || !onboardingChecked) return null;

  if (migrationsError) {
    console.error("Migration failed:", migrationsError);
  }

  const inOnboarding = segments[0] === "onboarding";
  if (!onboardingComplete && !inOnboarding) {
    return <Redirect href="/onboarding/welcome" />;
  }

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
        options={{ title: "How It Works", headerBackTitle: "Settings" }}
      />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

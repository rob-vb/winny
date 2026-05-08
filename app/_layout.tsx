import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
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
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success: migrationsSuccess, error: migrationsError } =
    useMigrations(db, migrations);

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

  if (!ready) return null;

  if (migrationsError) {
    console.error("Migration failed:", migrationsError);
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import { useWinsStore } from "@/src/stores/useWinsStore";
import { StreakHeader } from "@/src/components/StreakHeader";
import { WinCard } from "@/src/components/WinCard";
import { WinInputArea } from "@/src/components/WinInputArea";
import { WinCelebration } from "@/src/components/WinCelebration";
import type { PostWinMoment } from "@/src/utils/postWinMoment";
import type { Win } from "@/src/db/schema";

// WIN-04 override (D-03): No "I'm done for today" button.
// The always-open calendar-day model replaces session locking.
// Today's wins list IS the session summary — always visible.

export default function HomeScreen() {
  const { hydrate, isHydrated, todayWins, streak, totalWins, addWin } =
    useWinsStore(
      useShallow((s) => ({
        hydrate: s.hydrate,
        isHydrated: s.isHydrated,
        todayWins: s.todayWins,
        streak: s.streak,
        totalWins: s.totalWins,
        addWin: s.addWin,
      }))
    );

  const flatListRef = useRef<FlatList<Win>>(null);
  const [postWinMoment, setPostWinMoment] = useState<PostWinMoment | null>(null);

  // Track previous list length to identify the newly added item (Pitfall 2 / RESEARCH Section 6)
  const prevLengthRef = useRef(todayWins.length);
  const justAdded = todayWins.length > prevLengthRef.current;
  useEffect(() => {
    prevLengthRef.current = todayWins.length;
  }, [todayWins.length]);

  // Hydrate from DB on mount — AFTER _layout.tsx migration gate has cleared (RESEARCH Section 2)
  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, []);

  // Sort today's wins newest-first by logged_at for FlatList display (RESEARCH Section 5)
  const displayWins = [...todayWins].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );

  const handleAddWin = async (text: string) => {
    const result = await addWin(text);
    setPostWinMoment(result.moment);
    // Scroll to top to show the newly added win
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Hydration loading state — show placeholder while SQLite reads (Pitfall 6)
  if (!isHydrated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <StreakHeader streak={0} totalWins={0} />
        <View className="flex-1 items-center justify-center">
          <Text className="font-nunito-regular text-base text-text-secondary">
            Loading...
          </Text>
        </View>
        <WinInputArea onSubmit={async () => {}} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <StreakHeader streak={streak} totalWins={totalWins} />

        {postWinMoment && (
          <WinCelebration
            moment={postWinMoment}
            onDismiss={() => setPostWinMoment(null)}
          />
        )}

        {todayWins.length === 0 ? (
          // Empty state — 0 wins today (D-07)
          <View className="flex-1 items-center justify-center px-8">
            <Image
              source={require("@/assets/images/trophy.png")}
              style={{ width: 120, height: 120 }}
              resizeMode="contain"
              className="mb-8"
              accessibilityLabel="Just Keep Winning trophy"
            />
            <Text
              className="font-nunito-bold text-[28px] text-text-primary text-center leading-tight"
              style={{ maxWidth: "80%" } as any}
            >
              What was your win today?
            </Text>
          </View>
        ) : (
          // Populated state — FlatList of today's wins (D-02)
          <FlatList
            ref={flatListRef}
            data={displayWins}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <WinCard win={item} isNew={index === 0 && justAdded} />
            )}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 8,
            }}
            showsVerticalScrollIndicator={false}
            className="flex-1"
          />
        )}

        {/* Always visible — both empty and populated states */}
        <WinInputArea onSubmit={handleAddWin} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

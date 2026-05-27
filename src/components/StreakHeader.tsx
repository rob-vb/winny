import { View, Text, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { streakLabel } from "@/src/utils/streakLabel";
import { AchievementBadge } from "./AchievementBadge";

interface StreakHeaderProps {
  streak: number;
  totalWins: number;
}

export function StreakHeader({ streak, totalWins }: StreakHeaderProps) {
  const { t } = useTranslation();
  const label = streakLabel(streak);
  return (
    <View
      className="px-4 pt-3 pb-5 bg-background"
      accessibilityLabel={label}
    >
      <View className="bg-warm-paper rounded-3xl border border-border px-4 py-4 flex-row items-center gap-4">
        <Image
          source={require("@/assets/images/trophy.png")}
          style={{ width: 58, height: 58 }}
          resizeMode="contain"
          accessibilityLabel={t("home.trophyAria")}
        />
        <View className="flex-1">
          <Text className="font-nunito-extrabold text-xs text-primary uppercase mb-1">
            {t("streak.eyebrowToday")}
          </Text>
          <Text className="font-nunito-black text-[24px] text-badge-ink leading-tight">
            {label}
          </Text>
          <Text className="font-nunito-bold text-sm text-text-secondary mt-1">
            {t("streak.totalLogged", { count: totalWins })}
          </Text>
        </View>
        <AchievementBadge value={streak} label={t("streak.badgeDayStreak", { count: streak })} tone="gold" />
      </View>
    </View>
  );
}

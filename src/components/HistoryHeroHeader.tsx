import { View, Text, Image } from "react-native";
import { useTranslation } from "react-i18next";
import { streakLabel } from "@/src/utils/streakLabel";
import { useDisplayName } from "@/src/stores/useWinsStore";
import { AchievementBadge } from "./AchievementBadge";

interface HistoryHeroHeaderProps {
  totalWins: number;
  streak: number;
}

export function HistoryHeroHeader({ totalWins, streak }: HistoryHeroHeaderProps) {
  const { t } = useTranslation();
  const displayName = useDisplayName();
  const label = displayName
    ? t("streak.namedWinsLabel", { name: displayName })
    : t("streak.totalWinsLabel");
  return (
    <View
      className="px-4 pt-3 pb-5 bg-background"
      accessibilityLabel={t("streak.ariaSummary", {
        total: totalWins,
        label,
        streak: streakLabel(streak),
      })}
    >
      <View className="bg-badge-ink rounded-3xl px-5 py-5 overflow-hidden">
        <View className="flex-row items-start gap-4">
          <View className="flex-1">
            <Text className="font-nunito-extrabold text-xs text-primary uppercase mb-2">
              {t("streak.winningRecord")}
            </Text>
            <Text className="font-nunito-black text-[68px] text-warm-paper" style={{ lineHeight: 76 }}>
              {totalWins}
            </Text>
            <Text className="font-nunito-bold text-base text-warm-paper mt-1">
              {label}
            </Text>
            <Text className="font-nunito-semibold text-sm text-warm-paper opacity-80 mt-1">
              {streakLabel(streak)}
            </Text>
          </View>
          <View className="items-end gap-3">
            <Image
              source={require("@/assets/images/trophy.png")}
              style={{ width: 76, height: 76 }}
              resizeMode="contain"
              accessibilityLabel={t("home.trophyAria")}
            />
            <AchievementBadge value={streak} label={t("streak.badgeStreak")} tone="coral" />
          </View>
        </View>
      </View>
    </View>
  );
}

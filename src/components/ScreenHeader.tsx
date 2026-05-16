import { Image, Text, View } from "react-native";
import { AchievementBadge } from "./AchievementBadge";

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  body?: string;
  badgeValue?: number | string;
  badgeLabel?: string;
  mascot?: boolean;
}

export function ScreenHeader({
  eyebrow = "Winny",
  title,
  body,
  badgeValue,
  badgeLabel,
  mascot = false,
}: ScreenHeaderProps) {
  const showBadge = badgeValue !== undefined && badgeLabel;

  return (
    <View className="px-4 pt-3 pb-5">
      <View className="flex-row items-start gap-4">
        <View className="flex-1">
          <Text className="font-nunito-extrabold text-xs text-primary uppercase mb-2">
            {eyebrow}
          </Text>
          <Text className="font-nunito-black text-[30px] text-badge-ink leading-tight">
            {title}
          </Text>
          {body && (
            <Text className="font-nunito-regular text-base text-text-secondary leading-relaxed mt-2">
              {body}
            </Text>
          )}
        </View>
        {showBadge ? (
          <AchievementBadge value={badgeValue} label={badgeLabel} showMascot={mascot} />
        ) : mascot ? (
          <Image
            source={require("@/assets/images/trophy.png")}
            style={{ width: 72, height: 72 }}
            resizeMode="contain"
            accessibilityLabel="Winny trophy"
          />
        ) : null}
      </View>
    </View>
  );
}

import { Image, Text, View } from "react-native";

interface AchievementBadgeProps {
  value: number | string;
  label: string;
  tone?: "gold" | "coral" | "blue";
  showMascot?: boolean;
}

const toneStyles = {
  gold: {
    wrap: "bg-primary",
  },
  coral: {
    wrap: "bg-coral",
  },
  blue: {
    wrap: "bg-blue",
  },
} as const;

export function AchievementBadge({
  value,
  label,
  tone = "gold",
  showMascot = false,
}: AchievementBadgeProps) {
  const styles = toneStyles[tone];

  return (
    <View
      className={`min-w-[104px] rounded-3xl px-4 py-3 ${styles.wrap}`}
      style={{
        shadowColor: "#B87413",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16,
        shadowRadius: 0,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start justify-end">
        {showMascot && (
          <Image
            source={require("@/assets/images/trophy.png")}
            style={{ width: 42, height: 42, marginTop: -12, marginRight: -6 }}
            resizeMode="contain"
            accessibilityLabel="Winny trophy"
          />
        )}
      </View>
      <Text
        className="font-nunito-black text-badge-ink"
        style={{ fontSize: 36, lineHeight: 42 }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="font-nunito-extrabold text-xs text-badge-ink uppercase">
        {label}
      </Text>
    </View>
  );
}

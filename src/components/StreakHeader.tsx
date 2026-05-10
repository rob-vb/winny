import { View, Text, Image } from "react-native";
import { streakLabel } from "@/src/utils/streakLabel";

interface StreakHeaderProps {
  streak: number;
  totalWins: number;
}

export function StreakHeader({ streak, totalWins }: StreakHeaderProps) {
  const label = streakLabel(streak);
  return (
    <View
      className="flex-row items-center px-4 py-6 border-b border-border bg-background"
      accessibilityLabel={label}
    >
      <Image
        source={require("@/assets/images/trophy.png")}
        style={{ width: 48, height: 48 }}
        resizeMode="contain"
        accessibilityLabel="Winning Streak trophy"
      />
      <View className="ml-3 flex-1">
        <Text className="font-nunito-bold text-xl text-text-primary leading-tight">
          {label}
        </Text>
        <Text className="font-nunito-bold text-sm text-text-secondary mt-1">
          {totalWins} total wins
        </Text>
      </View>
    </View>
  );
}

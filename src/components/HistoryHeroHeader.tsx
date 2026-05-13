import { View, Text, Image } from "react-native";
import { streakLabel } from "@/src/utils/streakLabel";

interface HistoryHeroHeaderProps {
  totalWins: number;
  streak: number;
}

export function HistoryHeroHeader({ totalWins, streak }: HistoryHeroHeaderProps) {
  return (
    <View
      className="items-center px-4 py-6 border-b border-border bg-background"
      accessibilityLabel={`${totalWins} total wins. ${streakLabel(streak)}`}
    >
      <Image
        source={require("@/assets/images/trophy.png")}
        style={{ width: 64, height: 64 }}
        resizeMode="contain"
        className="mb-4"
        accessibilityLabel="Just Keep Winning trophy"
      />
      <Text className="font-nunito-black text-[64px] text-gold" style={{ lineHeight: 80 }}>
        {totalWins}
      </Text>
      <Text className="font-nunito-bold text-sm text-text-secondary mt-1">
        total wins
      </Text>
      <Text className="font-nunito-bold text-sm text-text-secondary mt-2">
        {streakLabel(streak)}
      </Text>
    </View>
  );
}

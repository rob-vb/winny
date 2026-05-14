import { View, Text, Image } from "react-native";
import { streakLabel } from "@/src/utils/streakLabel";
import { useDisplayName } from "@/src/stores/useWinsStore";

interface HistoryHeroHeaderProps {
  totalWins: number;
  streak: number;
}

export function HistoryHeroHeader({ totalWins, streak }: HistoryHeroHeaderProps) {
  const displayName = useDisplayName();
  return (
    <View
      className="items-center px-4 py-6 border-b border-border bg-background"
      accessibilityLabel={`${totalWins} ${displayName ? `${displayName}'s wins` : "total wins"}. ${streakLabel(streak)}`}
    >
      <Image
        source={require("@/assets/images/trophy.png")}
        style={{ width: 64, height: 64 }}
        resizeMode="contain"
        className="mb-4"
        accessibilityLabel="Just Keep Winning trophy"
      />
      <Text className="font-nunito-black text-[64px] text-primary" style={{ lineHeight: 80 }}>
        {totalWins}
      </Text>
      <Text className="font-nunito-bold text-sm text-text-secondary mt-1">
        {displayName ? `${displayName}'s wins` : "total wins"}
      </Text>
      <Text className="font-nunito-bold text-sm text-text-secondary mt-2">
        {streakLabel(streak)}
      </Text>
    </View>
  );
}

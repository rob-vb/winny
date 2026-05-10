import { View, Text } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import type { Win } from "@/src/db/schema";

interface WinCardProps {
  win: Win;
  isNew: boolean;
}

export function WinCard({ win, isNew }: WinCardProps) {
  return (
    <Animated.View
      entering={isNew ? ZoomIn.duration(300) : undefined}
      className="bg-surface rounded-xl px-4 py-3 mb-2 shadow-sm flex-row items-start"
      accessibilityLabel={win.text}
    >
      <Text className="font-nunito-regular text-base text-text-primary leading-relaxed flex-1">
        {win.text}
      </Text>
      <Ionicons
        name="heart-outline"
        size={16}
        color="#FF6B6B"
        style={{ marginLeft: 8, marginTop: 2 }}
      />
    </Animated.View>
  );
}

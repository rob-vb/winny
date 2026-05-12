import { Text } from "react-native";
import Animated from "react-native-reanimated";

interface GoalCardProps {
  text: string;
  style?: object; // for useAnimatedStyle opacity from parent (Strategy A crossfade)
}

export function GoalCard({ text, style }: GoalCardProps) {
  return (
    <Animated.View
      style={style}
      className="bg-surface rounded-xl px-4 py-6 shadow-sm border border-border mt-2"
      accessibilityLabel={text}
    >
      <Text className="font-nunito-bold text-[28px] text-text-primary leading-tight">
        {text}
      </Text>
      <Text className="font-nunito-regular text-base text-text-secondary leading-relaxed mt-4 text-center">
        You're building your dream one win at a time.
      </Text>
    </Animated.View>
  );
}

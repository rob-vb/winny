import React, { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { formatDateKey } from "@/src/utils/dateUtils";

// winCountLabel is a pure function — defined at module level (not inside component)
// HIST-02: singular "1 win", plural "N wins"
const winCountLabel = (count: number): string =>
  count === 1 ? "1 win" : `${count} wins`;

interface WinSection {
  date_key: string;
  data: { id: string; [key: string]: unknown }[];
}

interface DateSectionHeaderProps {
  section: WinSection;
  isCollapsed: boolean;
  onToggle: () => void;
}

// React.memo is MANDATORY — mitigates RN #43597 sticky header + virtualization glitch
// (RESEARCH.md Pitfall 2)
export const DateSectionHeader = React.memo(function DateSectionHeader({
  section,
  isCollapsed,
  onToggle,
}: DateSectionHeaderProps) {
  // Initialize shared value from isCollapsed prop (handles initial render correctly)
  const rotation = useSharedValue(isCollapsed ? 180 : 0);

  // Sync rotation animation when isCollapsed prop changes
  useEffect(() => {
    rotation.value = withTiming(isCollapsed ? 180 : 0, { duration: 200 });
  }, [isCollapsed]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const dateLabel = formatDateKey(section.date_key);
  const count = section.data.length;

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center px-4 py-3 bg-background border-b border-border"
      accessibilityRole="button"
      accessibilityLabel={`${dateLabel}, ${winCountLabel(count)}, ${isCollapsed ? "collapsed" : "expanded"}`}
    >
      <Text className="font-nunito-bold text-sm text-text-primary flex-1">
        {dateLabel}
      </Text>
      {/* Pill badge — hidden from a11y tree since content is in Pressable label */}
      <View
        className="bg-gold/20 rounded-full px-2 py-0.5"
        accessibilityElementsHidden={true}
      >
        <Text className="font-nunito-bold text-xs text-text-primary">
          {winCountLabel(count)}
        </Text>
      </View>
      {/* Chevron — decorative affordance, hidden from accessibility tree */}
      <Animated.View
        style={[animatedStyle, { marginLeft: 8 }]}
        accessibilityElementsHidden={true}
      >
        <Ionicons name="chevron-down" size={16} color="#8E8E93" />
      </Animated.View>
    </Pressable>
  );
});

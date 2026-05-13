import React, { useEffect, useRef } from "react";
import { Animated, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDateKey } from "@/src/utils/dateUtils";

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
export const DateSectionHeader = React.memo(function DateSectionHeader({
  section,
  isCollapsed,
  onToggle,
}: DateSectionHeaderProps) {
  const rotation = useRef(new Animated.Value(isCollapsed ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isCollapsed ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isCollapsed]);

  const animatedStyle = {
    transform: [{
      rotate: rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
      }),
    }],
  };

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
      <View
        className="bg-gold/20 rounded-full px-2 py-0.5"
        accessibilityElementsHidden={true}
      >
        <Text className="font-nunito-bold text-xs text-text-primary">
          {winCountLabel(count)}
        </Text>
      </View>
      <Animated.View
        style={[animatedStyle, { marginLeft: 8 }]}
        accessibilityElementsHidden={true}
      >
        <Ionicons name="chevron-down" size={16} color="#8E8E93" />
      </Animated.View>
    </Pressable>
  );
});

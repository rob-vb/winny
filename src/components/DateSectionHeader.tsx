import React, { useEffect, useRef } from "react";
import { Animated, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { formatDateKey } from "@/src/utils/dateUtils";

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
  const { t } = useTranslation();
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
  const countLabel = t("winCount", { count });
  const stateLabel = isCollapsed ? t("sectionState.collapsed") : t("sectionState.expanded");

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center px-4 py-3 bg-background"
      accessibilityRole="button"
      accessibilityLabel={t("winSectionAria", { date: dateLabel, count: countLabel, state: stateLabel })}
    >
      <Text className="font-nunito-extrabold text-sm text-badge-ink flex-1">
        {dateLabel}
      </Text>
      <View
        className="bg-primary rounded-full px-3 py-1"
        accessibilityElementsHidden={true}
      >
        <Text className="font-nunito-extrabold text-xs text-badge-ink">
          {countLabel}
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

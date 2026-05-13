import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Win } from "@/src/db/schema";

interface WinCardProps {
  win: Win;
  isNew: boolean;
}

export function WinCard({ win, isNew }: WinCardProps) {
  const scale = useRef(new Animated.Value(isNew ? 0.8 : 1)).current;
  const opacity = useRef(new Animated.Value(isNew ? 0 : 1)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View
      style={{ transform: [{ scale }], opacity }}
      className="bg-surface rounded-xl px-4 py-3 mb-2 shadow-sm flex-row items-start"
      accessibilityLabel={win.text}
    >
      <Text className="font-nunito-regular text-base text-text-primary leading-relaxed flex-1">
        {win.text}
      </Text>
      <Ionicons
        name="checkmark-circle"
        size={16}
        color="#4CAF50"
        style={{ marginLeft: 8, marginTop: 2 }}
      />
    </Animated.View>
  );
}

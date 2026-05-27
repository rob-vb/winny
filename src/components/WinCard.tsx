import { useEffect, useRef } from "react";
import { Animated, Alert, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { Win } from "@/src/db/schema";

interface WinCardProps {
  win: Win;
  isNew: boolean;
  onDelete?: (id: string) => void;
}

export function WinCard({ win, isNew, onDelete }: WinCardProps) {
  const { t } = useTranslation();
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

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      t("wins.deleteConfirmTitle"),
      t("wins.deleteConfirmBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => onDelete(win.id),
        },
      ]
    );
  };

  return (
    <Animated.View
      style={{ transform: [{ scale }], opacity }}
      className="bg-surface rounded-2xl px-4 py-4 mb-3 border border-border flex-row items-start"
      accessibilityLabel={win.text}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: "#F1AF2E",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          marginTop: 1,
        }}
      >
        <Ionicons name="checkmark" size={18} color="#17130A" />
      </View>
      <View className="flex-1">
        <Text className="font-nunito-semibold text-[17px] text-badge-ink leading-relaxed">
          {win.text}
        </Text>
      </View>
      {onDelete ? (
        <Pressable
          onPress={confirmDelete}
          hitSlop={12}
          className="px-2 py-1"
          accessibilityRole="button"
          accessibilityLabel={t("wins.deleteAria")}
        >
          <Ionicons name="trash-outline" size={16} color="#C7C7CC" />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

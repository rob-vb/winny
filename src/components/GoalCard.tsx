import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { DreamGoalItem } from "@/src/db/schema";

interface GoalCardProps {
  goal: DreamGoalItem;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onToggle, onDelete }: GoalCardProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center bg-surface rounded-2xl px-3 py-3 border border-border mb-3">
      <Pressable
        onPress={() => onToggle(goal.id, !goal.completed)}
        hitSlop={12}
        className="px-1 py-1"
        accessibilityRole="checkbox"
        accessibilityLabel={goal.completed ? t("goal.markNotAchieved") : t("goal.markAchieved")}
        accessibilityState={{ checked: !!goal.completed }}
      >
        <Ionicons
          name={goal.completed ? "checkmark-circle" : "ellipse-outline"}
          size={26}
          color={goal.completed ? "#F1AF2E" : "#8E8E93"}
        />
      </Pressable>
      <Text
        className={`flex-1 text-base mx-2 ${
          goal.completed
            ? "font-nunito-bold text-badge-ink"
            : "font-nunito-regular text-text-primary"
        }`}
        numberOfLines={4}
      >
        {goal.text}
      </Text>
      <Pressable
        onPress={() =>
          Alert.alert(t("goal.deleteConfirmTitle"), t("goal.deleteConfirmBody"), [
            { text: t("common.cancel"), style: "cancel" },
            { text: t("common.delete"), style: "destructive", onPress: () => onDelete(goal.id) },
          ])
        }
        hitSlop={12}
        className="px-2 py-1"
        accessibilityRole="button"
        accessibilityLabel={t("goal.deleteAria")}
      >
        <Ionicons name="trash-outline" size={16} color="#C7C7CC" />
      </Pressable>
    </View>
  );
}

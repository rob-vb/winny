import { View, Text, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DreamGoalItem } from "@/src/db/schema";

interface GoalCardProps {
  goal: DreamGoalItem;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, onToggle, onDelete }: GoalCardProps) {
  return (
    <View className="flex-row items-center bg-surface rounded-2xl px-3 py-3 border border-border mb-3">
      <Pressable
        onPress={() => onToggle(goal.id, !goal.completed)}
        className="min-h-[44px] min-w-[44px] items-center justify-center"
        accessibilityRole="checkbox"
        accessibilityLabel={goal.completed ? "Mark as not achieved" : "Mark as achieved"}
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
          Alert.alert("Delete Goal", "Remove this goal?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => onDelete(goal.id) },
          ])
        }
        className="min-h-[44px] min-w-[44px] items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Delete goal"
      >
        <Ionicons name="trash-outline" size={16} color="#C7C7CC" />
      </Pressable>
    </View>
  );
}

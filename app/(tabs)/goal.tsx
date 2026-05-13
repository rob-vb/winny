import { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  getGoals,
  addGoal,
  toggleGoalComplete,
  deleteGoal,
} from "@/src/db/repositories/dreamGoals";
import { GoalCard } from "@/src/components/GoalCard";
import type { DreamGoalItem } from "@/src/db/schema";

export default function GoalScreen() {
  const [goals, setGoals] = useState<DreamGoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState("");
  const [adding, setAdding] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadGoals = async () => {
    try {
      const data = await getGoals();
      setGoals(data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleAdd = async () => {
    const text = newGoalText.trim();
    if (!text || adding) return;
    setAdding(true);
    try {
      await addGoal(text);
      setNewGoalText("");
      await loadGoals();
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, completed, completed_at: completed ? new Date().toISOString() : null }
          : g
      )
    );
    try {
      await toggleGoalComplete(id, completed);
    } catch {
      await loadGoals();
    }
  };

  const handleDelete = async (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      await deleteGoal(id);
    } catch {
      await loadGoals();
    }
  };

  if (loading) {
    return <SafeAreaView className="flex-1 bg-background" />;
  }

  const activeGoals = goals.filter((g) => !g.completed);
  const achievedGoals = goals.filter((g) => g.completed);
  const canAdd = newGoalText.trim().length > 0 && !adding;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="font-nunito-bold text-xl text-text-primary py-4">
            Dream Goals
          </Text>

          {loadError && (
            <Text className="font-nunito-regular text-sm text-accent text-center mt-2 mb-4">
              Couldn't load your goals — please restart the app.
            </Text>
          )}

          {activeGoals.length === 0 && achievedGoals.length === 0 && (
            <Text className="font-nunito-regular text-base text-text-secondary text-center mt-4 mb-6">
              Name what your wins are building toward.
            </Text>
          )}

          {activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}

          {achievedGoals.length > 0 && (
            <>
              <Text className="font-nunito-bold text-sm text-text-secondary mt-4 mb-3">
                Achieved
              </Text>
              {achievedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </>
          )}
        </ScrollView>

        <View className="border-t border-border bg-surface px-4 py-3">
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 bg-background border border-border rounded-lg px-4 py-3 font-nunito-regular text-base text-text-primary"
              placeholder="Add a dream goal..."
              placeholderTextColor="#8E8E93"
              value={newGoalText}
              onChangeText={setNewGoalText}
              maxLength={500}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              accessibilityLabel="New dream goal text"
              accessibilityHint="Type a dream goal and tap the add button"
            />
            <Pressable
              onPress={handleAdd}
              disabled={!canAdd}
              className={`bg-primary rounded-lg min-h-[44px] min-w-[44px] items-center justify-center px-3 ${
                !canAdd ? "opacity-50" : "opacity-100"
              }`}
              accessibilityRole="button"
              accessibilityLabel="Add dream goal"
              accessibilityState={{ disabled: !canAdd }}
            >
              <Text className="font-nunito-bold text-sm text-white">Add Goal</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

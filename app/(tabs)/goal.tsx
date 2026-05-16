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
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { WinCelebration } from "@/src/components/WinCelebration";
import { useDisplayName } from "@/src/stores/useWinsStore";
import type { DreamGoalItem } from "@/src/db/schema";

const GOAL_BODIES = [
  "You wrote it down. You chased it. You caught it. This is the stuff that builds a life.",
  "Past you dared to write this down. Present you just made it real. That's how legends are made.",
  "Most people let dreams stay dreams. You dragged this one into reality. Take the bow.",
  "This was a maybe. Then a someday. Then a soon. Now it's done. Forever yours.",
  "Look at this moment. Remember it. This is who you said you'd become — and you became them.",
  "From the page to your life. From dream to done. This is what unstoppable looks like.",
  "You didn't wait for permission. You didn't wait for perfect. You showed up and you won.",
  "One goal closer to the future you're building. And the version of you that builds it.",
];

export default function GoalScreen() {
  const displayName = useDisplayName();
  const [goals, setGoals] = useState<DreamGoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGoalText, setNewGoalText] = useState("");
  const [adding, setAdding] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [celebration, setCelebration] = useState<{
    eyebrow: string;
    title: string;
    body: string;
  } | null>(null);

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
    const target = goals.find((g) => g.id === id);
    const wasNotCompleted = target && !target.completed;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, completed, completed_at: completed ? new Date().toISOString() : null }
          : g
      )
    );
    try {
      await toggleGoalComplete(id, completed);
      if (completed && wasNotCompleted && target) {
        const body = GOAL_BODIES[Math.floor(Math.random() * GOAL_BODIES.length)];
        setCelebration({
          eyebrow: displayName ? `${displayName}, goal achieved` : "Goal achieved",
          title: "",
          body: `"${target.text}"\n\n${body}`,
        });
      }
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
      {celebration && (
        <WinCelebration
          customCopy={celebration}
          intensity="mega"
          onDismiss={() => setCelebration(null)}
        />
      )}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            eyebrow="Goals"
            title="Keep your goals in sight."
            body="Add what you want to accomplish. Check it off when it's done."
          />

          {loadError && (
            <Text className="font-nunito-regular text-sm text-accent text-center mt-2 mb-4">
              Couldn't load your goals. Please restart the app.
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
                Achieved goals
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
          <Text className="font-nunito-extrabold text-xs text-primary uppercase mb-2">
            Add a goal
          </Text>
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 bg-background border border-border rounded-2xl px-4 py-3 font-nunito-regular text-base text-text-primary"
              placeholder="Add a goal..."
              placeholderTextColor="#8E8E93"
              value={newGoalText}
              onChangeText={setNewGoalText}
              maxLength={500}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              accessibilityLabel="New goal text"
              accessibilityHint="Type a goal and tap the add button"
            />
            <Pressable
              onPress={handleAdd}
              disabled={!canAdd}
              className={`bg-primary rounded-2xl min-h-[48px] min-w-[52px] items-center justify-center px-3 ${
                !canAdd ? "opacity-50" : "opacity-100"
              }`}
              accessibilityRole="button"
              accessibilityLabel="Add goal"
              accessibilityState={{ disabled: !canAdd }}
            >
              <Ionicons name="add" size={22} color="#17130A" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

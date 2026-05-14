import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { completeOnboarding } from "@/src/db/repositories/onboarding";
import { addGoal } from "@/src/db/repositories/dreamGoals";
import { validateGoalText } from "@/src/utils/goalValidation";

type OnboardingGoalState = "editing" | "saving" | "saved" | "skipping" | "error";

export default function OnboardingGoalScreen() {
  const router = useRouter();
  const [currentText, setCurrentText] = useState("");
  const [screenState, setScreenState] =
    useState<OnboardingGoalState>("editing");

  const isBusy = screenState === "saving" || screenState === "skipping";
  const canSave = validateGoalText(currentText) && !isBusy;
  const remaining = 500 - currentText.length;
  const showCounter = remaining <= 100;

  const goHome = () => router.replace("/");

  const handleSave = async () => {
    if (!canSave) return;

    setScreenState("saving");
    try {
      await addGoal(currentText.trim());
      await completeOnboarding();
      setScreenState("saved");
      setTimeout(goHome, 700);
    } catch {
      setScreenState("error");
    }
  };

  const handleSkip = async () => {
    if (isBusy) return;

    setScreenState("skipping");
    try {
      await completeOnboarding();
      goHome();
    } catch {
      setScreenState("error");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        >
          <Text className="font-nunito-bold text-[28px] text-text-primary text-center leading-tight mt-8">
            Set Goals
          </Text>
          <Text className="font-nunito-regular text-base text-text-secondary text-center leading-relaxed mt-3 mb-6">
            Optional, but powerful: name what your wins are building toward. You can add more later.
          </Text>

          <View className="bg-surface rounded-xl px-4 py-4 border border-border">
            <TextInput
              className="font-nunito-regular text-base text-text-primary"
              style={{ minHeight: 120 }}
              placeholder="What are you working toward?"
              placeholderTextColor="#8E8E93"
              value={currentText}
              onChangeText={setCurrentText}
              maxLength={500}
              multiline={true}
              accessibilityLabel="Goal text"
              accessibilityHint="Type your goal, up to 500 characters"
            />
            {showCounter && (
              <Text
                className="font-nunito-bold text-sm text-text-secondary text-right mt-1"
                accessibilityLabel={`${currentText.length} of 500 characters used`}
              >
                {remaining} / 500
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`bg-primary rounded-lg min-h-[44px] mt-4 items-center justify-center px-3 ${
              !canSave ? "opacity-50" : "opacity-100"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Save Goal"
            accessibilityState={{ disabled: !canSave }}
          >
            <Text className="font-nunito-bold text-sm text-white">Save Goal</Text>
          </Pressable>

          <Pressable
            onPress={handleSkip}
            disabled={isBusy}
            className={`min-h-[44px] mt-2 items-center justify-center ${
              isBusy ? "opacity-50" : "opacity-100"
            }`}
            accessibilityRole="button"
            accessibilityLabel="Skip Goals setup for now"
          >
            <Text className="font-nunito-bold text-sm text-text-secondary">
              Skip for now
            </Text>
          </Pressable>

          {screenState === "saved" && (
            <Text className="font-nunito-regular text-base text-text-secondary text-center mt-4">
              Saved. Let's log your first win.
            </Text>
          )}

          {screenState === "error" && (
            <Text className="font-nunito-regular text-sm text-accent text-center mt-4">
              Couldn't save your goal — tap Save Goal to try again.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

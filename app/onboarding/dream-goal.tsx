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
import { useTranslation } from "react-i18next";
import { completeOnboarding } from "@/src/db/repositories/onboarding";
import { addGoal } from "@/src/db/repositories/dreamGoals";
import { validateGoalText } from "@/src/utils/goalValidation";
import { ScreenHeader } from "@/src/components/ScreenHeader";

type OnboardingGoalState = "editing" | "saving" | "saved" | "skipping" | "error";

export default function OnboardingGoalScreen() {
  const { t } = useTranslation();
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
          <ScreenHeader
            eyebrow={t("onboarding.goal.eyebrow")}
            title={t("onboarding.goal.title")}
            body={t("onboarding.goal.body")}
          />

          <View className="bg-surface rounded-3xl px-4 py-4 border border-border">
            <TextInput
              className="font-nunito-regular text-base text-text-primary"
              style={{ minHeight: 120 }}
              placeholder={t("goalEditor.placeholder")}
              placeholderTextColor="#8E8E93"
              value={currentText}
              onChangeText={setCurrentText}
              maxLength={500}
              multiline={true}
              accessibilityLabel={t("goalEditor.inputAria")}
              accessibilityHint={t("goalEditor.inputHint")}
            />
            {showCounter && (
              <Text
                className="font-nunito-bold text-sm text-text-secondary text-right mt-1"
                accessibilityLabel={t("goalEditor.counterAria", {
                  used: currentText.length,
                  max: 500,
                })}
              >
                {remaining} / 500
              </Text>
            )}
          </View>

          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            className={`bg-primary rounded-2xl min-h-[52px] mt-4 items-center justify-center px-3 ${
              !canSave ? "opacity-50" : "opacity-100"
            }`}
            accessibilityRole="button"
            accessibilityLabel={t("goalEditor.saveAria")}
            accessibilityState={{ disabled: !canSave }}
          >
            <Text className="font-nunito-black text-base text-badge-ink">{t("goalEditor.save")}</Text>
          </Pressable>

          <Pressable
            onPress={handleSkip}
            disabled={isBusy}
            className={`min-h-[44px] mt-2 items-center justify-center ${
              isBusy ? "opacity-50" : "opacity-100"
            }`}
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.goal.skipAria")}
          >
            <Text className="font-nunito-bold text-sm text-text-secondary">
              {t("onboarding.goal.skip")}
            </Text>
          </Pressable>

          {screenState === "saved" && (
            <Text className="font-nunito-regular text-base text-text-secondary text-center mt-4">
              {t("onboarding.goal.saved")}
            </Text>
          )}

          {screenState === "error" && (
            <Text className="font-nunito-regular text-sm text-accent text-center mt-4">
              {t("onboarding.goal.error")}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { getGoal, upsertGoal } from "@/src/db/repositories/dreamGoal";
import { GoalCard } from "@/src/components/GoalCard";
import { GoalEditor } from "@/src/components/GoalEditor";

type GoalState = "loading" | "empty" | "view" | "editing" | "saving" | "error";

export default function GoalScreen() {
  const [screenState, setScreenState] = useState<GoalState>("loading");
  const [savedText, setSavedText] = useState("");
  const [currentText, setCurrentText] = useState("");
  const [saveError, setSaveError] = useState(false);

  // Reanimated shared values — must be declared before any conditional returns (hooks rule)
  const cardOpacity = useSharedValue(0);
  const editorOpacity = useSharedValue(0);
  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));
  const editorStyle = useAnimatedStyle(() => ({ opacity: editorOpacity.value }));

  // Derived state — not stored
  const isDirty = currentText.trim() !== savedText.trim();

  // Load goal from DB on mount
  useEffect(() => {
    (async () => {
      try {
        const goal = await getGoal();
        if (goal === null || goal.text === "") {
          editorOpacity.value = withTiming(1, { duration: 200 });
          setScreenState("empty");
        } else {
          setSavedText(goal.text);
          setCurrentText(goal.text);
          cardOpacity.value = withTiming(1, { duration: 200 });
          setScreenState("view");
        }
      } catch {
        setScreenState("error");
      }
    })();
  }, []);

  // Loading state — empty SafeAreaView prevents content flash (Pitfall 6)
  if (screenState === "loading") {
    return <SafeAreaView className="flex-1 bg-background" />;
  }

  const enterEditMode = () => {
    cardOpacity.value = withTiming(0, { duration: 200 });
    editorOpacity.value = withTiming(1, { duration: 200 });
    setScreenState("editing");
  };

  const handleCancel = () => {
    setCurrentText(savedText);
    setSaveError(false);
    editorOpacity.value = withTiming(0, { duration: 200 });
    cardOpacity.value = withTiming(1, { duration: 200 });
    setScreenState("view");
  };

  const handleSave = async () => {
    if (screenState === "saving") return;
    setScreenState("saving");
    setSaveError(false);
    try {
      await upsertGoal(currentText.trim());
      setSavedText(currentText.trim());
      setCurrentText(currentText.trim());
      editorOpacity.value = withTiming(0, { duration: 200 });
      cardOpacity.value = withTiming(1, { duration: 200 });
      setScreenState("view");
    } catch {
      setSaveError(true);
      setScreenState(savedText === "" ? "empty" : "editing");
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
          {/* Empty state layout (screenState === "empty") */}
          {screenState === "empty" && (
            <>
              <Text className="font-nunito-regular text-base text-text-secondary text-center mt-8 mb-6">
                You're building your dream one win at a time.
              </Text>
              <GoalEditor
                style={editorStyle}
                currentText={currentText}
                onChangeText={setCurrentText}
                onSave={handleSave}
                onCancel={() => {}}
                isDirty={isDirty}
                isSaving={false}
                showCancel={false}
              />
              {saveError && (
                <Text className="font-nunito-regular text-sm text-accent text-center mt-2">
                  Couldn't save your goal — tap Save Goal to try again.
                </Text>
              )}
            </>
          )}

          {/* View + Edit + Saving states: header row + Strategy A always-mounted pair */}
          {(screenState === "view" ||
            screenState === "editing" ||
            screenState === "saving") && (
            <>
              {/* Header row */}
              <View className="flex-row items-center justify-between py-4">
                <Text className="font-nunito-bold text-xl text-text-primary">
                  Dream Goal
                </Text>
                {screenState === "view" && (
                  <Pressable
                    onPress={enterEditMode}
                    className="min-h-[44px] min-w-[44px] items-center justify-center"
                    accessibilityRole="button"
                    accessibilityLabel="Edit Dream Goal"
                  >
                    <Ionicons name="pencil-outline" size={16} color="#8E8E93" />
                  </Pressable>
                )}
              </View>

              {/*
                Strategy A — always-mounted views (RESEARCH.md Pitfall 2).
                Both GoalCard and GoalEditor remain in the render tree for view + editing states.
                Visibility is controlled via opacity (cardStyle / editorStyle).
                pointerEvents="none" on the hidden view prevents touch pass-through.
              */}
              <Animated.View
                style={cardStyle}
                pointerEvents={screenState !== "view" ? "none" : "auto"}
              >
                <GoalCard text={savedText} />
              </Animated.View>

              <Animated.View
                style={editorStyle}
                pointerEvents={
                  screenState !== "editing" && screenState !== "saving"
                    ? "none"
                    : "auto"
                }
              >
                <GoalEditor
                  currentText={currentText}
                  onChangeText={setCurrentText}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isDirty={isDirty}
                  isSaving={screenState === "saving"}
                  showCancel={true}
                />
              </Animated.View>

              {saveError && (
                <Text className="font-nunito-regular text-sm text-accent text-center mt-2">
                  Couldn't save your goal — tap Save Goal to try again.
                </Text>
              )}
            </>
          )}

          {/* Error state */}
          {screenState === "error" && (
            <View className="items-center justify-center mt-8 px-4">
              <Text className="font-nunito-regular text-base text-text-secondary text-center">
                Couldn't load your goal — please restart the app.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

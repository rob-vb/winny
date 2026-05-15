import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { validateWinText } from "@/src/utils/winValidation";
import { EXAMPLE_PROMPTS } from "@/src/constants/examplePrompts";

// PROP CONTRACT: the prop is named `onSubmit` — NOT `onAdd`.
// 02-PATTERNS.md uses a stale `onAdd` name; ignore it. Plans 03 and 04 are authoritative.
interface WinInputAreaProps {
  onSubmit: (text: string) => Promise<void>;
}

export function WinInputArea({ onSubmit }: WinInputAreaProps) {
  const [inputText, setInputText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const placeholder = useMemo(
    () => EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)],
    []
  );

  const isDisabled = !validateWinText(inputText) || isAdding;

  const handleSubmit = async () => {
    if (isDisabled) return;
    setIsAdding(true);
    try {
      await onSubmit(inputText.trim());
      setInputText("");
      // DO NOT call blur() — keyboard stays open for next win (D-08)
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View className="border-t border-border bg-surface px-4 py-3">
      <Text className="font-nunito-extrabold text-xs text-primary uppercase mb-2">
        Add your win
      </Text>
      <View className="flex-row items-center gap-3">
        <TextInput
          className="flex-1 bg-background border border-border rounded-2xl px-4 py-3 font-nunito-regular text-base text-text-primary"
          placeholder={`e.g. ${placeholder}`}
          placeholderTextColor="#8E8E93"
          value={inputText}
          onChangeText={setInputText}
          maxLength={200}
          autoFocus={true}
          returnKeyType="done"
          multiline={false}
          onSubmitEditing={handleSubmit}
          accessibilityLabel="Win text input"
          accessibilityHint="Type your win for today, up to 200 characters"
        />
        <Pressable
          onPress={handleSubmit}
          disabled={isDisabled}
          className={`bg-primary rounded-2xl min-h-[48px] min-w-[52px] items-center justify-center px-3 ${
            isDisabled ? "opacity-50" : "opacity-100"
          }`}
          accessibilityLabel="Add win"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-up" size={21} color="#17130A" />
        </Pressable>
      </View>
    </View>
  );
}

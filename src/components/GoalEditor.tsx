import { Animated, View, Text, TextInput, Pressable } from "react-native";

interface GoalEditorProps {
  currentText: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isDirty: boolean;
  isSaving: boolean;
  showCancel: boolean;
  style?: object;
}

export function GoalEditor({
  currentText,
  onChangeText,
  onSave,
  onCancel,
  isDirty,
  isSaving,
  showCancel,
  style,
}: GoalEditorProps) {
  const canSave = isDirty && currentText.trim().length > 0 && !isSaving;
  const remaining = 500 - currentText.length;
  const showCounter = remaining <= 100;

  return (
    <Animated.View style={style}>
      <View className="bg-surface rounded-xl px-4 py-4 shadow-sm border border-border mt-2">
        <TextInput
          className="font-nunito-regular text-base text-text-primary"
          style={{ minHeight: 120 }}
          placeholder="What are you working toward?"
          placeholderTextColor="#8E8E93"
          value={currentText}
          onChangeText={onChangeText}
          maxLength={500}
          multiline={true}
          autoFocus={false}
          accessibilityLabel="Dream Goal text"
          accessibilityHint="Type your dream goal, up to 500 characters"
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

      <View className={`mt-4 ${showCancel ? "flex-row gap-3" : ""}`}>
        {showCancel && (
          <Pressable
            onPress={onCancel}
            className="flex-1 min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Cancel editing"
          >
            <Text className="font-nunito-bold text-sm text-text-secondary">
              Cancel
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          className={`bg-primary rounded-lg min-h-[44px] items-center justify-center px-3 ${
            showCancel ? "flex-1" : "w-full"
          } ${!canSave ? "opacity-50" : "opacity-100"}`}
          accessibilityRole="button"
          accessibilityLabel="Save Goal"
          accessibilityState={{ disabled: !canSave }}
          accessibilityHint={
            !canSave ? "Edit your goal text to enable saving" : undefined
          }
        >
          <Text className="font-nunito-bold text-sm text-white">Save Goal</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

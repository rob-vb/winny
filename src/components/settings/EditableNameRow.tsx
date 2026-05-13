import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface EditableNameRowProps {
  value: string;
  onSave: (name: string) => void;
  placeholder?: string;
  isLast?: boolean;
}

export function EditableNameRow({
  value,
  onSave,
  placeholder = "Add your name",
  isLast = false,
}: EditableNameRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(value);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      setEditText(value);
    }
  }, [isEditing, value]);

  const viewStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isEditing ? 0 : 1, { duration: 200 }),
  }));

  const editStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isEditing ? 1 : 0, { duration: 200 }),
  }));

  const beginEditing = () => {
    savingRef.current = false;
    setEditText(value);
    setIsEditing(true);
  };

  const save = () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const nextName = editText.trim();
    onSave(nextName);
    setIsEditing(false);
    Keyboard.dismiss();
  };

  const displayValue = value.trim() || placeholder;

  return (
    <View
      className={`min-h-[52px] overflow-hidden ${
        isLast ? "" : "border-b border-border"
      }`}
    >
      <Animated.View style={viewStyle} pointerEvents={isEditing ? "none" : "auto"}>
        <Pressable
          onPress={beginEditing}
          className="min-h-[52px] px-4 py-3 flex-row items-center gap-3"
          accessibilityRole="button"
          accessibilityLabel={`Your Name, ${value.trim() || "not set"}`}
        >
          <Ionicons name="person-outline" size={20} color="#8E8E93" />
          <Text className="font-nunito-bold text-sm text-text-primary flex-1">
            Your Name
          </Text>
          <Text className="font-nunito-regular text-base text-text-secondary">
            {displayValue}
          </Text>
        </Pressable>
      </Animated.View>
      <Animated.View
        style={editStyle}
        pointerEvents={isEditing ? "auto" : "none"}
        className="absolute inset-0"
      >
        <View className="min-h-[52px] px-4 py-3 justify-center">
          <TextInput
            className="font-nunito-regular text-base text-text-primary"
            placeholder={placeholder}
            placeholderTextColor="#8E8E93"
            value={editText}
            onChangeText={setEditText}
            onBlur={save}
            onSubmitEditing={save}
            returnKeyType="done"
            maxLength={50}
            autoFocus={isEditing}
            accessibilityLabel="Your name"
            accessibilityHint="Tap Return to save"
          />
        </View>
      </Animated.View>
    </View>
  );
}

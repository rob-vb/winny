import { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface EditableNameRowProps {
  value: string;
  onSave: (name: string) => void;
  placeholder?: string;
  isLast?: boolean;
}

export function EditableNameRow({
  value,
  onSave,
  placeholder,
  isLast = false,
}: EditableNameRowProps) {
  const { t } = useTranslation();
  const effectivePlaceholder = placeholder ?? t("editableName.placeholder");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(value);
  const savingRef = useRef(false);
  const viewOpacity = useRef(new Animated.Value(1)).current;
  const editOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isEditing) {
      setEditText(value);
    }
  }, [isEditing, value]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(viewOpacity, { toValue: isEditing ? 0 : 1, duration: 200, useNativeDriver: true }),
      Animated.timing(editOpacity, { toValue: isEditing ? 1 : 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [isEditing]);

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

  const displayValue = value.trim() || effectivePlaceholder;

  return (
    <View
      className={`min-h-[52px] overflow-hidden ${
        isLast ? "" : "border-b border-border"
      }`}
    >
      <Animated.View style={{ opacity: viewOpacity }} pointerEvents={isEditing ? "none" : "auto"}>
        <Pressable
          onPress={beginEditing}
          className="min-h-[52px] px-4 py-3 flex-row items-center gap-3"
          accessibilityRole="button"
          accessibilityLabel={t("editableName.aria", { value: value.trim() || t("editableName.notSet") })}
        >
          <Ionicons name="person-outline" size={20} color="#8E8E93" />
          <Text className="font-nunito-bold text-sm text-text-primary flex-1">
            {t("editableName.label")}
          </Text>
          <Text className="font-nunito-regular text-base text-text-secondary">
            {displayValue}
          </Text>
        </Pressable>
      </Animated.View>
      <Animated.View
        style={{ opacity: editOpacity }}
        pointerEvents={isEditing ? "auto" : "none"}
        className="absolute inset-0"
      >
        <View className="min-h-[52px] px-4 py-3 justify-center">
          <TextInput
            className="font-nunito-regular text-base text-text-primary"
            placeholder={effectivePlaceholder}
            placeholderTextColor="#8E8E93"
            value={editText}
            onChangeText={setEditText}
            onBlur={save}
            onSubmitEditing={save}
            returnKeyType="done"
            maxLength={50}
            autoFocus={isEditing}
            accessibilityLabel={t("editableName.inputAria")}
            accessibilityHint={t("editableName.inputHint")}
          />
        </View>
      </Animated.View>
    </View>
  );
}

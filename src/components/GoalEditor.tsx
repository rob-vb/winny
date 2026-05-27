import { Animated, View, Text, TextInput, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const canSave = isDirty && currentText.trim().length > 0 && !isSaving;
  const remaining = 500 - currentText.length;
  const showCounter = remaining <= 100;

  return (
    <Animated.View style={style}>
      <View className="bg-surface rounded-3xl px-4 py-4 border border-border mt-2">
        <TextInput
          className="font-nunito-regular text-base text-text-primary"
          style={{ minHeight: 120 }}
          placeholder={t("goalEditor.placeholder")}
          placeholderTextColor="#8E8E93"
          value={currentText}
          onChangeText={onChangeText}
          maxLength={500}
          multiline={true}
          autoFocus={false}
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

      <View className={`mt-4 ${showCancel ? "flex-row gap-3" : ""}`}>
        {showCancel && (
          <Pressable
            onPress={onCancel}
            className="flex-1 min-h-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={t("goalEditor.cancelAria")}
          >
            <Text className="font-nunito-bold text-sm text-text-secondary">
              {t("goalEditor.cancel")}
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          className={`bg-primary rounded-2xl min-h-[48px] items-center justify-center px-3 ${
            showCancel ? "flex-1" : "w-full"
          } ${!canSave ? "opacity-50" : "opacity-100"}`}
          accessibilityRole="button"
          accessibilityLabel={t("goalEditor.saveAria")}
          accessibilityState={{ disabled: !canSave }}
          accessibilityHint={!canSave ? t("goalEditor.saveHint") : undefined}
        >
          <Text className="font-nunito-black text-sm text-badge-ink">{t("goalEditor.save")}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

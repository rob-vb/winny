import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingsRowProps {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  isLast?: boolean;
  showChevron?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  right?: ReactNode;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  disabled = false,
  isLast = false,
  showChevron = true,
  accessibilityLabel,
  accessibilityHint,
  right,
}: SettingsRowProps) {
  const tappable = !!onPress && !disabled;
  const showRightChevron = !!onPress && showChevron;

  return (
    <Pressable
      onPress={tappable ? onPress : undefined}
      disabled={disabled}
      className={`min-h-[44px] px-4 py-3 flex-row items-center gap-3 ${
        isLast ? "" : "border-b border-border"
      } ${disabled ? "opacity-50" : "opacity-100"}`}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={disabled ? { disabled: true } : undefined}
    >
      {icon && <Ionicons name={icon} size={20} color="#8E8E93" />}
      <Text className="font-nunito-bold text-sm text-text-primary flex-1">
        {label}
      </Text>
      {value && (
        <Text className="font-nunito-regular text-base text-text-secondary mr-2">
          {value}
        </Text>
      )}
      {right}
      {showRightChevron && (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
        </View>
      )}
    </Pressable>
  );
}


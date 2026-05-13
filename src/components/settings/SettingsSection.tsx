import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface SettingsSectionProps {
  title: string;
  children?: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="mt-2 mb-6">
      <Text className="font-nunito-bold text-sm text-text-secondary mb-2 uppercase">
        {title}
      </Text>
      <View className="bg-surface rounded-xl border border-border overflow-hidden">
        {children}
      </View>
    </View>
  );
}

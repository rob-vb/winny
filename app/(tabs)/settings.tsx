import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="font-nunito-semibold text-xl text-text-primary">Settings</Text>
        <Text className="font-nunito-regular text-base text-text-secondary">
          App settings coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}

import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function GoalScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="font-nunito-semibold text-xl text-text-primary">Dream Goal</Text>
        <Text className="font-nunito-regular text-base text-text-secondary">
          Set your dream goal here soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}

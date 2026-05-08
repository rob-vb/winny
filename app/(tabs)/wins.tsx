import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function WinsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Text className="font-nunito-semibold text-xl text-text-primary">My Wins</Text>
        <Text className="font-nunito-regular text-base text-text-secondary">
          Your win history will live here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

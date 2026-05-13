import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 items-center justify-center">
        <Image
          source={require("@/assets/images/trophy.png")}
          style={{ width: 132, height: 132 }}
          resizeMode="contain"
          className="mb-8"
          accessibilityLabel="Winning Streak trophy"
        />
        <Text
          className="font-nunito-bold text-[28px] text-text-primary text-center leading-tight"
          style={{ maxWidth: 320 }}
        >
          Welcome to Winning Streak
        </Text>
        <Text
          className="font-nunito-regular text-base text-text-secondary text-center leading-relaxed mt-4"
          style={{ maxWidth: 320 }}
        >
          Log one small win at a time and build proof that you're already moving.
        </Text>
        <Pressable
          onPress={() => router.replace("/onboarding/dream-goal")}
          className="bg-primary rounded-lg min-h-[44px] px-6 mt-8 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Start Winning"
        >
          <Text className="font-nunito-bold text-sm text-white">
            Start Winning
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

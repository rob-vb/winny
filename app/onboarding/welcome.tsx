import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-7">
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("@/assets/images/trophy.png")}
            style={{ width: 320, height: 320 }}
            resizeMode="contain"
            accessibilityLabel="Winny trophy"
          />
        </View>
        <View className="items-center">
          <Text
            className="font-nunito-black text-[44px] text-badge-ink leading-tight text-center"
            style={{ maxWidth: 330 }}
          >
            Winny.
          </Text>
          <Text
            className="font-nunito-semibold text-base text-text-secondary leading-relaxed mt-4 text-center"
            style={{ maxWidth: 320 }}
          >
            Log one small win at a time and just keep winning.
          </Text>
          <Pressable
            onPress={() => router.replace("/onboarding/dream-goal")}
            className="bg-primary rounded-2xl min-h-[52px] px-6 mt-8 items-center justify-center self-stretch"
            accessibilityRole="button"
            accessibilityLabel="Start Winning"
          >
            <Text className="font-nunito-black text-base text-badge-ink">
              Start Winning
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

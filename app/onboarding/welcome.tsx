import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-7">
        <View className="flex-1 items-center justify-center">
          <Image
            source={require("@/assets/images/trophy.png")}
            style={{ width: 320, height: 320 }}
            resizeMode="contain"
            accessibilityLabel={t("home.trophyAria")}
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
            {t("onboarding.welcome.tagline")}
          </Text>
          <Pressable
            onPress={() => router.replace("/onboarding/dream-goal")}
            className="bg-primary rounded-2xl min-h-[52px] px-6 mt-8 items-center justify-center self-stretch"
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.welcome.cta")}
          >
            <Text className="font-nunito-black text-base text-badge-ink">
              {t("onboarding.welcome.cta")}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

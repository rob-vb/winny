import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/src/components/ScreenHeader";

const SECTIONS = [
  {
    heading: "What this is",
    body: "Winny is a daily habit of noticing what went right. Small wins add up — and your streak proves it.",
  },
  {
    heading: "The streak",
    body: "Your streak grows every day you log at least one win. If a day passes without a win, the streak starts fresh — and your total wins never go backward.",
  },
  {
    heading: "Your wins",
    body: "Every win you log is yours permanently. The My Wins tab shows your full history, grouped by day.",
  },
  {
    heading: "Goals",
    body: "Set Goals to anchor your wins to something that matters. Check them off when you achieve them and add new ones any time.",
  },
  {
    heading: "Why no AI yet",
    body: "V1 is free and private — your wins never leave your device. We keep it simple so you can keep it going.",
  },
] as const;

export default function HowItWorksScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4 py-4">
        <ScreenHeader
          eyebrow="How it works"
          title="Small wins become proof."
          body="Winny is built to make the next logged win obvious, fast, and worth coming back for."
          mascot
        />
        {SECTIONS.map((section) => (
          <View key={section.heading} className="mb-4 bg-surface rounded-2xl border border-border px-4 py-4">
            <Text className="font-nunito-extrabold text-base text-badge-ink mb-2">
              {section.heading}
            </Text>
            <Text className="font-nunito-regular text-base text-text-secondary leading-relaxed">
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

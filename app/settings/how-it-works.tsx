import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SECTIONS = [
  {
    heading: "What this is",
    body: "Winning Streak is a daily habit of noticing what went right. Small wins add up — and your streak proves it.",
  },
  {
    heading: "The streak",
    body: "Your streak grows every day you log at least one win. Miss a day and it resets — but your total wins never go backward.",
  },
  {
    heading: "Your wins",
    body: "Every win you log is yours permanently. The My Wins tab shows your full history, grouped by day.",
  },
  {
    heading: "Dream Goal",
    body: "Set a Dream Goal to anchor your wins to something that matters. You can update it any time.",
  },
  {
    heading: "Why no AI yet",
    body: "V1 is free and private — your wins never leave your device. We keep it simple so you can keep it going.",
  },
] as const;

export default function HowItWorksScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4 py-6">
        <Text className="font-nunito-bold text-xl text-text-primary leading-tight mb-6">
          How Winning Streak Works
        </Text>
        {SECTIONS.map((section) => (
          <View key={section.heading} className="mb-6">
            <Text className="font-nunito-bold text-sm text-text-primary mb-2">
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

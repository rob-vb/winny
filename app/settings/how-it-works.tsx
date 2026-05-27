import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ScreenHeader } from "@/src/components/ScreenHeader";

interface Section {
  heading: string;
  body: string;
}

export default function HowItWorksScreen() {
  const { t } = useTranslation();
  const sectionsRaw = t("howItWorks.sections", { returnObjects: true }) as unknown;
  const sections: Section[] = Array.isArray(sectionsRaw)
    ? (sectionsRaw as Section[])
    : [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4 py-4">
        <ScreenHeader
          eyebrow={t("howItWorks.eyebrow")}
          title={t("howItWorks.title")}
          body={t("howItWorks.body")}
          mascot
        />
        {sections.map((section) => (
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

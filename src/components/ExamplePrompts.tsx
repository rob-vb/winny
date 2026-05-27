import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { selectDailyPrompts } from "@/src/utils/promptUtils";
import { toDateKey } from "@/src/utils/dateUtils";
import { EXAMPLE_PROMPTS } from "@/src/constants/examplePrompts";

export function ExamplePrompts() {
  const { t } = useTranslation();
  const today = toDateKey();
  const pool = t("winInput.examples", {
    returnObjects: true,
    defaultValue: EXAMPLE_PROMPTS,
  }) as string[];
  const prompts = selectDailyPrompts(today, pool, 3);
  const egPrefix = t("winInput.egPrefix", { defaultValue: "e.g." });

  return (
    <View
      className="border-t border-border px-4 pt-3 pb-2 bg-background"
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
    >
      {prompts.map((prompt, i) => (
        <Text
          key={i}
          className="font-nunito-regular text-base text-text-secondary"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {egPrefix} {prompt}
        </Text>
      ))}
    </View>
  );
}

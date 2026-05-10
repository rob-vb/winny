import { View, Text } from "react-native";
import { selectDailyPrompts } from "@/src/utils/promptUtils";
import { toDateKey } from "@/src/utils/dateUtils";

export function ExamplePrompts() {
  const today = toDateKey();
  const prompts = selectDailyPrompts(today, 3);

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
          e.g. {prompt}
        </Text>
      ))}
    </View>
  );
}

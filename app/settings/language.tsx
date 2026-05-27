import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ScreenHeader } from "@/src/components/ScreenHeader";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import {
  SUPPORTED_LANGUAGES,
  mapDeviceToBase,
  nativeNameFor,
  type LocalePref,
} from "@/src/i18n/languages";
import {
  useLocalePref,
  useSetLocalePref,
} from "@/src/stores/useWinsStore";

export default function LanguagePickerScreen() {
  const { t } = useTranslation();
  const localePref = useLocalePref();
  const setLocalePref = useSetLocalePref();
  const deviceBase = mapDeviceToBase();

  const handlePick = (pref: LocalePref) => {
    if (pref === localePref) return;
    setLocalePref(pref);
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <ScrollView className="px-4" contentContainerClassName="py-4">
        <ScreenHeader
          eyebrow={t("settings.languagePickerEyebrow")}
          title={t("settings.languagePickerTitle")}
          body={t("settings.languagePickerSubtitle")}
        />
        <SettingsSection title={t("settings.languagePickerTitle")}>
          <LanguageRow
            label={t("settings.languageAuto", { name: nativeNameFor(deviceBase) })}
            selected={localePref === "auto"}
            onPress={() => handlePick("auto")}
          />
          {SUPPORTED_LANGUAGES.map((lang, idx) => (
            <LanguageRow
              key={lang.code}
              label={lang.nativeName}
              selected={localePref === lang.code}
              onPress={() => handlePick(lang.code)}
              isLast={idx === SUPPORTED_LANGUAGES.length - 1}
            />
          ))}
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

interface LanguageRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
}

function LanguageRow({ label, selected, onPress, isLast = false }: LanguageRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`min-h-[48px] px-4 py-3 flex-row items-center ${
        isLast ? "" : "border-b border-border"
      }`}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text className="font-nunito-bold text-base text-badge-ink flex-1">
        {label}
      </Text>
      {selected && (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Ionicons name="checkmark" size={20} color="#F1AF2E" />
        </View>
      )}
    </Pressable>
  );
}

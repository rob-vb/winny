import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import {
  dateToHHmm,
  formatHHmmFor12h,
  parseHHmmToDate,
} from "@/src/notifications/notificationService";
import { SettingsRow } from "./SettingsRow";

interface TimePickerRowProps {
  currentTime: string;
  onTimeSelected: (hhMm: string) => void;
  disabled?: boolean;
  isLast?: boolean;
}

export function TimePickerRow({
  currentTime,
  onTimeSelected,
  disabled = false,
  isLast = false,
}: TimePickerRowProps) {
  const { t } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => parseHHmmToDate(currentTime));

  useEffect(() => {
    setPickerDate(parseHHmmToDate(currentTime));
  }, [currentTime]);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selected) {
        onTimeSelected(dateToHHmm(selected));
      }
      return;
    }

    if (selected) {
      setPickerDate(selected);
    }
  };

  const handleDone = () => {
    setShowPicker(false);
    onTimeSelected(dateToHHmm(pickerDate));
  };

  return (
    <>
      <SettingsRow
        icon="time-outline"
        label={t("settings.reminderTime")}
        value={formatHHmmFor12h(currentTime)}
        onPress={() => setShowPicker(true)}
        disabled={disabled}
        isLast={isLast}
        accessibilityLabel={t("settings.reminderTimeAria", { time: formatHHmmFor12h(currentTime) })}
        accessibilityHint={disabled ? t("settings.reminderTimeHint") : undefined}
      />
      {Platform.OS === "ios" && showPicker && (
        <Modal transparent animationType="slide" visible>
          <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(23,19,10,0.58)" }}>
            <View className="bg-surface rounded-t-2xl px-4 pb-6 pt-4">
              <View className="flex-row justify-between mb-2">
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text className="font-nunito-bold text-sm text-text-secondary">
                    {t("common.cancel")}
                  </Text>
                </Pressable>
                <Pressable onPress={handleDone}>
                  <Text className="font-nunito-bold text-sm text-primary">
                    {t("common.done")}
                  </Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerDate}
                mode="time"
                display="spinner"
                onChange={handleChange}
                themeVariant="light"
                textColor="#17130A"
                style={{ alignSelf: "stretch" }}
              />
            </View>
          </View>
        </Modal>
      )}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
          onChange={handleChange}
        />
      )}
    </>
  );
}

import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPostWinCopy } from "@/src/copy/catalog";
import type { PostWinMoment } from "@/src/utils/postWinMoment";

interface PostWinBannerProps {
  moment: PostWinMoment;
  onDismiss?: () => void;
}

export function PostWinBanner({ moment, onDismiss }: PostWinBannerProps) {
  const copy = getPostWinCopy(moment);

  return (
    <View className="mx-4 mt-3 mb-1 bg-surface rounded-xl border border-border overflow-hidden">
      <View className="flex-row">
        <View className="w-1 bg-primary" />
        <View className="flex-1 px-4 py-3">
          <Text className="font-nunito-bold text-xl text-text-primary leading-tight">
            {copy.title}
          </Text>
          <Text className="font-nunito-regular text-base text-text-secondary leading-relaxed mt-1">
            {copy.body}
          </Text>
        </View>
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            className="min-h-[44px] min-w-[44px] items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Dismiss message"
          >
            <Ionicons name="close-outline" size={20} color="#8E8E93" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

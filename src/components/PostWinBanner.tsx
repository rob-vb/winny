import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPostWinCopy } from "@/src/copy/catalog";
import type { PostWinMoment } from "@/src/utils/postWinMoment";
import { useDisplayName } from "@/src/stores/useWinsStore";

interface PostWinBannerProps {
  moment: PostWinMoment;
  onDismiss?: () => void;
}

export function PostWinBanner({ moment, onDismiss }: PostWinBannerProps) {
  const displayName = useDisplayName();
  const copy = getPostWinCopy(moment, displayName);

  return (
    <View className="mx-4 mt-3 mb-1 bg-warm-paper rounded-3xl border border-primary overflow-hidden">
      <View className="flex-row">
        <View className="flex-1 px-4 py-4">
          <Text className="font-nunito-black text-[24px] text-badge-ink leading-tight">
            {copy.title}
          </Text>
          <Text className="font-nunito-semibold text-base text-text-primary leading-relaxed mt-1">
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

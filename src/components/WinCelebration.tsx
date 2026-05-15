import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { PIConfetti, type PIConfettiMethods } from "react-native-fast-confetti";
import { getPostWinCopy } from "@/src/copy/catalog";
import type { PostWinMoment } from "@/src/utils/postWinMoment";
import { useDisplayName } from "@/src/stores/useWinsStore";

const CELEBRATION_GIFS = [
  "https://media.giphy.com/media/o75ajIFH0QnQC3nCeD/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjRrYnpyOTBmOHJmNDhvaXA2bWEyNnRpbDF6c3RsYnR5NmdzYmkzdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/b09xElu8in7Lq/giphy.gif",
  "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3OTlvdTdnMzZicDRxZjBwZmFnOTRob3Bma3JvNXVmY3YxcW5pbXVxNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/GS9pfaxQj5hPKFGGp8/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dDJ3dWR2cTE3bTZsdWpyMTR1ZDg2dXFxeGR4MXRrN2c4cmMyYWNjMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mp1JYId8n0t3y/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dDJ3dWR2cTE3bTZsdWpyMTR1ZDg2dXFxeGR4MXRrN2c4cmMyYWNjMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Jt4y4zi519V6asgGhA/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDlmMGJwbW1vcHAzeTJlZ296bG9wdndlejYzdWlnOGNjaGZuNThkZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/YRuFixSNWFVcXaxpmX/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDlmMGJwbW1vcHAzeTJlZ296bG9wdndlejYzdWlnOGNjaGZuNThkZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/mGK1g88HZRa2FlKGbz/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDlmMGJwbW1vcHAzeTJlZ296bG9wdndlejYzdWlnOGNjaGZuNThkZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/cdXpgeB32BekIGzBNh/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ajNoeG5jajcyM2RyZ3B3ZnJna2F3MzlkaXo1amkxbHZpaGo5MWxsYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT77XWum9yH7zNkFW0/giphy.gif",
  "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
];

const { width: W, height: H } = Dimensions.get("window");

const CONFETTI_COLORS = [
  "#F1AF2E", "#FF6B6B", "#3B82F6", "#F7C217",
  "#E74C3C", "#4A90E2", "#F7DC6F", "#2ECC71",
  "#FFFFFF", "#FFD700",
];

const AUTO_DISMISS_MS_NORMAL = 4500;
const AUTO_DISMISS_MS_MEGA = 7500;

interface WinCelebrationProps {
  moment?: PostWinMoment;
  customCopy?: { eyebrow?: string; title: string; body: string };
  intensity?: "normal" | "mega";
  onDismiss: () => void;
}

export function WinCelebration({ moment, customCopy, intensity = "normal", onDismiss }: WinCelebrationProps) {
  const displayName = useDisplayName();
  const copy = customCopy ?? (moment ? getPostWinCopy(moment, displayName) : { title: "", body: "" });
  const mega = intensity === "mega";
  const contentScale = useRef(new Animated.Value(0.6)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<PIConfettiMethods>(null);
  const gifUrl = useMemo(
    () => CELEBRATION_GIFS[Math.floor(Math.random() * CELEBRATION_GIFS.length)],
    []
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(contentScale, {
        toValue: 1,
        tension: 90,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const blastTimer = setTimeout(() => {
      confettiRef.current?.restart();
    }, 50);

    const timer = setTimeout(onDismiss, mega ? AUTO_DISMISS_MS_MEGA : AUTO_DISMISS_MS_NORMAL);
    return () => {
      clearTimeout(timer);
      clearTimeout(blastTimer);
    };
  }, []);

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss celebration"
      >
        <View
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          pointerEvents="none"
        />

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <PIConfetti
            ref={confettiRef}
            count={mega ? 640 : 280}
            colors={CONFETTI_COLORS}
            blastPosition={{ x: W / 2, y: H * 0.32 }}
            blastRadius={mega ? 320 : 200}
            fallDuration={mega ? 5200 : 3800}
            blastDuration={mega ? 700 : 450}
            fadeOutOnEnd
            sizeVariation={0.4}
            flakeSize={{ width: mega ? 12 : 9, height: mega ? 14 : 11 }}
            radiusRange={[0, 4]}
          />
        </View>

        <Animated.View
          style={[
            styles.card,
            mega && styles.cardMega,
            {
              opacity: contentOpacity,
              transform: [{ scale: contentScale }],
            },
          ]}
        >
          <Image
            source={{ uri: gifUrl }}
            style={[styles.cardGif, mega && styles.cardGifMega]}
            contentFit="cover"
            autoplay
          />
          <View style={styles.cardBody_}>
            {customCopy?.eyebrow && (
              <Text style={styles.cardEyebrow}>{customCopy.eyebrow}</Text>
            )}
            {copy.title ? (
              <Text style={[styles.cardTitle, mega && styles.cardTitleMega]}>{copy.title}</Text>
            ) : null}
            <Text style={[styles.cardBody, mega && styles.cardBodyMega]}>{copy.body}</Text>
            <Text style={styles.cardHint}>Tap anywhere to continue</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(23,19,10,0.58)",
  },
  card: {
    position: "absolute",
    alignSelf: "center",
    top: "30%",
    backgroundColor: "#FFF7E8",
    borderRadius: 24,
    overflow: "hidden",
    width: "80%",
    alignItems: "center",
    shadowColor: "#B87413",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  cardMega: {
    top: "18%",
    width: "90%",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.36,
    shadowRadius: 26,
    elevation: 16,
  },
  cardGif: {
    width: "100%",
    height: 200,
  },
  cardGifMega: {
    height: 260,
  },
  cardEyebrow: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 13,
    letterSpacing: 2,
    color: "#B87413",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  cardTitleMega: {
    fontSize: 34,
    lineHeight: 40,
    marginBottom: 14,
  },
  cardBodyMega: {
    fontSize: 17,
    lineHeight: 26,
  },
  cardBody_: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  cardTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    color: "#17130A",
    textAlign: "center",
    marginBottom: 8,
  },
  cardBody: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: "#1C1C1E",
    textAlign: "center",
    lineHeight: 22,
  },
  cardHint: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 18,
  },
});

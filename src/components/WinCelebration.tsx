import { useEffect, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { getPostWinCopy } from "@/src/copy/catalog";
import type { PostWinMoment } from "@/src/utils/postWinMoment";
import { useDisplayName } from "@/src/stores/useWinsStore";
import {
  getRandomCelebrationGif,
  pingGiphyAnalytics,
  type CelebrationGif,
} from "@/src/services/giphy";

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
  const { t } = useTranslation();
  const displayName = useDisplayName();
  const copy = customCopy ?? (moment ? getPostWinCopy(moment, displayName) : { title: "", body: "" });
  const mega = intensity === "mega";
  const contentScale = useRef(new Animated.Value(0.6)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<PIConfettiMethods>(null);
  const [gif, setGif] = useState<CelebrationGif | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRandomCelebrationGif().then((g) => {
      if (cancelled || !g) return;
      setGif(g);
      pingGiphyAnalytics(g.analytics.onload);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
        accessibilityLabel={t("celebration.dismissAria")}
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
          <View style={[styles.cardHero, mega && styles.cardHeroMega]}>
            {gif && (
              <Image
                source={{ uri: gif.url }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                autoplay
                accessibilityLabel={t("celebration.aria")}
              />
            )}
            <View style={styles.giphyAttribution} pointerEvents="none">
              <Text style={styles.giphyAttributionText}>Powered by GIPHY</Text>
            </View>
          </View>
          <View style={styles.cardBody_}>
            {customCopy?.eyebrow && (
              <Text style={styles.cardEyebrow}>{customCopy.eyebrow}</Text>
            )}
            {copy.title ? (
              <Text style={[styles.cardTitle, mega && styles.cardTitleMega]}>{copy.title}</Text>
            ) : null}
            <Text style={[styles.cardBody, mega && styles.cardBodyMega]}>{copy.body}</Text>
            <Text style={styles.cardHint}>{t("celebration.hint")}</Text>
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
  cardHero: {
    width: "100%",
    height: 200,
    backgroundColor: "#17130A",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(184,116,19,0.28)",
  },
  cardHeroMega: {
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
  giphyAttribution: {
    position: "absolute",
    bottom: 6,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  giphyAttributionText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 9,
    letterSpacing: 0.6,
    color: "#FFFFFF",
  },
});

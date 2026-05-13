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
import { getPostWinCopy } from "@/src/copy/catalog";
import type { PostWinMoment } from "@/src/utils/postWinMoment";

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

const COLORS = [
  "#F5A623", "#FF6B6B", "#4ECDC4", "#45B7D1",
  "#96CEB4", "#FFEAA7", "#FF9FF3", "#A29BFE",
  "#FD79A8", "#00CEC9", "#FDCB6E", "#6C5CE7",
  "#FF7675", "#74B9FF", "#55EFC4", "#FAB1A0",
];

const CONFETTI_COUNT = 50;
const AUTO_DISMISS_MS = 4000;

interface ConfettiPiece {
  id: number;
  startX: number;
  w: number;
  h: number;
  color: string;
  isCircle: boolean;
  delay: number;
  duration: number;
  swayTo: number;
  rotations: number;
  yAnim: Animated.Value;
  swayAnim: Animated.Value;
  rotateAnim: Animated.Value;
  opacityAnim: Animated.Value;
}

function makePieces(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const w = 7 + Math.random() * 9;
    const isCircle = Math.random() > 0.6;
    return {
      id: i,
      startX: Math.random() * (W - 12),
      w,
      h: isCircle ? w : w * (1.4 + Math.random()),
      color: COLORS[i % COLORS.length],
      isCircle,
      delay: Math.random() * 600,
      duration: 2400 + Math.random() * 1400,
      swayTo: (Math.random() - 0.5) * 110,
      rotations: 2 + Math.random() * 4,
      yAnim: new Animated.Value(-20),
      swayAnim: new Animated.Value(0),
      rotateAnim: new Animated.Value(0),
      opacityAnim: new Animated.Value(1),
    };
  });
}

interface WinCelebrationProps {
  moment: PostWinMoment;
  onDismiss: () => void;
}

export function WinCelebration({ moment, onDismiss }: WinCelebrationProps) {
  const copy = getPostWinCopy(moment);
  const pieces = useRef<ConfettiPiece[]>(makePieces()).current;
  const contentScale = useRef(new Animated.Value(0.6)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
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

    pieces.forEach((p) => {
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.parallel([
          Animated.timing(p.yAnim, {
            toValue: H + 80,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.swayAnim, {
            toValue: p.swayTo,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotateAnim, {
            toValue: p.rotations,
            duration: p.duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(p.duration * 0.6),
            Animated.timing(p.opacityAnim, {
              toValue: 0,
              duration: p.duration * 0.4,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start();
    });

    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
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

        {pieces.map((p) => {
          const rotate = p.rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", "360deg"],
          });
          return (
            <Animated.View
              key={p.id}
              pointerEvents="none"
              style={{
                position: "absolute",
                left: p.startX,
                top: 0,
                width: p.w,
                height: p.isCircle ? p.w : p.h,
                backgroundColor: p.color,
                borderRadius: p.isCircle ? p.w / 2 : 3,
                transform: [
                  { translateY: p.yAnim },
                  { translateX: p.swayAnim },
                  { rotate },
                ],
                opacity: p.opacityAnim,
              }}
            />
          );
        })}

        <Animated.View
          style={[
            styles.card,
            {
              opacity: contentOpacity,
              transform: [{ scale: contentScale }],
            },
          ]}
        >
          <Image
            source={{ uri: gifUrl }}
            style={styles.cardGif}
            contentFit="cover"
            autoplay
          />
          <View style={styles.cardBody_}>
            <Text style={styles.cardTitle}>{copy.title}</Text>
            <Text style={styles.cardBody}>{copy.body}</Text>
            <Text style={styles.cardHint}>Tap anywhere to continue</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    position: "absolute",
    alignSelf: "center",
    top: "30%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  cardGif: {
    width: "100%",
    height: 200,
  },
  cardBody_: {
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  cardTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 22,
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 8,
  },
  cardBody: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: "#6B6B6F",
    textAlign: "center",
    lineHeight: 22,
  },
  cardHint: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    color: "#C7C7CC",
    marginTop: 18,
  },
});

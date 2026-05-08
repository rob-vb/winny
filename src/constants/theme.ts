// Color tokens — mirrors tailwind.config.js extend.colors
// Use NativeWind className utilities in components; use these for imperative style objects only
export const Colors = {
  background: "#FAF8F4",
  gold: "#F7C217",
  primary: "#F5A623",
  textPrimary: "#1C1C1E",
  textSecondary: "#8E8E93",
  surface: "#FFFFFF",
  border: "#F0EDE8",
  accent: "#FF6B6B",
  confettiRed: "#E74C3C",
  confettiBlue: "#4A90E2",
  confettiYellow: "#F7DC6F",
  confettiGreen: "#2ECC71",
} as const;

// Font family constants — mirrors tailwind.config.js extend.fontFamily
// Use NativeWind className in components; use these for tabBarLabelStyle etc. (non-NativeWind contexts)
export const Fonts = {
  regular: "Nunito_400Regular",
  semibold: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  extrabold: "Nunito_800ExtraBold",
  black: "Nunito_900Black",
} as const;

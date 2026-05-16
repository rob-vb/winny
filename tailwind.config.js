/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F4",
        gold: "#F7C217",
        primary: "#F1AF2E",
        "active-orange": "#F5A623",
        coral: "#FF6B6B",
        blue: "#3B82F6",
        "badge-ink": "#17130A",
        "warm-paper": "#FFF7E8",
        "sticker-shadow": "#B87413",
        "text-primary": "#1C1C1E",
        "text-secondary": "#8E8E93",
        surface: "#FFFDF8",
        border: "#F0EDE8",
        accent: "#FF6B6B",
        "confetti-red": "#E74C3C",
        "confetti-blue": "#4A90E2",
        "confetti-yellow": "#F7DC6F",
        "confetti-green": "#2ECC71",
      },
      fontFamily: {
        "nunito-regular": ["Nunito_400Regular"],
        "nunito-semibold": ["Nunito_600SemiBold"],
        "nunito-bold": ["Nunito_700Bold"],
        "nunito-extrabold": ["Nunito_800ExtraBold"],
        "nunito-black": ["Nunito_900Black"],
      },
    },
  },
  plugins: [],
};

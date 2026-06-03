import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "SF Pro Display",
          "SF Pro Text",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        // iOS-inspired palette
        "ios-bg": "#f2f2f7",
        "ios-surface": "#ffffff",
        "ios-accent": "#007aff",
        "ios-success": "#34c759",
        "ios-warning": "#ff9500",
        "ios-danger": "#ff3b30",
        "ios-text": "#1c1c1e",
        "ios-text2": "#8e8e93",
        "ios-separator": "rgba(60,60,67,0.12)",
        // Glass surface tones
        "glass-light": "rgba(255,255,255,0.72)",
        "glass-dark": "rgba(28,28,30,0.72)",
      },
      backdropBlur: {
        glass: "20px",
        "glass-sm": "10px",
        "glass-lg": "30px",
      },
    },
  },
  plugins: [],
};
export default config;

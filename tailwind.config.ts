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
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // PRD-defined palette
        "app-bg": "#f4f6f9",
        "app-surface": "#ffffff",
        "app-accent": "#1d72f5",
        "app-success": "#0ea56b",
        "app-warning": "#f59e0b",
        "app-danger": "#e53935",
        "app-text": "#111827",
        "app-text2": "#6b7280",
      },
    },
  },
  plugins: [],
};
export default config;

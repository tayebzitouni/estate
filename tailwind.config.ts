import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0D1B2A",
          emerald: "#10B981",
          sand: "#E9D8B6",
          gray: "#F2F4F7",
          white: "#FFFFFF"
        },
        border: "#D5DCE5",
        input: "#D5DCE5",
        ring: "#10B981",
        background: "#FFFFFF",
        foreground: "#0D1B2A",
        primary: {
          DEFAULT: "#0D1B2A",
          foreground: "#FFFFFF"
        },
        secondary: {
          DEFAULT: "#F2F4F7",
          foreground: "#0D1B2A"
        },
        accent: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF"
        },
        muted: {
          DEFAULT: "#F2F4F7",
          foreground: "#51606F"
        }
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top right, rgba(16,185,129,0.18), transparent 34%), linear-gradient(135deg, rgba(13,27,42,0.98), rgba(13,27,42,0.9))"
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem"
      },
      fontFamily: {
        sans: ["var(--font-latin)", "sans-serif"],
        arabic: ["var(--font-arabic)", "sans-serif"]
      },
      boxShadow: {
        panel: "0 16px 40px rgba(13, 27, 42, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;

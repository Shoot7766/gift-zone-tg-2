import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gz: {
          bg: "#070a0f",
          surface: "#101622",
          elevated: "#161d2e",
          border: "rgba(255,255,255,0.08)",
          muted: "#8b95a8",
          accent: "#34d399",
          accent2: "#60a5fa",
          gold: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 18px 50px rgba(0,0,0,0.45)",
        glow: "0 0 40px rgba(52,211,153,0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.35rem",
      },
      animation: {
        shimmer: "shimmer 1.4s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

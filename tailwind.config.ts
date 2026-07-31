import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#DCDDEF",
          dark: "#C9CADF",
        },
        ink: {
          DEFAULT: "#0B0B10",
          soft: "#1A1A22",
        },
        rec: {
          DEFAULT: "#F5310B",
          light: "#FF6644",
        },
        accent: {
          DEFAULT: "#F5310B",
          light: "#FF6644",
          dark: "#C7280A",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-bebas)", "var(--font-montserrat)", "system-ui", "sans-serif"],
        mono: ["var(--font-azeret-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      keyframes: {
        "pulse-rec": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        roll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-rec": "pulse-rec 1.6s ease-in-out infinite",
        roll: "roll 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

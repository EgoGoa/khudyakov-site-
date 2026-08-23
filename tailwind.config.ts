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
        glow: {
          DEFAULT: "#00D2FF",
          deep: "#0B2551",
          pale: "#A4F4FD",
        },
        orange: {
          DEFAULT: "#FF6A3D",
          bright: "#FF8A5C",
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
        shiny: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "flare-blink": {
          "0%, 100%": { opacity: "0.18", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.08)" },
        },
        "flare-drift": {
          "0%": { backgroundPosition: "var(--p0)", opacity: "0.72", transform: "scale(1.1)" },
          "10%": { opacity: "0.16", transform: "scale(0.97)" },
          "20%": { backgroundPosition: "var(--p1)", opacity: "0.72", transform: "scale(1.1)" },
          "30%": { opacity: "0.16", transform: "scale(0.97)" },
          "40%": { backgroundPosition: "var(--p2)", opacity: "0.72", transform: "scale(1.1)" },
          "50%": { opacity: "0.16", transform: "scale(0.97)" },
          "60%": { backgroundPosition: "var(--p3)", opacity: "0.72", transform: "scale(1.1)" },
          "70%": { opacity: "0.16", transform: "scale(0.97)" },
          "80%": { backgroundPosition: "var(--p4)", opacity: "0.72", transform: "scale(1.1)" },
          "90%": { opacity: "0.16", transform: "scale(0.97)" },
          "100%": { backgroundPosition: "var(--p0)", opacity: "0.72", transform: "scale(1.1)" },
        },
      },
      animation: {
        "pulse-rec": "pulse-rec 1.6s ease-in-out infinite",
        roll: "roll 32s linear infinite",
        shiny: "shiny 6s linear infinite",
        "flare-blink": "flare-blink 18s ease-in-out infinite",
        "flare-drift": "flare-drift 48s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

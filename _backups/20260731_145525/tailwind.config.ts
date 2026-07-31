import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0B10",
        },
        accent: {
          DEFAULT: "#FF7A45",
          light: "#FFA379",
          dark: "#E85A2A",
        },
        violet: {
          DEFAULT: "#7C6FEF",
          light: "#A79BFF",
          dark: "#5B4FD6",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-unbounded)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
      keyframes: {
        "pulse-rec": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "pulse-rec": "pulse-rec 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

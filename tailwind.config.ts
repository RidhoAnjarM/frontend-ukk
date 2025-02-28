import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#000957",
        putih1: "#F5F5F7",
        putih2: "#EFEFEF",
        putih3: "#E1E1E1",
        hitam1: "#1E252B",
        hitam2: "#262D34",
        hitam3: "#2C353D",
        hitam4: "#4A5157",
        abu: "#C5D0E6",
        ungu: "#1CA417",
      },
      fontFamily: {
        ruda: ["var(--font-ruda)", "sans-serif"],
      }
    },
  },
  plugins: [],
} satisfies Config;

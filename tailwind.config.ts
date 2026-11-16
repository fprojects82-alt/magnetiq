import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#B7202E",
          dark: "#8F1621",
          light: "#E85C68",
          cream: "#F6F1EA",
        },
      },
      fontFamily: {
        script: ["var(--font-script)"],
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eaf7ee",
          100: "#cdecd5",
          200: "#9bd9ab",
          300: "#69c682",
          400: "#37b358",
          500: "#1e9b3f",
          600: "#177a32",
          700: "#115a25",
          800: "#0c3f1a",
          900: "#062711",
        },
      },
    },
  },
  plugins: [],
};

export default config;

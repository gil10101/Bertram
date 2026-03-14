import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "../frontend/src/components/landing-v2/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        floral: { DEFAULT: "#FFFCF2" },
        dust: { DEFAULT: "#ccc5b9", 400: "#ccc5b9", 500: "#ab9f8b" },
        charcoal: { DEFAULT: "#403d39", 400: "#403d39" },
        carbon: { DEFAULT: "#252422", 500: "#1e1d1b" },
        paprika: { DEFAULT: "#eb5e28" },
      },
    },
  },
  plugins: [],
};

export default config;

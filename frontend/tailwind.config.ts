import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        selected: "hsl(var(--selected))",
        faint: "hsl(var(--faint-text))",
        "secondary-text": "hsl(var(--secondary-text))",
        star: "hsl(var(--star))",
        "subtle-accent": "hsl(var(--subtle-accent))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Raw palette for direct use */
        floral: {
          DEFAULT: "#FFFCF2",
          50: "#fffefc",
          100: "#fffef9",
          200: "#fffdf6",
          300: "#fffcf3",
          400: "#FFFCF2",
          500: "#ffe48d",
          600: "#ffcd2a",
          700: "#c69800",
          800: "#634c00",
        },
        dust: {
          DEFAULT: "#ccc5b9",
          50: "#f5f3f1",
          100: "#eae8e3",
          200: "#e0dcd4",
          300: "#d6d0c6",
          400: "#ccc5b9",
          500: "#ab9f8b",
          600: "#877962",
          700: "#5a5141",
          800: "#2d2821",
        },
        charcoal: {
          DEFAULT: "#403d39",
          50: "#dbd9d6",
          100: "#b6b2ad",
          200: "#928c84",
          300: "#6a655e",
          400: "#403d39",
          500: "#34312e",
          600: "#272523",
          700: "#1a1917",
          800: "#0d0c0c",
        },
        carbon: {
          DEFAULT: "#252422",
          50: "#d5d4d1",
          100: "#aba8a4",
          200: "#807d76",
          300: "#53514c",
          400: "#252422",
          500: "#1e1d1b",
          600: "#161615",
          700: "#0f0e0e",
          800: "#070707",
        },
        paprika: {
          DEFAULT: "#eb5e28",
          50: "#fbdfd4",
          100: "#f7bfa9",
          200: "#f39f7e",
          300: "#ef7f53",
          400: "#eb5e28",
          500: "#ca4713",
          600: "#97350e",
          700: "#652309",
          800: "#321205",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "text-shimmer": {
          "0%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "text-shimmer": "text-shimmer 3s ease-in-out infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;

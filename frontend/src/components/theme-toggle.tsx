"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({
  className = "",
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={
        "inline-flex items-center justify-center rounded-lg transition-colors " + className
      }
      style={{ width: size + 16, height: size + 16 }}
    >
      {/* Render icon only after mount to avoid hydration mismatch */}
      {mounted ? (
        isDark ? <Sun size={size} /> : <Moon size={size} />
      ) : (
        <span style={{ width: size, height: size }} aria-hidden />
      )}
    </button>
  );
}

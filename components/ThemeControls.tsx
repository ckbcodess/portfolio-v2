"use client";

import { useTheme } from "next-themes";
import { useThemeColor, ThemeColor } from "@/components/theme-color-provider";
import { Sun, Moon, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { flushSync } from "react-dom";

export default function ThemeControls() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleThemeChange = (newTheme: string, e?: React.MouseEvent) => {
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0 at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const handleColorChange = (newColor: ThemeColor, e?: React.MouseEvent) => {
    if (!document.startViewTransition) {
      setThemeColor(newColor);
      return;
    }

    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setThemeColor(newColor);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0 at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const colors: ThemeColor[] = ["neutral", "red", "green", "blue"];

  return (
    <div className="flex items-center gap-3">
      {/* Light/Dark Toggle */}
      <button
        onClick={(e) => handleThemeChange(theme === "dark" ? "light" : "dark", e)}
        className="text-foreground/80 hover:text-foreground transition-colors p-1 -m-1"
        aria-label="Toggle dark mode"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={theme === "dark" ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Theme Color Dots */}
      <div className="flex items-center gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            onClick={(e) => handleColorChange(c, e)}
            className="group relative flex items-center justify-center p-1 -m-1"
            aria-label={`Switch to ${c} theme`}
          >
            <motion.div
              animate={{
                scale: themeColor === c ? 1.2 : 1,
                opacity: themeColor === c ? 1 : 0.3,
              }}
              whileHover={{ opacity: 0.8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Circle
                size={8}
                fill="currentColor"
                className="text-foreground transition-colors"
              />
            </motion.div>
            {themeColor === c && (
              <motion.div
                layoutId="active-dot"
                className="absolute -bottom-1 w-0.5 h-0.5 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

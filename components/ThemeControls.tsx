"use client";

import { useTheme } from "next-themes";
import { useThemeColor, ThemeColor } from "@/components/theme-color-provider";
import { Sun, Moon, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function ThemeControls({ forceLight }: { forceLight?: boolean }) {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 0) }, []);

  if (!mounted) return null;

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleColorChange = (newColor: ThemeColor) => {
    setThemeColor(newColor);
  };

  const colors: ThemeColor[] = ["neutral", "red", "green", "blue"];

  return (
    <div className="flex items-center gap-3">
      {/* Light/Dark Toggle */}
      <Tooltip>
        <TooltipTrigger
          onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
          className={`${
            forceLight ? "text-white/80 hover:text-white" : "text-foreground/80 hover:text-foreground"
          } transition-colors p-3 -m-3 md:p-1 md:-m-1 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm`}
          aria-label="Toggle dark mode"
        >
          <div className="flex items-center justify-center">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

"use client";

import { useTheme } from "next-themes";
import { useThemeColor, ThemeColor } from "@/components/theme-color-provider";
import { usePathname } from "next/navigation";
import { Sun, Moon, Circle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function ThemeControls({ isHero }: { isHero?: boolean }) {
  const pathname = usePathname();
  const isCaseStudy = pathname.startsWith("/work/");
  const activeHero = isHero ?? isCaseStudy; // Fallback to isCaseStudy if isHero not provided
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
          data-cursor="pointer"
          className={`${
            activeHero ? "text-white" : "text-foreground/60 hover:text-foreground"
          } transition-colors p-3 -m-3 md:p-1 md:-m-1 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm`}
          aria-label="Toggle dark mode"
        >
          <div className="flex items-center justify-center">
              {theme === "dark" ? (
                <Sun size={14} stroke={activeHero ? "white" : "currentColor"} />
              ) : (
                <Moon size={14} stroke={activeHero ? "white" : "currentColor"} />
              )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

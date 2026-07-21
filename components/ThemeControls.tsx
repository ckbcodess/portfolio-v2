"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function ThemeControls({ isHero = true }: { isHero?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  if (!mounted) return null;

  const currentTheme = theme || "system";

  return (
    <div ref={containerRef} className="relative flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            data-cursor="pointer"
            className="transition-colors p-1 -m-1 flex items-center justify-center cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-sm text-white/70 hover:text-white"
            aria-label="Theme menu"
          >
            <div className="flex items-center justify-center">
              {currentTheme === "dark" ? (
                <Moon size={13} stroke="currentColor" />
              ) : currentTheme === "light" ? (
                <Sun size={13} stroke="currentColor" />
              ) : (
                <Monitor size={13} stroke="currentColor" />
              )}
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          Theme mode: {currentTheme}
        </TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 z-[1050] bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-1 shadow-2xl flex flex-col gap-0.5 min-w-[110px]"
          >
            {[
              { key: "light", label: "Light", icon: Sun },
              { key: "dark", label: "Dark", icon: Moon },
              { key: "system", label: "System", icon: Monitor },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setTheme(key);
                  setDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-normal transition-colors text-left w-full cursor-pointer ${
                  currentTheme === key
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={12} />
                <span>{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

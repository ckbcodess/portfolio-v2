"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { useThemeColor, ThemeColor } from "@/components/theme-color-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const colors: { key: ThemeColor; label: string; bgClass: string }[] = [
  { key: "neutral", label: "Neutral", bgClass: "bg-neutral-500" },
  { key: "red", label: "Red", bgClass: "bg-red-500" },
  { key: "green", label: "Green", bgClass: "bg-green-500" },
  { key: "blue", label: "Blue", bgClass: "bg-blue-500" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();
  const [mounted, setMounted] = useState(false);
  const [isThemeTrayOpen, setIsThemeTrayOpen] = useState(false);
  const [isInteractable, setIsInteractable] = useState(false);
  const trayRef = useRef<HTMLDivElement>(null);

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
          duration: 500,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isThemeTrayOpen) {
      timeoutId = setTimeout(() => {
        setIsInteractable(true);
      }, 500);
    } else {
      setIsInteractable(false);
    }

    return () => clearTimeout(timeoutId);
  }, [isThemeTrayOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(event.target as Node)) {
        setIsThemeTrayOpen(false);
      }
    };

    if (isThemeTrayOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isThemeTrayOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[80]">
      <div ref={trayRef} className="relative z-10 flex flex-col items-end pointer-events-auto">
        <div
          role="dialog"
          aria-label="Theme settings"
          className={`absolute bottom-full right-0 mb-3 flex flex-col items-center w-[200px] rounded-2xl relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/10 dark:border-white/5 p-3 origin-bottom-right transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity] backdrop-blur-md backdrop-saturate-150 ${
            isThemeTrayOpen
              ? "scale-100 opacity-100"
              : "scale-50 opacity-0 pointer-events-none"
          } ${isInteractable && isThemeTrayOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          {/* Luminosity Layer (Light Mode) */}
          <div 
            className="absolute inset-0 mix-blend-luminosity dark:hidden pointer-events-none" 
            style={{ backgroundColor: 'var(--glass-bg)', opacity: 0.4 }}
          />
          {/* Vibrancy Layer */}
          <div 
            className="absolute inset-0 mix-blend-overlay dark:mix-blend-soft-light pointer-events-none opacity-80 dark:opacity-75" 
            style={{ backgroundColor: 'var(--glass-bg)' }}
          />

          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Light/Dark Toggle */}
            <div className="flex w-full gap-1 p-1 mb-3 bg-foreground/10 rounded-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleThemeChange("light", e)}
                className={`flex-1 h-8 rounded-full ${theme === "light" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleThemeChange("dark", e)}
                className={`flex-1 h-8 rounded-full ${theme === "dark" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleThemeChange("system", e)}
                className={`flex-1 h-8 rounded-full ${theme === "system" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/></svg>
              </Button>
            </div>

            <div className="w-full h-[1px] bg-border/40 mb-3" />

            {/* Color Grid */}
            <div className="flex flex-wrap justify-center gap-2">
              {colors.map(({ key, label, bgClass }) => (
                <Tooltip key={key}>
                  <TooltipTrigger
                    onClick={(e) => handleColorChange(key, e)}
                    aria-label={label}
                    className="group relative flex h-8 w-8 shrink-0 items-center justify-center focus:outline-none"
                  >
                    <span
                      className={`h-[16px] w-[16px] shrink-0 rounded-full ${bgClass} shadow-sm transition-all duration-300 ${
                        themeColor === key ? "scale-125 opacity-100 ring-2 ring-foreground/30 ring-offset-2 ring-offset-background" : "scale-100 opacity-70 group-hover:scale-110 group-hover:opacity-100"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="text-xs">
                    <span className="capitalize">{label}</span>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsThemeTrayOpen(!isThemeTrayOpen)}
          aria-label="Toggle theme tray"
          aria-expanded={isThemeTrayOpen}
          aria-haspopup="dialog"
          className={`h-[48px] w-[48px] shrink-0 rounded-full relative overflow-hidden flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/10 dark:border-white/5 backdrop-blur-md backdrop-saturate-150 transition-transform duration-300 hover:scale-110 active:scale-95 focus-visible:ring-0`}
        >
          {/* Luminosity Layer (Light Mode) */}
          <div 
            className="absolute inset-0 mix-blend-luminosity dark:hidden pointer-events-none transition-colors duration-300" 
            style={{ backgroundColor: 'var(--glass-bg)', opacity: 0.4 }}
          />
          {/* Vibrancy Layer */}
          <div 
            className="absolute inset-0 mix-blend-overlay dark:mix-blend-soft-light pointer-events-none transition-opacity duration-300" 
            style={{ backgroundColor: 'var(--glass-bg)', opacity: isThemeTrayOpen ? 1 : 0.8 }}
          />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`relative z-10 text-foreground transition-transform duration-500 ${isThemeTrayOpen ? "rotate-90" : "rotate-0"}`}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeColor = "neutral" | "red" | "blue" | "green";

interface ThemeColorContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

export function ThemeColorProvider({ children }: { children: React.ReactNode }) {
  const [themeColor, setThemeColorState] = useState<ThemeColor>("neutral");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedColor = localStorage.getItem("app-color-theme") as ThemeColor | null;
    if (savedColor) {
      setThemeColorState(savedColor);
      document.documentElement.setAttribute("data-theme", savedColor);
    } else {
      document.documentElement.setAttribute("data-theme", "neutral");
    }
  }, []);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem("app-color-theme", color);
    document.documentElement.setAttribute("data-theme", color);
  };

  return (
    <ThemeColorContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  const context = useContext(ThemeColorContext);
  if (!context) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
}

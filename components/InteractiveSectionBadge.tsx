"use client";

import React, { useState, useEffect } from "react";
import { useSound } from "@/components/SoundProvider";
import { useTheme } from "next-themes";

interface ColorPreset {
  bg: string;
  text: string;
  border: string;
  shadow: string;
}

const VIBRANT_PRESETS: ColorPreset[] = [
  // 1. Neon Yellow-Green (from reference)
  {
    bg: "linear-gradient(180deg, #d2ff00 0%, #aae600 100%)",
    text: "#000000",
    border: "#d2ff00",
    shadow: "0 0 16px rgba(210, 255, 0, 0.45)",
  },
  // 2. Cyan Glow
  {
    bg: "linear-gradient(180deg, #00fff6 0%, #00dcd2 100%)",
    text: "#000000",
    border: "#00fff6",
    shadow: "0 0 16px rgba(0, 255, 246, 0.45)",
  },
  // 3. Electric Pink
  {
    bg: "linear-gradient(180deg, #ff007f 0%, #e6006f 100%)",
    text: "#ffffff",
    border: "#ff007f",
    shadow: "0 0 16px rgba(255, 0, 127, 0.45)",
  },
  // 4. Vibrant Orange
  {
    bg: "linear-gradient(180deg, #ff6c00 0%, #e65200 100%)",
    text: "#ffffff",
    border: "#ff6c00",
    shadow: "0 0 16px rgba(255, 108, 0, 0.45)",
  },
  // 5. Bright Violet
  {
    bg: "linear-gradient(180deg, #a855f7 0%, #7c3aed 100%)",
    text: "#ffffff",
    border: "#a855f7",
    shadow: "0 0 16px rgba(168, 85, 247, 0.45)",
  },
  // 6. Cyber Green
  {
    bg: "linear-gradient(180deg, #39ff14 0%, #1bc203 100%)",
    text: "#000000",
    border: "#39ff14",
    shadow: "0 0 16px rgba(57, 255, 20, 0.45)",
  }
];

interface InteractiveSectionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function InteractiveSectionBadge({
  children,
  className = "",
}: InteractiveSectionBadgeProps) {
  const { playClickDown, playClickUp } = useSound();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  // Initialize random color preset on mount and resolve theme hydration
  useEffect(() => {
    setMounted(true);
    setColorIndex(Math.floor(Math.random() * VIBRANT_PRESETS.length));
  }, []);

  const currentPreset = VIBRANT_PRESETS[colorIndex];

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Pick a DIFFERENT random color for the next hover
    setColorIndex((prevIndex) => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * VIBRANT_PRESETS.length);
      } while (nextIndex === prevIndex && VIBRANT_PRESETS.length > 1);
      return nextIndex;
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Play satisfying mechanical thock sound
    playClickDown();
    setTimeout(() => {
      playClickUp();
    }, 85);

    // Just cycle color index on click
    setColorIndex((prevIndex) => (prevIndex + 1) % VIBRANT_PRESETS.length);
  };

  // Determine light or dark mode theme colors
  const isDark = !mounted || resolvedTheme === "dark";
  const defaultBg = isDark ? "#262626" : "#ededed";
  const defaultText = isDark ? "#ededed" : "#262626";
  const defaultBorder = isDark ? "#262626" : "#ededed";

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor="pointer"
      className={`relative inline-flex items-center justify-center cursor-pointer select-none overflow-visible outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-full w-7 h-7 aspect-square shrink-0 transition-all duration-300 font-sans text-xs font-medium leading-none ${className}`}
      style={{
        background: isHovered && currentPreset ? currentPreset.bg : defaultBg,
        color: isHovered && currentPreset ? currentPreset.text : defaultText,
        border: `1px solid ${isHovered && currentPreset ? currentPreset.border : defaultBorder}`,
      }}
    >
      {children}
    </button>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { FeatureTabItem } from "@/lib/types";

interface FeatureTabsProps {
  tabs: FeatureTabItem[];
  autoPlayDuration?: number; // duration in seconds (default: 5)
}

export default function FeatureTabs({ tabs, autoPlayDuration = 5 }: FeatureTabsProps) {
  const [active, setActive] = useState(0);
  const [key, setKey] = useState(0); // Used to force reset animation/timer on click

  if (!tabs || tabs.length === 0) return null;

  const currentTab = tabs[active] || tabs[0];

  // Auto-advance to the next tab when timer completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((prev) => (prev + 1) % tabs.length);
      setKey((prev) => prev + 1);
    }, autoPlayDuration * 1000);

    return () => clearTimeout(timer);
  }, [active, key, tabs.length, autoPlayDuration]);

  const handleTabClick = (idx: number) => {
    setActive(idx);
    setKey((prev) => prev + 1); // Reset timer & animation progress on click
  };

  return (
    <div className="w-full flex flex-col gap-5 mt-8">
      {/* Tab Selectors (Centered directly on top of the image) */}
      <div 
        role="tablist"
        className="flex flex-row items-center justify-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide py-1 w-full"
      >
        {tabs.map((tab, idx) => {
          const isActive = active === idx;
          return (
            <button
              key={tab.name}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(idx)}
              className={`relative px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-sans transition-all duration-150 shrink-0 outline-none select-none overflow-hidden ${
                isActive
                  ? "text-foreground font-medium"
                  : "text-foreground opacity-35 hover:opacity-60"
              }`}
            >
              {/* Entire Tab Button Filling Slowly from Left to Right */}
              {isActive && (
                <motion.div
                  key={`fill-${active}-${key}`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: autoPlayDuration, ease: "linear" }}
                  className="absolute inset-0 bg-foreground/15 dark:bg-white/20 rounded-md pointer-events-none -z-10"
                />
              )}

              <span className="relative z-10">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Media (Image / Video) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full"
        >
          {currentTab.videoSrc ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
              <video
                src={currentTab.videoSrc}
                controls
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ) : currentTab.imageSrc ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={currentTab.imageSrc}
                alt={currentTab.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Feature Description Paragraph Only (Centered with balanced text wrapping) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-[420px] mx-auto text-center"
        >
          <p className="text-sm text-muted-foreground leading-relaxed [text-wrap:balance]">
            {currentTab.description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

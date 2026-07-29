"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { FeatureTabItem } from "@/lib/types";

interface FeatureTabsProps {
  tabs: FeatureTabItem[];
  autoPlayDuration?: number; // duration in seconds (default: 5)
}

export default function FeatureTabs({ tabs, autoPlayDuration = 5 }: FeatureTabsProps) {
  const [active, setActive] = useState(0);
  const [key, setKey] = useState(0); // Used to force reset animation/timer on tab switch
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!tabs || tabs.length === 0) return null;

  const currentTab = tabs[active] || tabs[0];

  const handleAnimationEnd = () => {
    if (!isPaused) {
      setActive((prev) => (prev + 1) % tabs.length);
      setKey((prev) => prev + 1);
    }
  };

  const handleTabClick = (idx: number) => {
    setActive(idx);
    setIsPaused(false); // Resume playback on explicit tab click
    setKey((prev) => prev + 1); // Reset timer & animation progress on click
  };

  const togglePause = () => {
    setIsPaused((prev) => {
      const next = !prev;
      if (videoRef.current) {
        if (next) {
          videoRef.current.pause();
        } else {
          videoRef.current.play().catch(() => {});
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cursor-change", { detail: next ? "play" : "pause" }));
      }
      return next;
    });
  };

  // Format header title to ensure numbered prefix (e.g. "1. Refractive Nav") without duplication
  const headerTitle = /^\d+\.\s*/.test(currentTab.name)
    ? currentTab.name
    : `${active + 1}. ${currentTab.name}`;

  return (
    <div className="w-full flex flex-col mt-8">
      {/* Active Tab Media (Image / Video) with Cursor Morphing (Pause / Play) */}
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
            <div 
              onClick={togglePause}
              data-cursor={isPaused ? "play" : "pause"}
              className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-muted cursor-pointer select-none"
            >
              <video
                ref={videoRef}
                src={currentTab.videoSrc}
                controls={false}
                autoPlay={!isPaused}
                muted
                loop
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          ) : currentTab.imageSrc ? (
            <div 
              onClick={togglePause}
              data-cursor={isPaused ? "play" : "pause"}
              className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-muted cursor-pointer select-none"
            >
              <Image
                src={currentTab.imageSrc}
                alt={currentTab.name}
                fill
                className="object-cover pointer-events-none"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Progress Rectangles (Tabs replaced with bars filling up over time) */}
      <div 
        role="tablist"
        aria-label="Feature progress tabs"
        className="flex flex-row items-center gap-2 sm:gap-2.5 w-full mt-3 sm:mt-4"
      >
        {tabs.map((tab, idx) => {
          const isActive = active === idx;
          const isPassed = idx < active;
          return (
            <button
              key={tab.name || idx}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.name ? `${idx + 1}. ${tab.name}` : `Tab ${idx + 1}`}
              onClick={() => handleTabClick(idx)}
              data-cursor="pointer"
              className="relative flex-1 h-1 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden outline-none cursor-pointer transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
              {/* Progress bar fill layer */}
              {isPassed ? (
                <div className="h-full w-full bg-neutral-800 dark:bg-neutral-100 rounded-full" />
              ) : isActive ? (
                <div
                  key={`fill-${active}-${key}`}
                  onAnimationEnd={handleAnimationEnd}
                  style={{
                    animationName: "fillProgress",
                    animationDuration: `${autoPlayDuration}s`,
                    animationTimingFunction: "linear",
                    animationFillMode: "forwards",
                    animationPlayState: isPaused ? "paused" : "running",
                  }}
                  className="h-full bg-neutral-800 dark:bg-neutral-100 rounded-full"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Numbered Header & Description Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full mt-6 sm:mt-7 text-left flex flex-col gap-1.5"
        >
          <h4 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
            {headerTitle}
          </h4>
          {currentTab.description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {currentTab.description}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

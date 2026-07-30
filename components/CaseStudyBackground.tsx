"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface CaseStudyBackgroundProps {
  colors?: {
    top: string;
    middle: string;
    bottom: string;
  } | [string, string, string];
  isNavChanged?: boolean;
}

export default function CaseStudyBackground({ colors, isNavChanged = false }: CaseStudyBackgroundProps) {
  const { scrollY } = useScroll();
  
  // Continuous, silky scroll-driven opacity fade out as user scrolls down past the hero
  const scrollOpacity = useTransform(scrollY, [120, 750], [1, 0]);
  const scrollIntensity = useTransform(scrollY, [0, 350], [0.75, 1]);
  const scrollScale = useTransform(scrollY, [0, 350], [1, 1.04]);
  const y = useTransform(scrollY, [0, 500], [0, -40]);

  // Extract top, middle, bottom colors
  let c1 = "#030617";
  let c2 = "#0a123d";
  let c3 = "#0052ff";

  if (colors) {
    if (Array.isArray(colors)) {
      [c1, c2, c3] = colors;
    } else {
      c1 = colors.top || c1;
      c2 = colors.middle || c2;
      c3 = colors.bottom || c3;
    }
  }

  return (
    <div 
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-[900px] sm:h-[1100px] overflow-hidden pointer-events-none z-0 select-none"
      style={{
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.18) 88%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.18) 88%, rgba(0,0,0,0) 100%)",
      }}
    >
      <motion.div 
        animate={{
          opacity: isNavChanged ? 0 : 1,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full relative origin-top"
      >
        <motion.div
          style={{ scale: scrollScale, y, opacity: scrollOpacity }}
          className="w-full h-full relative transform-gpu origin-top"
        >
          {/* Primary gradient with multi-stop color-mix for seamless bottom dissipation */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${c1} 0%, ${c1} 18%, ${c2} 42%, ${c3} 68%, color-mix(in srgb, ${c3} 55%, transparent) 84%, transparent 100%)`,
            }}
          />

          {/* Center ambient glow spot */}
          <motion.div 
            className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[140%] h-[60%] rounded-[50%] blur-3xl pointer-events-none opacity-50 dark:opacity-75"
            style={{
              opacity: scrollIntensity,
              background: `radial-gradient(ellipse at center, ${c3} 0%, ${c2} 45%, transparent 75%)`,
            }}
          />

          {/* Side edge vibrancy flares */}
          <motion.div 
            className="absolute bottom-[15%] -left-[20%] w-[65%] h-[55%] rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-70"
            style={{
              opacity: scrollIntensity,
              background: `radial-gradient(circle at center, ${c3} 0%, transparent 70%)`,
            }}
          />
          <motion.div 
            className="absolute bottom-[15%] -right-[20%] w-[65%] h-[55%] rounded-full blur-3xl pointer-events-none opacity-40 dark:opacity-70"
            style={{
              opacity: scrollIntensity,
              background: `radial-gradient(circle at center, ${c3} 0%, transparent 70%)`,
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

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
  
  // As user scrolls towards the nav change point, build up saturation & brightness to 100% peak
  const scrollIntensity = useTransform(scrollY, [0, 250], [0.75, 1]);
  const scrollScale = useTransform(scrollY, [0, 250], [1, 1.05]);
  const y = useTransform(scrollY, [0, 400], [0, -30]);

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
      className="absolute inset-x-0 top-0 h-[850px] sm:h-[1000px] overflow-hidden pointer-events-none z-0 select-none"
    >
      <motion.div 
        animate={{
          opacity: isNavChanged ? 0 : 1,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ scale: scrollScale, y }}
        className="w-full h-full relative transform-gpu origin-top"
      >
        {/* Fallback & Primary OKLCH nearest hue vertical gradient: Very dark top -> rich mid -> vibrant bottom */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg in oklch shorter hue, ${c1} 0%, ${c1} 18%, ${c2} 48%, ${c3} 82%, transparent 100%)`,
          }}
        />

        {/* Center ambient glow spot for peak vibrant saturation right before nav changes */}
        <motion.div 
          className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[140%] h-[65%] rounded-[50%] blur-3xl mix-blend-screen pointer-events-none"
          style={{
            opacity: scrollIntensity,
            background: `radial-gradient(ellipse at center, ${c3} 0%, ${c2} 45%, transparent 75%)`,
          }}
        />

        {/* Side edge vibrancy flares for deep atmospheric lighting */}
        <motion.div 
          className="absolute bottom-[12%] -left-[20%] w-[65%] h-[55%] rounded-full blur-3xl mix-blend-screen pointer-events-none"
          style={{
            opacity: scrollIntensity,
            background: `radial-gradient(circle at center, ${c3} 0%, transparent 70%)`,
          }}
        />
        <motion.div 
          className="absolute bottom-[12%] -right-[20%] w-[65%] h-[55%] rounded-full blur-3xl mix-blend-screen pointer-events-none"
          style={{
            opacity: scrollIntensity,
            background: `radial-gradient(circle at center, ${c3} 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </div>
  );
}


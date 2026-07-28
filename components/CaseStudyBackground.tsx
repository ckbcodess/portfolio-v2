"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface CaseStudyBackgroundProps {
  colors?: [string, string, string];
}

export default function CaseStudyBackground({ colors }: CaseStudyBackgroundProps) {
  const { scrollY } = useScroll();
  
  // Extend scroll fade threshold so hero gradient stays rich and visible longer as user scrolls
  const opacity = useTransform(scrollY, [0, 1400], [1, 0]);
  const y = useTransform(scrollY, [0, 1400], [0, -120]);

  // Default to refined deep ambient tones if no custom colors provided
  const [c1, c2, c3] = colors || ["#360000", "#9C0000", "#FF1759"];

  return (
    <div 
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-[850px] sm:h-[1100px] overflow-hidden pointer-events-none z-0"
    >
      <motion.div 
        style={{ opacity, y }}
        className="w-full h-full relative transform-gpu"
      >
        {/* Primary smooth vertical gradient fade into page background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${c1} 0%, ${c2} 35%, ${c3} 65%, transparent 100%)`,
          }}
        />

        {/* Ambient radial glow spot for organic visual depth */}
        <div 
          className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[140%] h-[75%] rounded-[50%] blur-3xl opacity-60 mix-blend-screen"
          style={{
            background: `radial-gradient(ellipse at center, ${c3} 0%, ${c2} 45%, transparent 70%)`,
          }}
        />

        {/* Secondary soft top highlight */}
        <div 
          className="absolute top-0 inset-x-0 h-[300px] opacity-40 blur-2xl"
          style={{
            background: `radial-gradient(50% 100% at 50% 0%, ${c3} 0%, transparent 100%)`,
          }}
        />
      </motion.div>
    </div>
  );
}


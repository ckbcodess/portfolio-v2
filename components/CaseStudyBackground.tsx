"use client";

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface CaseStudyBackgroundProps {
  colors?: [string, string, string];
}

export default function CaseStudyBackground({ colors }: CaseStudyBackgroundProps) {
  const { scrollY } = useScroll();
  const [shouldRender, setShouldRender] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to the original red gradient if no colors provided
  const [c1, c2, c3] = colors || ["#360000", "#9C0000", "#FF1759"];

  // Fade out smoothly between 400px and 1000px of scroll
  const opacity = useTransform(scrollY, [400, 1000], [1, 0]);
  const scale = useTransform(scrollY, [400, 1000], [1, 1.1]);
  const blur = useTransform(scrollY, [400, 1000], ["blur(0px)", "blur(40px)"]);

  // Completely unmount/hide after the transition is done to prevent dithering or performance issues
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 1200 && shouldRender) {
      setShouldRender(false);
    } else if (latest <= 1200 && !shouldRender) {
      setShouldRender(true);
    }
  });

  if (!mounted || !shouldRender) return null;

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-background"
    >
      <motion.div 
        style={{ 
          opacity,
          scale, 
          filter: blur,
          backgroundImage: `linear-gradient(to bottom, ${c1}, ${c2}, ${c3})`
        }}
        className="absolute inset-0 w-full h-screen"
      />
      
      {/* Subtle Texture Overlay - Now fades out with the parent */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Soft Bottom Mask - Now fades out with the parent */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40" />
    </motion.div>,
    document.body
  );
}


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

  const [isVisible, setIsVisible] = useState(true);
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 500 && isVisible) {
      setIsVisible(false);
    } else if (latest <= 500 && !isVisible) {
      setIsVisible(true);
    }
  });

  if (!mounted) return null;

  return createPortal(
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full h-[100dvh] z-0 overflow-hidden pointer-events-none bg-background"
      style={{ transform: 'translateZ(0)' }}
    >
      <motion.div 
        style={{ 
          backgroundImage: `linear-gradient(to bottom, ${c1}, ${c2}, ${c3})`,
          backgroundColor: c1,
          willChange: "transform, opacity"
        }}
        className="absolute -top-[25%] -left-[15%] w-[130%] h-[150%]"
      />
      
      {/* Subtle Texture Overlay */}
      <div 
        className="absolute -inset-[15%] opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('/noise.svg')]" 
        style={{ transform: 'translateZ(0)' }}
      />
      
    </motion.div>,
    document.body
  );
}


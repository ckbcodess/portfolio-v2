"use client";

import { motion, Variants } from "motion/react";
import { ReactNode } from "react";

interface MaskRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

export function MaskReveal({
  children,
  delay = 0,
  duration = 0.8,
  direction = "up",
  className = "",
}: MaskRevealProps) {
  const variants: Variants = {
    hidden: {
      y: direction === "up" ? "100%" : direction === "down" ? "-100%" : 0,
      x: direction === "left" ? "100%" : direction === "right" ? "-100%" : 0,
      opacity: 0,
    },
    show: {
      y: 0,
      x: 0,
      opacity: 1,
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for premium feel
      },
    },
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={variants}
      >
        {children}
      </motion.div>
    </div>
  );
}

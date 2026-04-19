"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface AppearProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
}

export default function Appear({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.8,
}: AppearProps) {
  const x = direction === "left" ? distance : direction === "right" ? -distance : 0;
  const y = direction === "up" ? distance : direction === "down" ? -distance : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x, y, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}


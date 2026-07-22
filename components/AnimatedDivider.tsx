"use client";

import { motion } from "motion/react";
import { useTransition } from "./TransitionProvider";

interface AnimatedDividerProps {
  className?: string;
  delay?: number;
  duration?: number;
  origin?: "left" | "right" | "center";
  color?: string;
}

export function AnimatedDivider({
  className = "",
  delay = 0.2,
  duration = 0.75,
  origin = "left",
  color = "bg-foreground/10",
}: AnimatedDividerProps) {
  const { canAnimate } = useTransition();

  const originClass =
    origin === "left"
      ? "origin-left"
      : origin === "right"
      ? "origin-right"
      : "origin-center";

  return (
    <div className={`w-full overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={canAnimate ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`w-full h-[1px] ${color} ${originClass} will-change-transform`}
      />
    </div>
  );
}

export default AnimatedDivider;

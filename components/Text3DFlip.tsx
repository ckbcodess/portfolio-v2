"use client";

import React from "react";
import { motion, AnimatePresence, Transition, Variants, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface Text3DFlipProps {
  children: string;
  className?: string;
  textClassName?: string;
  rotateDirection?: "top" | "bottom";
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center";
  transition?: Transition;
}

export default function Text3DFlip({
  children,
  className,
  textClassName,
  rotateDirection = "top",
  staggerDuration = 0.02,
  transition = { type: "spring", damping: 25, stiffness: 200 },
}: Text3DFlipProps) {
  const shouldReduceMotion = useReducedMotion();
  const textContent = typeof children === "string" ? children : "";
  const characters = textContent.split("");

  const variants: Variants = {
    initial: {
      rotateX: rotateDirection === "top" ? -90 : 90,
      opacity: 0,
      y: rotateDirection === "top" ? 10 : -10,
    },
    animate: (i: number) => ({
      rotateX: 0,
      opacity: 1,
      y: 0,
      transition: {
        ...transition,
        delay: i * staggerDuration,
      },
    }),
    exit: (i: number) => ({
      rotateX: rotateDirection === "top" ? 90 : -90,
      opacity: 0,
      y: rotateDirection === "top" ? -10 : 10,
      transition: {
        ...transition,
        delay: i * staggerDuration,
      },
    }),
  };

  return (
    <div 
      className={cn("relative overflow-visible", className)} 
      style={{ perspective: "1000px" }}
      aria-label={textContent || undefined}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={textContent}
          className="flex items-center justify-center whitespace-nowrap"
          aria-hidden="true"
        >
          {shouldReduceMotion ? (
            <span className={cn("inline-block", textClassName)}>{textContent}</span>
          ) : (
            characters.map((char, i) => (
              <motion.span
                key={`${textContent}-${i}`}
                custom={i}
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={cn("inline-block transform-gpu origin-center", textClassName)}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

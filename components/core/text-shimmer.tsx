"use client";

import React, { useMemo, type JSX } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type TextShimmerProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

export function TextShimmer({
  children,
  as: Component = "span",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const MotionComponent = motion.create(Component as keyof JSX.IntrinsicElements);

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <MotionComponent
      className={cn(
        "relative inline-block bg-[length:250%_100%] bg-clip-text text-transparent select-none",
        "bg-[linear-gradient(90deg,var(--base-color)_0%,var(--base-color)_calc(50%-var(--spread)),var(--highlight-color)_50%,var(--base-color)_calc(50%+var(--spread)),var(--base-color)_100%)]",
        className
      )}
      initial={{ backgroundPosition: "100% 0" }}
      animate={{ backgroundPosition: "-100% 0" }}
      transition={{
        repeat: Infinity,
        duration: duration,
        ease: "linear",
      }}
      style={
        {
          "--spread": `${dynamicSpread}px`,
          "--base-color": "var(--color-foreground)",
          "--highlight-color": "var(--color-background)",
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
}

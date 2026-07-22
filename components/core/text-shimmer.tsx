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
  baseColor?: string;
  highlightColor?: string;
};

export function TextShimmer({
  children,
  as: Component = "span",
  className,
  duration = 2,
  spread = 2,
  baseColor,
  highlightColor,
}: TextShimmerProps) {
  const MotionComponent = motion.create(Component as keyof JSX.IntrinsicElements);

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <MotionComponent
      className={cn(
        "relative inline-block bg-[length:250%_100%] bg-clip-text text-transparent select-none",
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
          backgroundImage:
            "linear-gradient(90deg, var(--base-color) 0%, var(--base-color) calc(50% - var(--spread)), var(--highlight-color) 50%, var(--base-color) calc(50% + var(--spread)), var(--base-color) 100%)",
          "--spread": `${dynamicSpread}px`,
          "--base-color": baseColor || "var(--foreground)",
          "--highlight-color": highlightColor || "var(--shimmer-highlight, var(--muted-foreground))",
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
}

"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type TextShimmerProps = {
  children: React.ReactNode;
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
  const dynamicSpread = useMemo(() => {
    const text = typeof children === "string" ? children : String(children ?? "");
    return text.length * spread;
  }, [children, spread]);

  const MotionComponent =
    typeof Component === "string"
      ? (motion as unknown as Record<string, typeof motion.span>)[Component] || motion.span
      : motion.span;

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

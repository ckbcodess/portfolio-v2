"use client";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface SplitTextProps {
  text: string;
  className?: string;
  splitBy?: "words" | "characters";
  stagger?: number;
  effect?: "default" | "per-word-crossfade";
}

const SplitTextComponent = ({
  text,
  className,
  splitBy = "words",
  stagger = 0.05,
  effect = "default",
}: SplitTextProps) => {
  // Use regex to keep spaces in the split array if splitting by words
  const items = splitBy === "words" ? text.split(/(\s+)/) : text.split("");

  return (
    <span className={cn("whitespace-normal", className)} aria-hidden="true">
      {items.map((item, index) => {
        // If it's just whitespace, render it naturally to maintain proper spacing
        if (/\s+/.test(item)) {
          return <span key={index} className="inline">{item}</span>;
        }

        const isCrossfade = effect === "per-word-crossfade";

        return (
          <span
            key={index}
            className={cn(
              "inline-block align-top",
              isCrossfade ? "overflow-visible" : "overflow-hidden"
            )}
          >
            <motion.span
              initial={
                isCrossfade
                  ? { opacity: 0, y: 8, filter: "blur(8px)" }
                  : { y: "100%" }
              }
              animate={
                isCrossfade
                  ? { opacity: 1, y: 0, filter: "blur(0px)" }
                  : { y: 0 }
              }
              transition={
                isCrossfade
                  ? {
                      duration: 0.28,
                      delay: index * stagger,
                      ease: [0.16, 1, 0.3, 1],
                    }
                  : {
                      duration: 0.6,
                      delay: index * stagger,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
              className={cn("inline-block", isCrossfade && "will-change-transform")}
            >
              {item}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
};

export const SplitText = memo(SplitTextComponent);

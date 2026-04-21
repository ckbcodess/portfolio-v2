"use client";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface SplitTextProps {
  text: string;
  className?: string;
  splitBy?: "words" | "characters";
  stagger?: number;
}

const SplitTextComponent = ({
  text,
  className,
  splitBy = "words",
  stagger = 0.05,
}: SplitTextProps) => {
  // Use regex to keep spaces in the split array if splitting by words
  const items = splitBy === "words" ? text.split(/(\s+)/) : text.split("");

  return (
    <span
      className={cn("inline leading-tight", className)}
      aria-hidden="true"
    >
      {items.map((item, index) => {
        // If it's just whitespace, render it naturally to maintain proper spacing
        if (/\s+/.test(item)) {
          return <span key={index} className="inline">{item}</span>;
        }

        return (
          <span
            key={index}
            className="inline-block overflow-hidden align-top"
          >
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="inline-block"
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

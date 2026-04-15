"use client";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  const items = splitBy === "words" ? text.split(" ") : text.split("");

  return (
    <span
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start" }}
      className={cn("inline-flex flex-wrap overflow-hidden", className)}
      aria-hidden="true"
    >
      {items.map((item, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden"
          style={{ marginRight: splitBy === "words" ? "0.3em" : "0em" }}
        >
          <motion.span
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * stagger,
              ease: [0.33, 1, 0.68, 1],
            }}
            className="inline-block"
          >
            {item === " " ? "\u00A0" : item}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export const SplitText = memo(SplitTextComponent);

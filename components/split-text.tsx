"use client";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  text: string;
  className?: string;
  splitBy?: "words" | "characters";
}

const SplitTextComponent = ({
  text,
  className,
  splitBy = "words",
}: SplitTextProps) => {
  const items = splitBy === "words" ? text.split(" ") : text.split("");

  return (
    <span
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start" }}
      className={cn("inline-flex flex-wrap", className)}
      aria-hidden="true"
    >
      {items.map((item, index) => (
        <span
          key={index}
          className="inline-block"
          style={{ marginRight: splitBy === "words" ? "0.3em" : "0em" }}
        >
          {item === " " ? "\u00A0" : item}
        </span>
      ))}
    </span>
  );
};

export const SplitText = memo(SplitTextComponent);

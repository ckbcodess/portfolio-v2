"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FlowingLineRevealProps {
  text: string;
  className?: string;
  lineClassName?: string;
  delay?: number;
  lineDelay?: number;
}

export function FlowingLineReveal({
  text,
  className = "",
  lineClassName = "",
  delay = 0,
  lineDelay = 0.06,
}: FlowingLineRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [lines, setLines] = useState<string[][]>([]);

  const tokens = useMemo(() => text.split(/(\s+)/).filter(Boolean), [text]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rebuild = () => {
      const measured = measureRefs.current.filter(Boolean);
      if (measured.length === 0) return;

      const nextLines: string[][] = [];
      let currentTop = measured[0]?.offsetTop ?? 0;

      tokens.forEach((token, index) => {
        const node = measureRefs.current[index];
        if (!node) return;

        const top = node.offsetTop;
        if (nextLines.length === 0 || Math.abs(top - currentTop) > 1) {
          nextLines.push([token]);
          currentTop = top;
        } else {
          nextLines[nextLines.length - 1].push(token);
        }
      });

      setLines(nextLines);
    };

    rebuild();

    const observer = new ResizeObserver(() => rebuild());
    observer.observe(container);

    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    fonts?.ready.then(rebuild).catch(() => {});

    return () => observer.disconnect();
  }, [tokens, text]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <span className="sr-only">{text}</span>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 invisible whitespace-normal",
          lineClassName
        )}
      >
        {tokens.map((token, index) => (
          <span
            key={`${token}-${index}`}
            ref={(node) => {
              measureRefs.current[index] = node;
            }}
            className="inline"
          >
            {token}
          </span>
        ))}
      </div>

      <div aria-hidden="true" className="flex flex-col items-start gap-0.5">
        {lines.map((line, lineIndex) => (
          <div key={`${lineIndex}-${line.join("")}`} className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: delay + lineIndex * lineDelay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn("will-change-transform", lineClassName)}
            >
              <span className="block">{line.join("")}</span>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

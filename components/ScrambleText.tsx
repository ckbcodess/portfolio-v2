"use client";

import { useEffect, useRef } from "react";
import { animate, scrambleText } from "animejs";

interface ScrambleTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  characters?: string;
  once?: boolean;
}

export function ScrambleText({
  text,
  className = "",
  delay = 0,
  duration = 0.8,
  characters = "a-zA-Z0-9!@#$%^&*()_+",
  once = true,
}: ScrambleTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!textRef.current) return;
    if (once && hasAnimated.current) return;

    const animation = animate(textRef.current, {
      innerHTML: scrambleText({
        text: text,
        chars: characters,
        delay: delay * 1000,
        duration: duration * 1000,
        ease: "linear",
      }),
      complete: () => {
        hasAnimated.current = true;
      }
    });

    return () => {
      animation.pause();
    };
  }, [text, characters, duration, delay, once]);

  return (
    <span ref={textRef} className={className}>
      {text}
    </span>
  );
}



"use client";

import { useEffect, useRef } from "react";
import { animate, scrambleText } from "animejs";
import { useWebHaptics } from "web-haptics/react";

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
  const { trigger } = useWebHaptics();

  useEffect(() => {
    if (!textRef.current) return;
    if (once && hasAnimated.current) return;

    let lastTick = 0;
    const animation = animate(textRef.current, {
      innerHTML: scrambleText({
        text: text,
        chars: characters,
        delay: delay * 1000,
        duration: duration * 1000,
        ease: "linear",
      }),
      update: () => {
        const now = performance.now();
        // Throttle to every 40ms to create a nice "ticking" feel
        if (now - lastTick > 40) {
          trigger([{ duration: 5, intensity: 0.3 }]); // Very light, rapid tick
          lastTick = now;
        }
      },
      complete: () => {
        hasAnimated.current = true;
      }
    });

    return () => {
      animation.pause();
    };
  }, [text, characters, duration, delay, once, trigger]);

  return (
    <span ref={textRef} className={className}>
      {text}
    </span>
  );
}



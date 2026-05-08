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
  const { trigger, cancel } = useWebHaptics();

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
      begin: () => {
        // Generate a rapid vibration pattern for the duration of the animation
        const totalDuration = duration * 1000;
        const pattern: number[] = [];
        // 15ms vibrate, 25ms pause = 40ms cycle (~25 ticks per second)
        const cycles = Math.floor(totalDuration / 40);
        for (let i = 0; i < cycles; i++) {
          pattern.push(15); // Vibrate
          pattern.push(25); // Pause
        }
        trigger(pattern);
      },
      complete: () => {
        hasAnimated.current = true;
      }
    });

    return () => {
      animation.pause();
      cancel();
    };
  }, [text, characters, duration, delay, once, trigger, cancel]);

  return (
    <span ref={textRef} className={className}>
      {text}
    </span>
  );
}



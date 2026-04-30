"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useSound } from "@/components/SoundProvider";

interface Burst {
  id: number;
  x: number;
  y: number;
}

export default function ClickFeedback() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const { playClickDown, playClickUp } = useSound();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleMouseDown = () => {
      playClickDown();
    };

    const handleMouseUp = (e: MouseEvent) => {
      playClickUp();
      if (!shouldReduceMotion) {
        const newBurst = { id: Date.now(), x: e.clientX, y: e.clientY };
        setBursts((prev) => [...prev, newBurst].slice(-5));
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [playClickDown, playClickUp]);

  const removeBurst = (id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden">
      <AnimatePresence>
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute pointer-events-none"
            style={{
              left: burst.x - 24,
              top: burst.y - 24,
              width: 48,
              height: 48,
            }}
          >
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div
                key={deg}
                className="absolute inset-0 pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <motion.div
                  className="absolute w-[2px] bg-foreground rounded-full"
                  style={{ top: "50%", left: "50%", x: "-50%" }}
                  initial={{ y: -8, opacity: 1, height: 6 }} 
                  animate={{ y: -24, opacity: 0, height: 2 }} 
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  onAnimationComplete={() => {
                    if (deg === 0) removeBurst(burst.id);
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

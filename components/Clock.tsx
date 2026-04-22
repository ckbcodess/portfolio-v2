"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Clock() {
  const [time, setTime] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    ampm: string;
  } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Using formatToParts to easily isolate H, M, S and AM/PM
      const parts = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).formatToParts(now);

      const hours = parts.find((p) => p.type === "hour")?.value || "";
      const minutes = parts.find((p) => p.type === "minute")?.value || "";
      const seconds = parts.find((p) => p.type === "second")?.value || "";
      const ampm = parts.find((p) => p.type === "dayPeriod")?.value || "";

      setTime({ hours, minutes, seconds, ampm });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <span className="opacity-0">00:00:00 am</span>;

  return (
    <span className="inline-flex items-center tabular-nums text-[14px] font-medium tracking-[-0.02em]">
      <span>{time.hours}</span>
      <span className="mx-[0.5px]">:</span>
      <span>{time.minutes}</span>
      <span className="mx-[0.5px]">:</span>
      <span className="inline-flex">
        {time.seconds.split("").map((digit, i) => (
          <div key={i} className="relative w-[0.58em] h-[1em] flex items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={digit}
                initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.16, 1, 0.3, 1]
                }}
                className="absolute"
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </span>
      <span className="ml-[4px] text-[14px] uppercase tracking-wide">{time.ampm}</span>
    </span>
  );
}

"use client";

import { motion } from "motion/react";
import React from "react";

export default function NumberTicker({ value }: { value: number | string }) {
  const chars = String(value).split("");
  return (
    <span className="inline-flex items-center overflow-hidden h-[16px] leading-none">
      {chars.map((char, index) => {
        if (/\d/.test(char)) {
          const digit = parseInt(char, 10);
          return <DigitTicker key={index} digit={digit} />;
        }
        return <span key={index} className="inline-block text-xs font-semibold leading-none">{char}</span>;
      })}
    </span>
  );
}

function DigitTicker({ digit }: { digit: number }) {
  return (
    <span className="relative h-[16px] w-[0.6em] inline-block overflow-hidden leading-none select-none">
      <motion.span
        animate={{ y: -digit * 16 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="absolute top-0 left-0 flex flex-col items-center justify-start w-full"
        style={{ height: "160px" }} // 10 digits * 16px
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[16px] flex items-center justify-center text-xs font-semibold leading-none" style={{ height: "16px" }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

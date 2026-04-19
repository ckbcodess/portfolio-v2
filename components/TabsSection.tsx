"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SplitText } from "@/components/split-text";

const tabsData = [
  {
    name: "For all",
    text: "I'm a designer who actually cares about three things: perfect grids, bold aesthetics, and helping people win.",
  },
  {
    name: "Recruiters",
    text: "I've spent three years proving that you don't ever have to choose between high-speed and high-craft.",
  },
  {
    name: "Product Designers",
    text: "I'm the person on the team who reads the entire design system AND knows exactly when to break the rules.",
  },
  {
    name: "UX Researchers",
    text: "I always ask why before I ever open Figma. Research isn't a phase, it's the foundation of every pixel.",
  },
  {
    name: "Vibe Coders",
    text: "I prompted my way into a full portfolio in 48 hours... and I'll do it again. Speed is my strongest vibe.",
  },
  {
    name: "Artists",
    text: "Eight years of digital art before product design. The craft never left, it just found new problems to solve.",
  },
];

export default function TabsSection() {
  const [active, setActive] = useState(0);

  const handleTabClick = (i: number) => {
    setActive(i);
  };

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-16">
      <div className="min-h-[180px] md:min-h-[140px] flex items-start justify-start w-full relative">
        <AnimatePresence>
          <motion.h1
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-0 left-0 self-stretch justify-start text-foreground text-[1.55rem] md:text-[36px] font-normal font-sans leading-[1.1] tracking-tight text-left [text-wrap:balance] w-full"
          >
            <SplitText text={tabsData[active].text} splitBy="words" stagger={0.02} />
          </motion.h1>
        </AnimatePresence>
      </div>

      <div className="flex flex-row items-center w-full overflow-x-auto gap-6 md:gap-0 md:justify-between pb-2 md:pb-0 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabsData.map((tab, i) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(i)}
            data-cursor="pointer"
            className={`text-center shrink-0 whitespace-nowrap justify-start text-foreground text-[1.05rem] font-normal font-sans leading-5 transition-all duration-300 ${active === i
              ? "opacity-100"
              : "opacity-30 hover:opacity-100"
              }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}


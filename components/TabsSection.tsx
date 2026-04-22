"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SplitText } from "@/components/split-text";

const tabsData = [
  {
    name: "For all",
    text: "I'm a designer who cares about two things: grids, aesthetics, and helping people.",
  },
  {
    name: "Recruiters",
    text: "I've spent three years proving that you don't ever have to choose between speed and craft.",
  },
  {
    name: "Product Designers",
    text: "I'm the person on the team who reads the entire design system AND knows when to break the rules.",
  },
  {
    name: "UX Research",
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
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (i: number) => {
    setActive(i);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollLeft > 10);
  };

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-8">
      <div className="w-full relative">
        <AnimatePresence mode="wait">
          <motion.h1
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-[32px] md:text-[36px] lg:text-[var(--font-size-hero)] text-foreground font-normal font-sans leading-[1.1] tracking-tight text-left [text-wrap:balance] w-full"
          >
            <SplitText text={tabsData[active].text} splitBy="words" stagger={0.02} />
          </motion.h1>
        </AnimatePresence>
      </div>

      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          maskImage: isScrolled 
            ? 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)' 
            : 'linear-gradient(to right, black calc(100% - 40px), transparent)',
          WebkitMaskImage: isScrolled 
            ? 'linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)' 
            : 'linear-gradient(to right, black calc(100% - 40px), transparent)',
        }}
        className="flex flex-row items-center w-full overflow-x-auto lg:overflow-x-visible justify-start gap-4 pb-2 md:pb-0 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mx-[calc(var(--page-px)*-1)] px-[var(--page-px)] lg:!mask-none lg:mx-0 lg:px-0"
      >
        {tabsData.map((tab, i) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(i)}
            data-cursor="pointer"
            className={`text-center shrink-0 whitespace-nowrap justify-start text-[1rem] font-medium font-sans leading-5 transition-all duration-200 ${active === i
              ? "text-foreground"
              : "text-foreground/30 hover:text-foreground/60"
              }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}


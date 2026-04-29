"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, Variants } from "motion/react";
import { MaskReveal } from "@/components/MaskReveal";

const experiments = [
  { id: 1, year: "2026" },
  { id: 2, year: "2026" },
  { id: 3, year: "2026" },
  { id: 4, year: "2026" },
  { id: 5, year: "2026" },
  { id: 6, year: "2026" }
];

export default function PlaygroundPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    // @ts-expect-error global appLoaded flag
    if (globalThis.appLoaded) {
      setTimeout(() => setCanAnimate(true), 0);
    } else {
      const handler = () => setCanAnimate(true);
      window.addEventListener("apps-loaded", handler);
      return () => window.removeEventListener("apps-loaded", handler);
    }
  }, []);

  const container: Variants = {
    hidden: { 
      opacity: 0,
      scale: 0.98,
      filter: "blur(4px)"
    },
    show: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
    show: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-background selection:bg-foreground selection:text-background">
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <motion.main 
            variants={container}
            initial="hidden"
            animate={canAnimate ? "show" : "hidden"}
            className="pt-32 md:pt-44 pb-40 px-[var(--page-px)] w-full origin-top"
          >
            <div className="flex flex-col gap-12 w-full max-w-[1284px]">
              {/* Year Filter */}
              <MaskReveal delay={0.1}>
                <div className="flex gap-8 items-center text-[14px] font-normal tracking-[-0.01em] whitespace-nowrap">
                  <span className="text-foreground cursor-pointer transition-colors">2026</span>
                  <span className="text-foreground/30 hover:text-foreground/60 transition-colors cursor-pointer">2025</span>
                  <span className="text-foreground/30 hover:text-foreground/60 transition-colors cursor-pointer">2024</span>
                </div>
              </MaskReveal>

              {/* Grid of Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-start">
                {experiments.map((exp) => (
                  <motion.div key={exp.id} variants={item}>
                    <div 
                      className="w-full aspect-[411/244] bg-muted/20 overflow-hidden relative rounded-[2px] hover:opacity-95 transition-all duration-500 cursor-pointer group"
                    >
                      <Image 
                        src="/allex-card.png" 
                        alt="The Allex" 
                        width={411}
                        height={244}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, LayoutGroup, Variants } from "motion/react";
import { MaskReveal } from "@/components/MaskReveal";
import Lightbox from "@/components/Lightbox";

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
  const [activeImage, setActiveImage] = useState<{ src: string; id: string } | null>(null);

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
    <div ref={pageRef} className="min-h-screen lg:h-screen lg:overflow-hidden bg-background selection:bg-foreground selection:text-background flex flex-col pt-32 md:pt-44 pb-12 lg:pb-0">
      <LayoutGroup>
        <motion.main 
          variants={container}
          initial="hidden"
          animate={canAnimate ? "show" : "hidden"}
          className="px-[var(--page-px)] w-full flex-1 flex flex-col items-start overflow-hidden origin-top-left"
        >
              <div className="flex flex-col gap-10 w-full h-full overflow-hidden">
                {/* Year Filter */}
                <MaskReveal delay={0.1}>
                  <div className="flex gap-8 items-center text-[14px] font-normal tracking-[-0.01em] whitespace-nowrap">
                    <span className="text-foreground cursor-pointer transition-colors">2026</span>
                    <span className="text-foreground/30 hover:text-foreground/60 transition-colors cursor-pointer">2025</span>
                    <span className="text-foreground/30 hover:text-foreground/60 transition-colors cursor-pointer">2024</span>
                  </div>
                </MaskReveal>

                {/* Grid of Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-start overflow-y-auto pb-40 no-scrollbar">
                  {experiments.map((exp) => {
                    const layoutId = `playground-img-${exp.id}`;
                    return (
                      <motion.div key={exp.id} variants={item}>
                        <motion.div
                          layoutId={layoutId}
                          className="w-full aspect-[411/244] bg-muted/20 overflow-hidden relative rounded-[2px] hover:opacity-95 transition-opacity duration-500 cursor-pointer group"
                          onClick={() => setActiveImage({ src: "/allex-card.png", id: layoutId })}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <Image 
                            src="/allex-card.png" 
                            alt="The Allex" 
                            width={411}
                            height={244}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                          />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.main>

            {/* Lightbox */}
            <Lightbox
              src={activeImage?.src ?? null}
              alt="Playground experiment"
              layoutId={activeImage?.id}
              onClose={() => setActiveImage(null)}
            />
      </LayoutGroup>
    </div>
  );
}

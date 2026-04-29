"use client";

import { useRef, useState, useEffect } from "react";
import { motion, Variants } from "motion/react";
import { MaskReveal } from "@/components/MaskReveal";
import PreviewCard from "@/components/PreviewCard";
import { caseStudies } from "@/content/case-studies";

const TABS = ["Bio", "Side Quests", "Books", "Music", "Inspos", "Random Thoughts"] as const;
type Tab = (typeof TABS)[number];

const EXPERIENCE = [
  { company: "The Allex", role: "Product Designer & Frontend Developer", period: "2024 - Present" },
  { company: "GCB", role: "Product Designer", period: "2023 - 2024" },
  { company: "Independent", role: "Freelance Designer", period: "2021 - 2023" },
];

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [canAnimate, setCanAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Bio");
  const previewImage = caseStudies[0].heroSrc;

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

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98, filter: "blur(4px)" },
    show: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { staggerChildren: 0.05, delayChildren: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div
      ref={pageRef}
      className="bg-background min-h-screen lg:h-screen lg:overflow-hidden pt-32 md:pt-44 pb-[var(--page-pt)] lg:pb-[8vh] w-full selection:bg-primary selection:text-primary-foreground flex flex-col"
    >
      <div className="w-full flex-1 flex flex-col lg:flex-row lg:items-stretch lg:justify-start gap-12 lg:gap-16 px-[var(--page-px)]">
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate={canAnimate ? "show" : "hidden"}
          className="flex flex-col w-full max-w-[28.5rem] lg:flex-1 lg:justify-between items-start gap-12 lg:gap-0 origin-top-left"
        >
          {/* Top: Tabs + Bio Body */}
          <div className="self-stretch flex flex-col items-start gap-10">
            {/* Tabs */}
            <MaskReveal delay={0.1}>
              <nav className="flex flex-wrap items-center gap-x-8 gap-y-3">
                {TABS.map((tab) => {
                  const isActive = tab === activeTab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium leading-none tracking-tight transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </nav>
            </MaskReveal>

            {/* Bio Body */}
            <MaskReveal delay={0.2}>
              <p className="text-foreground text-base leading-[1.75] max-w-[28.5rem]">
                I&apos;m Ransford — a product designer who cares about grids,
                aesthetics, and the small details that make interfaces feel
                considered. I&apos;ve spent the last few years designing and
                shipping products end-to-end, from early concept sketches to
                pixel-pushed frontend code. My work sits at the intersection
                of clarity and craft: systems that scale, interfaces that
                breathe, and interactions that respect the people using them.
                Outside of client work I tinker with motion, type, and the
                occasional weekend experiment that doesn&apos;t quite know
                what it wants to be yet.
              </p>
            </MaskReveal>

            {/* Signature */}
            <MaskReveal delay={0.3}>
              <div className="font-serif italic text-foreground/80 text-2xl leading-none">
                Ransford
              </div>
            </MaskReveal>
          </div>

          {/* Bottom: Experience */}
          <div className="self-stretch flex flex-col items-start gap-6">
            <MaskReveal delay={0.4}>
              <h2 className="text-muted-foreground text-sm font-medium leading-none tracking-tight">
                Experience
              </h2>
            </MaskReveal>
            <ul className="self-stretch flex flex-col gap-3">
              {EXPERIENCE.map((item, idx) => (
                <MaskReveal key={item.company + idx} delay={0.5 + idx * 0.05} className="w-full">
                  <li className="flex items-baseline justify-between gap-6 text-foreground text-sm">
                    <span className="truncate">
                      {item.role} <span className="text-muted-foreground/60">— {item.company}</span>
                    </span>
                    <span className="text-muted-foreground/60 tabular-nums shrink-0">{item.period}</span>
                  </li>
                </MaskReveal>
              ))}
            </ul>
          </div>
        </motion.main>
      </div>

      {/* Desktop Preview — Fixed Position (mirrors Home) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={canAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        className="hidden lg:block fixed bottom-[calc(8vh+1rem)] right-[80px] w-[clamp(350px,38vw,628px)]"
        style={{ aspectRatio: "628 / 346" }}
        aria-label="Preview"
      >
        <PreviewCard activeImage={previewImage} className="!h-full" />
      </motion.div>
    </div>
  );
}

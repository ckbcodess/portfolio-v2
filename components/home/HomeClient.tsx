"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import TransitionLink from "@/components/TransitionLink";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { useTransition } from "@/components/TransitionProvider";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Lock } from "lucide-react";
import type { CaseStudyCard } from "@/lib/types";
import Lightbox from "@/components/Lightbox";
import NumberTicker from "@/components/NumberTicker";
import { MaskReveal } from "@/components/MaskReveal";
import TabsSection from "@/components/TabsSection";

// three.js is heavy — load the blob after hydration instead of shipping it in the main bundle
const Interactive3DBlob = dynamic(() => import("@/components/Interactive3DBlob"), {
  ssr: false,
});

export default function HomeClient({ caseStudies }: { caseStudies: CaseStudyCard[] }) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [clickCount, setClickCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { canAnimate } = useTransition();
  const [activeExp, setActiveExp] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    // Detect scroll requests on mount (hash or query parameter)
    if (window.location.hash === "#case-studies" || window.location.search.includes("scroll=case-studies")) {
      setTimeout(() => {
        const el = document.getElementById("case-studies");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 500); // delay to let transition animations complete
    }
  }, [canAnimate]);

  const containerVariants: Variants = {
    hidden: { opacity: 1, scale: 1 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const messages = [
    <React.Fragment key="msg-0">Ransford Gyasi</React.Fragment>,
    <React.Fragment key="msg-1">Boop! <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f446.png" alt="👆" className="inline-block w-5 h-5 align-text-bottom ml-1 drop-shadow-sm" draggable={false} /></React.Fragment>,
    <React.Fragment key="msg-2">That tickles! <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f602.png" alt="😂" className="inline-block w-5 h-5 align-text-bottom ml-1 drop-shadow-sm" draggable={false} /></React.Fragment>,
    <React.Fragment key="msg-3">Okay, you can stop now...</React.Fragment>,
    <React.Fragment key="msg-4">Seriously. <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f610.png" alt="😐" className="inline-block w-5 h-5 align-text-bottom ml-1 drop-shadow-sm" draggable={false} /></React.Fragment>,
    <React.Fragment key="msg-5">Fine, I'm leaving. <img src="https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f4a8.png" alt="💨" className="inline-block w-[22px] h-[22px] align-text-bottom ml-1 drop-shadow-sm" draggable={false} /></React.Fragment>,
  ];

  const handleAvatarClick = () => {
    if (isDisabled) return;

    if (comboTimeoutRef.current) {
      clearTimeout(comboTimeoutRef.current);
    }

    const sounds = ["/sounds/pop-1.wav", "/sounds/pop-2.wav", "/sounds/pop-3.wav"];
    const audio = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
    audio.volume = 0.4;
    audio.preservesPitch = false;
    audio.playbackRate = 1 + (clickCount * 0.15); 
    audio.play().catch(() => { });

    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= messages.length - 1) {
      setIsDisabled(true);
      setTimeout(() => {
        setClickCount(0);
        setIsDisabled(false);
      }, 4000);
    } else {
      comboTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1200);
    }
  };

  return (
    <div
      ref={pageRef}
      className="bg-background min-h-screen pt-40 md:pt-48 pb-24 w-full selection:bg-primary selection:text-primary-foreground flex flex-col items-center"
    >
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate={canAnimate ? "show" : "hidden"}
        className="w-full max-w-[1200px] px-[var(--page-px)] flex flex-col gap-24 origin-top-left"
      >
        {/* Bio Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-12 w-full relative">
          <div className="flex flex-col gap-8 items-start w-full md:w-[460px] shrink-0 text-left">
            {/* Profile Avatar & Interactive Message */}
            <MaskReveal delay={0.1} className="rounded-full">
              <motion.div
                className="inline-flex items-center gap-3 group rounded-full cursor-pointer select-none"
                onClick={handleAvatarClick}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        className="relative origin-center"
                        animate={
                          clickCount >= 5 ? { scale: 0, rotate: 1080, opacity: 0 } :
                          { scale: 1, rotate: 0, opacity: 1 }
                        }
                        whileTap={!isDisabled ? { scale: 0.7, rotate: -15 } : {}}
                        transition={
                          clickCount >= 5 
                            ? { duration: 0.8, ease: "backIn" } 
                            : { type: "spring", stiffness: 400, damping: 17 }
                        }
                      >
                        <Image
                          className="w-8 h-8 rounded-full group-hover:shadow-md transition-shadow"
                          src="/avatar.webp"
                          alt="Ransford Gyasi"
                          width={32}
                          height={32}
                          priority
                          decoding="async"
                          draggable={false}
                        />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs font-normal tracking-tight">
                      {clickCount > 0 ? "Ouch!" : "Ransford Gyasi"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="relative overflow-hidden h-6 flex items-center min-w-[200px]">
                  <AnimatePresence mode="popLayout">
                    <motion.h1
                      key={clickCount}
                      initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="text-foreground text-base font-semibold tracking-tight whitespace-nowrap absolute"
                    >
                      {messages[clickCount]}
                    </motion.h1>
                  </AnimatePresence>
                </div>
              </motion.div>
            </MaskReveal>

            {/* Tabs & Bio Section */}
            <TabsSection canAnimate={canAnimate} />
          </div>

          {/* Floating Polygons */}
          <div className="hidden md:block relative w-[320px] h-[280px] shrink-0 overflow-visible" aria-hidden="true">
            {/* 3D Interactive Distorted Glass Blob */}
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <Interactive3DBlob />
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section id="case-studies" className="flex flex-col gap-8 items-start w-full">
          <MaskReveal delay={0.35}>
            <div className="flex items-center gap-3">
              <h2 className="text-foreground text-base font-semibold tracking-tight">Case studies</h2>
              <div className="inline-flex items-center justify-center px-2 py-0.5 bg-[#008f8c]/10 dark:bg-[#00fff6]/10 border border-[#008f8c]/20 dark:border-[#00fff6]/20 rounded-full text-xs font-semibold text-[#008f8c] dark:text-[#00fff6]">
                <NumberTicker value={String(caseStudies.length).padStart(2, "0")} />
              </div>
            </div>
          </MaskReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {caseStudies.map((study, idx) => (
              <MaskReveal key={study.slug} delay={0.4 + idx * 0.05} className="h-full">
                <ProjectItem
                  title={study.title}
                  slug={study.slug}
                  description={study.description}
                  heroSrc={study.heroSrc}
                  isLocked={study.isLocked}
                  color={study.color}
                  isDimmed={hoveredId !== null && hoveredId !== study.slug}
                  isHovered={hoveredId === study.slug}
                  onMouseEnter={() => setHoveredId(study.slug)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </MaskReveal>
            ))}
          </div>
        </section>


        {/* Footer Links */}
         <footer className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full pt-16 border-t border-foreground/10">
           <div className="flex flex-col gap-6 text-left">
             <h3 className="text-foreground text-base font-semibold tracking-tight">Connect</h3>
             <div className="flex flex-col gap-2">
               <a href="mailto:rnsfordgyasi@gmail.com" className="group relative flex items-end overflow-hidden rounded-2xl px-6 py-4 text-foreground/60 hover:text-white hover:bg-[#1d1d1d] text-base font-semibold transition-all duration-300 w-full">
                 Mail
                 <div className="absolute right-[-6px] top-[-6px] w-[52px] h-[52px] text-white/20 -rotate-[15deg] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                 </div>
               </a>
               <a href="https://www.linkedin.com/in/ransford-gyasi/" target="_blank" rel="noopener noreferrer" className="group relative flex items-end overflow-hidden rounded-2xl px-6 py-4 text-foreground/60 hover:text-white hover:bg-[#1d1d1d] text-base font-semibold transition-all duration-300 w-full">
                 LinkedIn
                 <div className="absolute right-[-6px] top-[-6px] w-[52px] h-[52px] text-white/20 -rotate-[30deg] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                 </div>
               </a>
               <a href="https://github.com/ckbcodess" target="_blank" rel="noopener noreferrer" className="group relative flex items-end overflow-hidden rounded-2xl px-6 py-4 text-foreground/60 hover:text-white hover:bg-[#1d1d1d] text-base font-semibold transition-all duration-300 w-full">
                 Github
                 <div className="absolute right-[-6px] top-[-6px] w-[52px] h-[52px] text-white/20 -rotate-[30deg] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                 </div>
               </a>
             </div>
           </div>
 
           <div className="flex flex-col gap-6 text-left">
             <h3 className="text-foreground text-base font-semibold tracking-tight">My Art</h3>
             <div className="flex flex-col gap-2">
               <a href="https://x.com/ckbdidit?lang=en" target="_blank" rel="noopener noreferrer" className="group relative flex items-end overflow-hidden rounded-2xl px-6 py-4 text-foreground/60 hover:text-white hover:bg-[#1d1d1d] text-base font-semibold transition-all duration-300 w-full">
                 X (Twitter)
                 <div className="absolute right-[-6px] top-[-6px] w-[52px] h-[52px] text-white/20 -rotate-[24deg] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                 </div>
               </a>
               <a href="https://www.instagram.com/ckb.didit/?hl=en" target="_blank" rel="noopener noreferrer" className="group relative flex items-end overflow-hidden rounded-2xl px-6 py-4 text-foreground/60 hover:text-white hover:bg-[#1d1d1d] text-base font-semibold transition-all duration-300 w-full">
                 Instagram
                 <div className="absolute right-[-6px] top-[-6px] w-[52px] h-[52px] text-white/20 -rotate-[30deg] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                 </div>
               </a>
               <a href="https://www.artstation.com/ckbdidit" target="_blank" rel="noopener noreferrer" className="group relative flex items-end overflow-hidden rounded-2xl px-6 py-4 text-foreground/60 hover:text-white hover:bg-[#1d1d1d] text-base font-semibold transition-all duration-300 w-full">
                 Artstation
                 <div className="absolute right-[-6px] top-[-6px] w-[52px] h-[52px] text-white/20 -rotate-[20deg] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.164-1.333H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zM10.94 9.729L15.272 17H6.607l4.333-7.271z"/></svg>
                 </div>
               </a>
             </div>
           </div>
         </footer>
      </motion.main>

      <Lightbox 
        src={activeExp}
        onClose={() => setActiveExp(null)}
        alt="Experiment Preview"
      />
    </div>
  );
}

const ProjectItem = React.memo(function ProjectItem({
  title,
  slug,
  description,
  heroSrc,
  color = "#ff4d4d",
  isLocked = false,
  isDimmed = false,
  isHovered = false,
  onMouseEnter,
  onMouseLeave,
}: {
  title: string;
  slug: string;
  description: string;
  heroSrc: string;
  color?: string;
  isLocked?: boolean;
  isDimmed?: boolean;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const content = (
    <div
      data-cursor={isLocked ? "confidential" : "case-study"}
      className={`group bg-[#efefef] dark:bg-[#202020] rounded-2xl p-4 flex flex-col gap-4 transition-all duration-500 ease-out w-full h-full text-left ${
        isDimmed 
          ? "opacity-35 blur-[1.5px] grayscale" 
          : isHovered 
            ? "opacity-100 shadow-lg dark:shadow-black/20 grayscale-0" 
            : "opacity-100"
      }`}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[301/221] rounded-xl overflow-hidden bg-white/5">
        <Image
          src={heroSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500"
          sizes="(max-w-md) 100vw, 400px"
        />
        {isLocked && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white flex items-center justify-center">
            <Lock size={12} />
          </div>
        )}
      </div>
      
      {/* Title & Description */}
      <div className="flex flex-col gap-2">
        <h3 className="text-foreground text-lg font-normal tracking-tight flex items-center gap-2 transition-colors">
          {title}
        </h3>
        <p className="text-foreground/40 text-base font-normal leading-relaxed max-w-[360px]">
          {description}
        </p>
      </div>
    </div>
  );

  if (!slug) return content;

  return (
    <TransitionLink
      href={`/work/${slug}`}
      label={title}
      color={color}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="block w-full focus:outline-none rounded-2xl h-full"
    >
      {content}
    </TransitionLink>
  );
});
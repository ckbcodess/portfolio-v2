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
import InteractiveSectionBadge from "@/components/InteractiveSectionBadge";

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
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

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
      className="bg-background min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 md:pb-24 w-full selection:bg-primary selection:text-primary-foreground flex flex-col items-center"
    >
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate={canAnimate ? "show" : "hidden"}
        className="w-full max-w-[1200px] px-[var(--page-px)] flex flex-col gap-16 sm:gap-20 md:gap-24 origin-top-left"
      >
        {/* Bio Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 w-full relative">
          <div className="flex flex-col gap-3 sm:gap-4 items-start w-full md:w-[460px] shrink-0 text-left">
            {/* Profile Avatar & Interactive Message */}
            <MaskReveal delay={0.85} className="rounded-full">
              <motion.div
                className="inline-flex items-center gap-3 group rounded-full cursor-pointer select-none hover-shimmer-trigger"
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
                      className={`text-foreground text-sm font-medium tracking-tight whitespace-nowrap absolute ${
                        clickCount === 0 ? "shimmer shimmer-duration-2200" : ""
                      }`}
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
          <div className="relative w-[260px] sm:w-[280px] h-[230px] sm:h-[250px] max-w-full shrink-0 overflow-visible mx-auto md:mx-0 touch-pan-y" aria-hidden="true">
            {/* 3D Interactive Distorted Glass Blob */}
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <Interactive3DBlob />
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section id="case-studies" className="flex flex-col gap-8 items-start w-full pt-12 sm:pt-16 border-t border-foreground/10">
          <div className="flex items-center gap-3 overflow-visible">
            <MaskReveal delay={0.35}>
              <h2 className="text-foreground text-base font-medium tracking-tight">Case studies</h2>
            </MaskReveal>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={canAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-visible"
            >
              <InteractiveSectionBadge>
                <NumberTicker value={String(caseStudies.length).padStart(2, "0")} />
              </InteractiveSectionBadge>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 w-full">
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

        {/* Connect Section */}
        <section id="connect" className="flex flex-col gap-8 items-start w-full pt-12 sm:pt-16 border-t border-foreground/10">
          <MaskReveal delay={0.65}>
            <h2 className="text-foreground text-base font-medium tracking-tight">Connect</h2>
          </MaskReveal>

          <div className="flex flex-row justify-between w-full relative min-h-[240px] items-start pb-8" data-node-id="2820:12786">
            {/* Links Column */}
            <div className="flex flex-col gap-6 md:gap-8 w-full relative z-10" data-node-id="2820:12962">
              {[
                { id: "mail", label: "Mail", href: "mailto:rnsfordgyasi@gmail.com", external: false },
                { id: "linkedin", label: "Linkedin", href: "https://www.linkedin.com/in/ransford-gyasi/", external: true },
                { id: "github", label: "Github", href: "https://github.com/ckbcodess", external: true },
              ].map((link) => {
                const isLinkDimmed = hoveredLink !== null && hoveredLink !== link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`text-foreground hover:text-foreground text-sm sm:text-base font-medium transition-all duration-300 leading-none tracking-[-0.32px] block w-full ${
                      isLinkDimmed ? "opacity-30" : "opacity-100"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}

              {/* Group for X and Instagram with bracket attached dynamically to its height */}
              <div className="flex flex-col gap-6 md:gap-8 relative w-full">
                {[
                  { id: "x", label: "X (Twitter)", href: "https://x.com/ckbdidit?lang=en", external: true },
                  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/ckb.didit/?hl=en", external: true },
                ].map((link) => {
                  const isLinkDimmed = hoveredLink !== null && hoveredLink !== link.id;
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      onMouseEnter={() => setHoveredLink(link.id)}
                      onMouseLeave={() => setHoveredLink(null)}
                      className={`text-foreground hover:text-foreground text-sm sm:text-base font-medium transition-all duration-300 leading-none tracking-[-0.32px] block w-full ${
                        isLinkDimmed ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      {link.label}
                    </a>
                  );
                })}

                {/* Bracket & label annotation for X and Instagram */}
                <div
                  className="hidden sm:flex absolute left-[110px] sm:left-[130px] md:left-[140px] top-0 bottom-0 items-center pointer-events-none transition-all duration-300"
                  style={{
                    opacity: hoveredLink !== null && hoveredLink !== "x" && hoveredLink !== "instagram" ? 0.3 : 1,
                  }}
                >
                  <BracketSVG />
                  <span 
                    className="ml-2 sm:ml-3 text-[10px] text-foreground/45 font-normal tracking-[-0.2px] whitespace-nowrap"
                    style={{ fontFamily: "var(--font-handwriting, 'Georgia', cursive)", fontStyle: "italic" }}
                  >
                    my art
                  </span>
                </div>
              </div>
            </div>

            {/* Absolute Brand Logo on the Right */}
            <div className="absolute right-0 bottom-8 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center pointer-events-none">
              <AnimatePresence>
                {hoveredLink && (
                  <motion.div
                    key={hoveredLink}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 600, damping: 35 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {renderLogo(hoveredLink)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
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
      className={`group flex flex-col gap-4 transition-all duration-500 ease-out w-full h-full text-left ${
        isDimmed 
          ? "opacity-30" 
          : "opacity-100"
      }`}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[386/221] rounded-[4px] overflow-hidden bg-white/5">
        <Image
          src={heroSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-w-md) 100vw, 400px"
        />
        {isLocked && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-2 text-white flex items-center justify-center">
            <Lock size={12} />
          </div>
        )}
      </div>
      
      {/* Title & Description */}
      <div className="flex flex-col gap-3 items-start w-full">
        <h3 className="font-heading text-lg sm:text-[20px] font-normal tracking-[-0.6px] leading-[1.4] flex items-center gap-2 text-foreground transition-colors">
          {title}
        </h3>
        <p className="text-foreground opacity-35 group-hover:opacity-60 text-sm sm:text-[16px] font-medium leading-[1.4] max-w-none w-full transition-all duration-300">
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
      className="block w-full focus:outline-none rounded-[4px] h-full"
    >
      {content}
    </TransitionLink>
  );
});

// Helper component for the handwritten bracket annotation
const BracketSVG = () => (
  <svg viewBox="0 0 32.3154 45.9047" className="w-[32px] h-[46px] select-none text-foreground/20 dark:text-white/20 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 0.5H21.5873M21.5873 0.5H21.7092M21.5873 0.5V0.410316M21.5873 0.5V45.4047M21.5873 45.4047V45.6681M21.5873 45.4047H0M21.5873 45.4047H21.7092M21.4609 22.7756H32.3154"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Helper component to render brand logos on the right without glow
const renderLogo = (id: string) => {
  switch (id) {
    case "mail":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="url(#mailGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <defs>
            <linearGradient id="mailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="url(#linkedinGrad)">
          <defs>
            <linearGradient id="linkedinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="url(#githubGrad)">
          <defs>
            <linearGradient id="githubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F4F4F5" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
          </defs>
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="url(#xGrad)">
          <defs>
            <linearGradient id="xGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#A3A3A3" />
            </linearGradient>
          </defs>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 86.8 86.8" className="w-full h-full" fill="url(#instaGrad)">
          <defs>
            <radialGradient id="instaGrad" cx="30%" cy="100%" r="100%" fx="30%" fy="100%">
              <stop offset="0%" stopColor="#fdf497" />
              <stop offset="5%" stopColor="#fdf497" />
              <stop offset="45%" stopColor="#fd5949" />
              <stop offset="60%" stopColor="#d6249f" />
              <stop offset="90%" stopColor="#285AEB" />
            </radialGradient>
          </defs>
          <path d="M43.3906 0C55.1747 4.28792e-07 56.6529 0.0496925 61.2803 0.261719C65.8986 0.471676 69.0525 1.20557 71.8125 2.27734C74.708 3.3671 77.3316 5.07547 79.499 7.2832C81.7062 9.45049 83.4144 12.0736 84.5039 14.9688C85.5765 17.7286 86.3097 20.8827 86.5205 25.501C86.7317 30.1283 86.7812 31.6067 86.7812 43.3906C86.7812 55.1744 86.7317 56.6525 86.5205 61.2803C86.3097 65.8987 85.5766 69.0533 84.5039 71.8135C83.3891 74.6959 81.6843 77.3137 79.499 79.499C77.3138 81.6843 74.6958 83.3891 71.8135 84.5039C69.0536 85.5766 65.8996 86.3097 61.2812 86.5205C56.654 86.7317 55.1752 86.7812 43.3916 86.7812C31.6076 86.7812 30.129 86.7317 25.501 86.5205C20.8828 86.3097 17.7288 85.5766 14.9688 84.5039C12.0735 83.4144 9.45053 81.7063 7.2832 79.499C5.07602 77.3317 3.36882 74.7086 2.2793 71.8135C1.2066 69.0535 0.472539 65.8989 0.261719 61.2803C0.0497091 56.6532 0 55.1746 0 43.3906C5.47183e-07 31.6065 0.0496954 30.1283 0.261719 25.501C0.471677 20.8824 1.2055 17.7279 2.27734 14.9678C3.36723 12.0727 5.07565 9.45027 7.2832 7.2832C9.45053 5.07591 12.0735 3.36785 14.9688 2.27832C17.7287 1.20564 20.8825 0.471568 25.501 0.260742C28.9714 0.102371 30.6706 0.0346904 36.2744 0.0107422L43.3906 0ZM43.3906 7.81836C31.8051 7.81836 30.4325 7.86255 25.8574 8.07129C21.6269 8.2642 19.3288 8.9712 17.7998 9.56543C15.9153 10.261 14.2101 11.3695 12.8105 12.8105C11.3694 14.2101 10.2601 15.9152 9.56445 17.7998C8.97023 19.3289 8.26339 21.6269 8.07031 25.8574C7.86156 30.4332 7.81738 31.8055 7.81738 43.3916C7.81738 54.9776 7.86156 56.3504 8.07031 60.9258C8.26324 65.156 8.97025 67.4535 9.56445 68.9824C10.2165 70.7491 11.2323 72.3577 12.5439 73.7051L13.0762 74.2373C14.4237 75.5494 16.0328 76.5656 17.7998 77.2178C19.3289 77.8118 21.6263 78.5179 25.8564 78.7109C30.4316 78.9197 31.8036 78.9648 43.3906 78.9648C54.9775 78.9648 56.3502 78.9197 60.9248 78.7109C65.155 78.518 67.4525 77.812 68.9814 77.2178C70.8528 76.4959 72.5524 75.39 73.9707 73.9717C75.3889 72.5534 76.494 70.8537 77.2158 68.9824C77.8098 67.4533 78.5169 65.156 78.71 60.9258C78.9187 56.3499 78.9629 54.9776 78.9629 43.3916C78.9629 31.8054 78.9187 30.4329 78.71 25.8574C78.5171 21.6269 77.81 19.3288 77.2158 17.7998C76.5637 16.0331 75.5481 14.4245 74.2363 13.0771L73.7041 12.5449C72.3567 11.2332 70.7482 10.2175 68.9814 9.56543C67.4524 8.97122 65.155 8.2644 60.9248 8.07129C57.4928 7.91472 55.8625 7.85036 50.374 7.82812L43.3906 7.81836ZM43.3906 21.1094C49.3001 21.1094 54.9679 23.4571 59.1465 27.6357C63.325 31.8144 65.6729 37.4821 65.6729 43.3916C65.6728 47.7984 64.3662 52.1064 61.918 55.7705C59.4697 59.4347 55.9893 62.2901 51.918 63.9766C47.8465 65.663 43.3662 66.1049 39.0439 65.2451C34.7218 64.3854 30.7519 62.2626 27.6357 59.1465C24.5196 56.0303 22.3969 52.0605 21.5371 47.7383C20.6774 43.416 21.1192 38.9357 22.8057 34.8643C24.4921 30.7929 27.3476 27.3126 31.0117 24.8643C34.6758 22.416 38.9839 21.1095 43.3906 21.1094ZM48.9258 30.0283C46.2831 28.9337 43.3748 28.648 40.5693 29.2061C37.7638 29.7642 35.1867 31.1414 33.1641 33.1641C31.1414 35.1868 29.7642 37.7638 29.2061 40.5693C28.648 43.3749 28.9338 46.283 30.0283 48.9258C31.123 51.5686 32.9771 53.8277 35.3555 55.417C37.7338 57.0062 40.5302 57.8544 43.3906 57.8545C47.2266 57.8545 50.9057 56.3306 53.6182 53.6182C56.3304 50.9058 57.8543 47.2274 57.8545 43.3916C57.8545 40.531 57.0062 37.734 55.417 35.3555C53.8278 32.9771 51.5685 31.123 48.9258 30.0283ZM66.5518 15.0234C69.4273 15.0236 71.7578 17.3549 71.7578 20.2305C71.7577 23.1059 69.4272 25.4374 66.5518 25.4375C63.6762 25.4375 61.3448 23.106 61.3447 20.2305C61.3447 17.3548 63.6761 15.0234 66.5518 15.0234Z" />
        </svg>
      );
    default:
      return null;
  }
};
"use client";
// Force Vercel rebuild - 2026-04-20


import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import TabsSection from "@/components/TabsSection";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { ArrowRight, Lock } from "lucide-react";
import PreviewCard from "@/components/PreviewCard";
import { caseStudies } from "@/content/case-studies";
import { MaskReveal } from "@/components/MaskReveal";
import FixedPreview from "@/components/FixedPreview";

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<string>(caseStudies[0].heroSrc);
  const [surprises, setSurprises] = useState<number[]>([]);
  const [canAnimate, setCanAnimate] = useState(true);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(caseStudies[0]?.slug ?? null);

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
    hidden: { opacity: 1, scale: 1 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const handleAvatarClick = () => {
    const sounds = ["/sounds/pop-1.wav", "/sounds/pop-2.wav", "/sounds/pop-3.wav"];
    const audio = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
    audio.volume = 0.4;
    audio.play().catch(() => { });

    const id = Date.now();
    setSurprises((prev) => [...prev, id]);
    setTimeout(() => setSurprises((prev) => prev.filter((s) => s !== id)), 1000);
  };

  return (
    <div
      ref={pageRef}
      className="bg-background min-h-screen pt-[128px] md:pt-56 pb-[var(--page-pt)] lg:pb-[8vh] w-full selection:bg-primary selection:text-primary-foreground flex flex-col"
    >
      {/* Main Content */}
      <div className="w-full flex-1 flex flex-col lg:flex-row lg:items-stretch lg:justify-start gap-12 lg:gap-16 px-[var(--page-px)]">
        {/* Left Column */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate={canAnimate ? "show" : "hidden"}
          className="flex flex-col gap-16 w-full max-w-[38.5rem] lg:flex-1 lg:justify-between items-start origin-top-left"
        >
          {/* Hero Section */}
          <div className="self-stretch flex flex-col justify-start items-start gap-10">
            {/* Profile */}
            <MaskReveal delay={0.1} className="rounded-full">
              <motion.div
                className="inline-flex items-center gap-3 group rounded-full cursor-pointer"
                onClick={handleAvatarClick}
                whileTap={{ scale: 0.95 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <motion.div
                        className="relative"
                        animate={surprises.length > 0 ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Image
                          className="w-8 h-8 rounded-full shadow-sm group-hover:shadow-md transition-shadow"
                          src="/avatar.webp"
                          alt="Ransford Gyasi"
                          width={32}
                          height={32}
                          priority
                          decoding="async"
                        />
                        <SurpriseParticles ids={surprises} />
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px] font-normal tracking-tight">
                      {surprises.length > 0 ? "You found me! ✨" : "Hey, I'm Ransford"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-foreground text-base font-normal">Hey, I'm Ransford :)</p>
              </motion.div>
            </MaskReveal>

            {/* Headline & Navigation */}
            <div className="w-full">
              <TabsSection canAnimate={canAnimate} />
            </div>

            {/* Social Links */}
            <MaskReveal delay={0.3} className="rounded-full">
              <SocialLinks />
            </MaskReveal>

            {/* Mobile Preview */}
            <div className="lg:hidden w-full my-4 relative">
              <PreviewCard activeImage={activeImage} className="w-full border border-foreground/5 rounded-xl shadow-sm" />
            </div>
          </div>

          {/* Case Studies */}
          <div className="self-stretch flex flex-col justify-start items-start gap-10">
            <section className="self-stretch flex flex-col justify-start items-start gap-8">
              <MaskReveal delay={0.4}>
                <h2 className="text-muted-foreground text-sm font-normal leading-none tracking-tight">Case Studies</h2>
              </MaskReveal>
              <div className="flex flex-col justify-start items-start gap-4 w-full">
                {caseStudies.slice(0, 2).map((study, idx) => (
                  <MaskReveal key={study.slug} delay={0.5 + idx * 0.05} className="w-[calc(100%+4rem)] -mx-8 px-8 -my-6 py-6">
                    <motion.div
                      className="w-full"
                      onMouseEnter={() => {
                        setActiveImage(study.heroSrc);
                        setHoveredSlug(study.slug);
                      }}
                      onFocus={() => {
                        setActiveImage(study.heroSrc);
                        setHoveredSlug(study.slug);
                      }}
                      onMouseLeave={() => setHoveredSlug(caseStudies[0]?.slug ?? null)}
                      onBlur={() => setHoveredSlug(caseStudies[0]?.slug ?? null)}
                      animate={{
                        opacity: hoveredSlug && hoveredSlug !== study.slug ? 0.5 : 1,
                        y: hoveredSlug === study.slug ? -2 : 0,
                        scale: hoveredSlug === study.slug ? 1.01 : 1,
                        filter: hoveredSlug && hoveredSlug !== study.slug ? "saturate(0.85)" : "saturate(1)",
                      }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ProjectItem
                        title={study.logoText || study.title}
                        slug={study.slug}
                        isLocked={study.isLocked}
                        color={study.logoClassName?.includes("#") ? study.logoClassName.split("[")[1].split("]")[0] : "#333"}
                        isActive={hoveredSlug === study.slug}
                        isDimmed={!!hoveredSlug && hoveredSlug !== study.slug}
                      />
                    </motion.div>
                  </MaskReveal>
                ))}
              </div>
              <div className="lg:hidden w-full pt-2">
                <MaskReveal delay={0.6}>
                  <a
                    href="https://drive.google.com/file/d/1EJm5aBA3I95pPkgT-4PDKTlOZe7ChLH9/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-4 -mx-4 rounded-2xl transition-[transform,background-color,opacity] duration-300 cursor-pointer bg-transparent hover:bg-foreground/[0.02]"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 bg-foreground/5 border border-foreground/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground/60"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      </div>
                      <div className="flex flex-col justify-center items-start">
                        <h3 className="text-foreground text-lg font-normal">View Resume</h3>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-foreground opacity-100" />
                  </a>
                </MaskReveal>
              </div>
            </section>
          </div>
        </motion.main>
      </div>

      {/* Desktop Preview — Fixed Position */}
      <FixedPreview activeImage={activeImage} isVisible={canAnimate} />
    </div>
  );
}

function SurpriseParticles({ ids }: { ids: number[] }) {
  const colors = ["#ff4d4d", "#4d79ff", "#4dff88", "#ffcc4d"];

  return (
    <AnimatePresence>
      {ids.map((id) => (
        <div key={id} className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1.5, 0],
                x: (Math.random() - 0.5) * 80,
                y: -40 - Math.random() * 60,
                opacity: 0,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: colors[i % colors.length],
                left: "50%",
                top: "50%",
              }}
            />
          ))}
        </div>
      ))}
    </AnimatePresence>
  );
}

const SocialLinks = React.memo(function SocialLinks() {
  return (
    <nav className="inline-flex items-start gap-3">
      <SocialLink href="https://www.linkedin.com/in/ransford-gyasi/" aria-label="LinkedIn" icon="linkedin" />
      <SocialLink href="mailto:rnsfordgyasi@gmail.com" aria-label="Email" icon="email" />
    </nav>
  );
});

const SocialLink = React.memo(function SocialLink({ href, icon, "aria-label": ariaLabel }: { href: string; icon: string; "aria-label": string }) {
  const isEmail = href.startsWith("mailto");
  const isLinkedIn = icon === "linkedin";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.a
          whileTap={{ scale: 0.94 }}
          href={href}
          {...(!isEmail && { target: "_blank" })}
          aria-label={ariaLabel}
          data-cursor="wrap"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group ${isLinkedIn
              ? "bg-foreground/5 hover:bg-[#0774E2]"
              : "bg-foreground/5 hover:bg-[#FFD700]"
            }`}
        >
          {isLinkedIn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 group-hover:opacity-100 group-hover:fill-white transition-all duration-300">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="opacity-60 group-hover:opacity-100 group-hover:fill-black transition-all duration-300">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          )}
        </motion.a>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={12} className="text-xs">
        <p>{isLinkedIn ? "Connect on LinkedIn" : "Send an Email"}</p>
      </TooltipContent>
    </Tooltip>
  );
});

const ProjectItem = React.memo(function ProjectItem({
  title,
  slug,
  color = "#ff4d4d",
  isLocked = false,
  isActive = false,
  isDimmed = false,
}: {
  title: string;
  slug: string;
  color?: string;
  isLocked?: boolean;
  isActive?: boolean;
  isDimmed?: boolean;
}) {
  const content = (
    <div
      data-cursor={isLocked ? "confidential" : "case-study"}
      className={`group flex items-center justify-between w-full p-4 -mx-4 rounded-2xl transition-[transform,background-color,opacity] duration-300 cursor-pointer ${isActive
        ? "bg-foreground/[0.03]"
        : "bg-transparent hover:bg-foreground/[0.02]"
        } ${isDimmed ? "opacity-55" : "opacity-100"}`}
    >
      <div className="flex items-center gap-5">
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 relative overflow-hidden ${isActive ? "scale-[1.04]" : "group-hover:scale-[1.02]"
            }`}
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          <div className={`absolute inset-0 bg-white/10 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
          <span className="relative z-10 text-white text-[10px] font-bold uppercase tracking-widest opacity-90">{title.slice(0, 5)}</span>
        </div>
        <div className="flex flex-col justify-center items-start">
          <div className="flex items-center gap-2">
            <h3 className={`text-foreground text-lg font-normal transition-transform duration-300 ${isActive ? "translate-x-0.5" : ""}`}>{title}</h3>
            {isLocked && <Lock size={16} className="text-muted-foreground" />}
          </div>
          <p className="text-muted-foreground text-sm font-normal mt-1 opacity-40">{new Date().getFullYear()}</p>
        </div>
      </div>
      <ArrowRight size={20} className={`text-foreground transition-all duration-200 ${isActive ? "opacity-100 translate-x-1" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"}`} />
    </div>
  );

  if (!slug) return content;

  return (
    <TransitionLink href={`/work/${slug}`} label={title} color={color} className="block w-full focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl">
      {content}
    </TransitionLink>
  );
});

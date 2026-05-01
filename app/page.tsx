"use client";
// Force Vercel rebuild - 2026-04-20


import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import TabsSection from "@/components/TabsSection";
import { useRef, useState, useEffect } from "react";
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
  const [canAnimate, setCanAnimate] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

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
    hidden: { opacity: 0, scale: 0.98 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const handleAvatarClick = () => {
    const sounds = ["/sounds/pop-1.wav", "/sounds/pop-2.wav", "/sounds/pop-3.wav"];
    const audio = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
    audio.volume = 0.4;
    audio.play().catch(() => {});

    const id = Date.now();
    setSurprises((prev) => [...prev, id]);
    setTimeout(() => setSurprises((prev) => prev.filter((s) => s !== id)), 1000);
  };

  return (
    <div
      ref={pageRef}
      className="bg-background min-h-screen lg:h-screen lg:overflow-hidden pt-32 md:pt-44 pb-[var(--page-pt)] lg:pb-[8vh] w-full selection:bg-primary selection:text-primary-foreground flex flex-col"
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
            <div className="lg:hidden w-full my-4">
              <PreviewCard activeImage={activeImage} />
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
                  <MaskReveal key={study.slug} delay={0.5 + idx * 0.05} className="w-full -mx-4 px-4">
                    <motion.div
                      className="w-full"
                      onMouseEnter={() => {
                        setActiveImage(study.heroSrc);
                        setHoveredSlug(study.slug);
                      }}
                      onMouseLeave={() => setHoveredSlug(null)}
                      animate={{ opacity: hoveredSlug && hoveredSlug !== study.slug ? 0.6 : 1 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ProjectItem
                        title={study.logoText || study.title}
                        subtitle={study.sections[0].heading}
                        slug={study.slug}
                        isLocked={study.isLocked}
                        color={study.logoClassName?.includes("#") ? study.logoClassName.split("[")[1].split("]")[0] : "#333"}
                      />
                    </motion.div>
                  </MaskReveal>
                ))}
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

function SocialLinks() {
  return (
    <nav className="inline-flex items-start gap-3">
      <SocialLink href="https://www.linkedin.com/in/ransford-gyasi/" aria-label="LinkedIn" icon="linkedin" />
      <SocialLink href="mailto:rnsfordgyasi@gmail.com" aria-label="Email" icon="email" />
    </nav>
  );
}

function SocialLink({ href, icon, "aria-label": ariaLabel }: { href: string; icon: string; "aria-label": string }) {
  const isEmail = href.startsWith("mailto");
  return (
    <motion.a
      whileTap={{ scale: 0.94 }}
      href={href}
      {...(!isEmail && { target: "_blank" })}
      aria-label={ariaLabel}
      className="w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 border border-border/50 flex items-center justify-center transition-colors"
    >
      {icon === "linkedin" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )}
    </motion.a>
  );
}

function ProjectItem({
  title,
  subtitle,
  slug,
  color = "#ff4d4d",
  isLocked = false,
}: {
  title: string;
  subtitle: string;
  slug: string;
  color?: string;
  isLocked?: boolean;
}) {
  const content = (
    <div
      data-cursor={isLocked ? "confidential" : "case-study"}
      className="group flex items-center justify-between w-full p-4 -mx-4 rounded-xl hover:bg-foreground/[0.04] transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-[1.02] shadow-sm relative overflow-hidden"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
          <span className="relative z-10 text-white text-[10px] font-bold uppercase tracking-widest opacity-90">{title.slice(0, 5)}</span>
        </div>
        <div className="flex flex-col justify-center items-start">
          <div className="flex items-center gap-2">
            <h3 className="text-foreground text-lg font-normal">{title}</h3>
            {isLocked && <Lock size={16} className="text-muted-foreground" />}
          </div>
          <p className="text-muted-foreground text-sm font-normal mt-1 opacity-40">{new Date().getFullYear()}</p>
        </div>
      </div>
      <ArrowRight size={20} className="text-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
    </div>
  );

  if (!slug) return content;

  return (
    <TransitionLink href={`/work/${slug}`} label={title} color={color} className="w-full">
      {content}
    </TransitionLink>
  );
}

"use client";

import Image from "next/image";
import { CaseStudyContent } from "@/content/case-studies/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTransition } from "@/components/TransitionProvider";
import CaseStudyBackground from "@/components/CaseStudyBackground";
import CaseStudySidebar from "@/components/CaseStudySidebar";
import { motion, AnimatePresence } from "motion/react";
import { MaskReveal } from "@/components/MaskReveal";
import LockedCaseStudy from "@/components/LockedCaseStudy";
import MobileCaseStudyNav from "@/components/MobileCaseStudyNav";




interface CaseStudyPageProps {
  caseStudy: CaseStudyContent;
}

export default function CaseStudyPage({ caseStudy }: CaseStudyPageProps) {
  const { setHeaderProps, canAnimate } = useTransition();
  const introRef = useRef<HTMLElement>(null);
  const missionEndRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const isActuallyLocked = caseStudy.isLocked && !isUnlocked;
  
  // Sidebar logic: Trigger sidebar based on scroll
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 120;
          
          // Sync header scroll state - only update if changed to prevent app-wide re-renders
          setHeaderProps(prev => {
            if (prev.scrolled === isScrolled) return prev;
            return { ...prev, scrolled: isScrolled };
          });

          if (introRef.current) {
            const rect = introRef.current.getBoundingClientRect();
            const shouldShowSidebar = rect.bottom < 200;
            setShowSidebar(prev => {
              if (prev === shouldShowSidebar) return prev;
              return shouldShowSidebar;
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setHeaderProps]);

  // Hide scrollbar on mount, restore on unmount
  useEffect(() => {
    document.documentElement.classList.add('scrollbar-hide');
    return () => document.documentElement.classList.remove('scrollbar-hide');
  }, []);

  // Simple header configuration
  useEffect(() => {
    setHeaderProps(prev => ({
      ...prev,
      isCaseStudy: true,
      scrolled: window.scrollY > 120,
      backLink: "/",
      variant: "default",
      hidden: isActuallyLocked
    }));
  }, [setHeaderProps, isActuallyLocked]);

  const sidebarLinks = useMemo(() => [
    { id: "intro", label: "Intro", targetIds: ["intro"] },
    ...caseStudy.sections.reduce((acc, section) => {
      const existing = acc.find(l => l.label === section.label);
      if (existing) {
        existing.targetIds = [...(existing.targetIds || [existing.id]), section.id];
      } else {
        acc.push({ id: section.id, label: section.label, targetIds: [section.id] });
      }
      return acc;
    }, [] as { id: string, label: string, targetIds: string[] }[])
  ], [caseStudy.sections]);

  if (isActuallyLocked) {
    return (
      <LockedCaseStudy 
        key="locked"
        caseStudy={caseStudy} 
        onUnlock={() => setIsUnlocked(true)} 
      />
    );
  }

  return (
    <motion.main 
      key="content"
      initial={{ opacity: 0 }}
      animate={canAnimate ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground" 
      role="main"
    >
      <CaseStudyBackground colors={caseStudy.gradientColors} />
      <CaseStudySidebar 
        visible={showSidebar}
        links={sidebarLinks} 
      />
      <MobileCaseStudyNav 
        links={sidebarLinks}
      />
      
      <div className="pt-[128px] md:pt-[220px] pb-20 px-[var(--page-px)] w-full overflow-x-hidden relative z-10">
        {/* Prominent Hero Section */}
        <section ref={introRef} id="intro" aria-labelledby="case-study-title" className="text-white">
          <div className="flex flex-col gap-8">
            <MaskReveal delay={0.4}>
              <h1 
                id="case-study-title"
                className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight max-w-4xl break-words"
              >
                {caseStudy.title}
              </h1>
            </MaskReveal>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
              <MaskReveal delay={0.5}>
                <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed break-words">
                  {caseStudy.description}
                </p>
              </MaskReveal>

              {/* Metadata Grid - Hardened against long values */}
              <MaskReveal delay={0.6}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-6 min-w-0">
                  {caseStudy.meta.map((item) => (
                    <div key={item.label} className="flex flex-col gap-1 min-w-0">
                      <span className="text-[10px] uppercase tracking-widest text-white/40 truncate" title={item.label}>
                        {item.label}
                      </span>
                      <span className="text-sm font-normal break-words text-white/90">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </MaskReveal>
            </div>
          </div>

          <div className="mt-20 mb-32">
            <div className="relative overflow-hidden rounded-2xl bg-muted aspect-[21/9]">
              <Image 
                src={caseStudy.heroSrc} 
                alt={caseStudy.heroAlt || `Hero image for ${caseStudy.title}`} 
                fill
                className="object-cover"
                sizes="(max-width: 1400px) 100vw, 1400px"
                priority
              />
            </div>
          </div>

        </section>

        {/* Basic Content Sections - Hardened spacing and flow */}
        <div className="max-w-2xl mx-auto flex flex-col gap-32 relative z-10">
          {caseStudy.sections?.map((section, index) => (
            <section 
              id={section.id} 
              key={section.id} 
              className="flex flex-col gap-8 scroll-mt-32"
            >
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="w-full">
                    <h2 className="text-xl md:text-2xl font-normal tracking-tight break-words">
                      {section.heading}
                    </h2>
                  </div>
                </div>

                
                <div className="flex flex-col gap-6">
                  {section.body.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>


                {section.bullets && (
                  <div className="flex flex-col gap-3 mt-4">
                    {section.bullets.map((bullet, bIndex) => (
                      <div 
                        key={bIndex} 
                        className="flex gap-3 text-base md:text-lg text-muted-foreground leading-relaxed"
                      >
                        <span className="text-primary mt-1.5 shrink-0">•</span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {section.imageSrc && (
                <div className="w-full mt-8">
                  <div className="relative overflow-hidden rounded-2xl bg-muted aspect-video">
                    <Image
                      src={section.imageSrc}
                      alt={section.heading}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                </div>
              )}


              {/* Trigger for sidebar at the bottom of the first section */}
              {index === 0 && <div ref={missionEndRef} className="h-px w-full" />}
            </section>
          ))}
        </div>

        {/* Next Project Footer - Hardened Navigation */}
        {caseStudy.nextProject && (
          <footer className="mt-48 lg:mt-64 pt-32 border-t border-border/50 max-w-4xl mx-auto text-center pb-32 relative z-10">
            <div className="flex flex-col items-center gap-6 group">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60">
                {caseStudy.nextProject.eyebrow || "Next Project"}
              </span>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground/40">{caseStudy.nextProject.label}</p>
                <a 
                  href={caseStudy.nextProject.href}
                  className="text-4xl md:text-6xl lg:text-7xl font-normal tracking-tighter hover:text-primary transition-colors duration-300"
                >
                  {caseStudy.nextProject.title}
                </a>
              </div>
            </div>
          </footer>
        )}
      </div>
    </motion.main>
  );
}
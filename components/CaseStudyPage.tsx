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
import TransitionLink from "@/components/TransitionLink";





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
                      <span className="text-xs uppercase tracking-widest text-white/40 truncate" title={item.label}>
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
            <div className="relative overflow-hidden rounded-lg bg-muted aspect-[4/3] md:aspect-[21/9]">
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
                  <div className="relative overflow-hidden rounded-lg bg-muted aspect-video">
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

        {/* Next Project Footer - Impeccable Design */}
        {caseStudy.nextProject && (
          <footer className="mt-64 pb-48 relative z-10 px-[var(--page-px)]">
            <div className="max-w-7xl mx-auto">
              <div className="h-px w-full bg-white/10 mb-24" />
              
              <TransitionLink 
                href={caseStudy.nextProject.href}
                label={caseStudy.nextProject.label}
                className="group block"
              >
                <div className="flex flex-col gap-12 md:gap-20">
                  <div className="flex items-center gap-6">
                    <span className="text-xs uppercase tracking-[0.4em] text-white/30 font-medium whitespace-nowrap">
                      {caseStudy.nextProject.eyebrow || "Next Case"}
                    </span>
                    <div className="h-px flex-1 bg-white/5 group-hover:bg-white/20 transition-colors duration-700" />
                  </div>
                  
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 lg:gap-24">
                    <div className="flex flex-col gap-6 max-w-4xl">
                      <h2 className="text-5xl md:text-7xl lg:text-[7vw] leading-[0.95] font-normal tracking-tighter text-white/80 group-hover:text-white transition-all duration-700 ease-out group-hover:translate-x-2">
                        {caseStudy.nextProject.title}
                      </h2>
                    </div>
                    
                    <div className="flex flex-col gap-2 shrink-0 md:items-end lg:mb-4 transition-transform duration-700 group-hover:-translate-x-2">
                      <p className="text-xs uppercase tracking-widest text-white/20 font-bold">Client / Project</p>
                      <p className="text-xl md:text-2xl text-white/40 font-light group-hover:text-white transition-colors duration-500">
                        {caseStudy.nextProject.label}
                      </p>
                      
                      <div className="mt-4 flex items-center gap-2 text-white/0 group-hover:text-primary transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                        <span className="text-xs uppercase tracking-widest font-medium">Explore</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-1 transition-transform">
                          <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </TransitionLink>
            </div>
          </footer>
        )}
      </div>
    </motion.main>
  );
}
"use client";

import Image from "next/image";
import { CaseStudyContent } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTransition } from "@/components/TransitionProvider";
import CaseStudyBackground from "@/components/CaseStudyBackground";
import CaseStudySidebar from "@/components/CaseStudySidebar";
import { motion } from "motion/react";
import { MaskReveal } from "@/components/MaskReveal";
import LockedCaseStudy from "@/components/LockedCaseStudy";
import TransitionLink from "@/components/TransitionLink";
import FeatureTabs from "@/components/FeatureTabs";
import ScrollToTop from "@/components/ScrollToTop";





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
          if (introRef.current) {
            const rect = introRef.current.getBoundingClientRect();
            const shouldShowSidebar = rect.bottom < 200;

            // Synchronize Back button and section links to appear together
            setHeaderProps(prev => {
              if (prev.scrolled === shouldShowSidebar) return prev;
              return { ...prev, scrolled: shouldShowSidebar };
            });

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
      <ScrollToTop visible={showSidebar} />

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

              {section.videoSrc && (
                <div className="w-full mt-8">
                  <div className="relative overflow-hidden rounded-lg bg-muted aspect-video">
                    <video
                      src={section.videoSrc}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {section.featureTabs && (
                <FeatureTabs tabs={section.featureTabs} />
              )}


              {/* Trigger for sidebar at the bottom of the first section */}
              {index === 0 && <div ref={missionEndRef} className="h-px w-full" />}
            </section>
          ))}
        </div>

        {/* Next Project Footer - Exact Reference Design */}
        {caseStudy.nextProject && (
          <footer className="mt-24 pb-32 relative z-10 max-w-2xl mx-auto px-4 sm:px-0 flex flex-col items-end">
            {/* Divider */}
            <div className="h-px w-full bg-neutral-200 dark:bg-white/10 mb-16" />

            <TransitionLink 
              href={caseStudy.nextProject.href}
              label={caseStudy.nextProject.label}
              className="group inline-block"
            >
              <div 
                className="flex items-center gap-6 text-left"
              >
                {/* Left: Thumbnail Preview */}
                {caseStudy.nextProject.thumbnail && (
                  <div className="w-32 sm:w-40 aspect-[1.5] relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/30 dark:border-white/5 shrink-0">
                    <Image
                      src={caseStudy.nextProject.thumbnail}
                      alt={caseStudy.nextProject.label}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                      sizes="(max-width: 640px) 128px, 160px"
                    />
                    <div className="absolute inset-0 bg-black/[0.02] dark:bg-black/10 pointer-events-none" />
                  </div>
                )}

                {/* Right: Text Details */}
                <div className="flex flex-col gap-1 justify-center">
                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                    {caseStudy.nextProject.label}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    <span>Read Case Study</span>
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="transform group-hover:translate-x-1 transition-transform duration-300"
                    >
                      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
              </div>
            </TransitionLink>
          </footer>
        )}
      </div>
    </motion.main>
  );
}
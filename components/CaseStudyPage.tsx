"use client";

import Image from "next/image";
import { useTransition } from "@/components/TransitionProvider";
import TransitionLink from "@/components/TransitionLink";
import CaseStudySidebar from "@/components/CaseStudySidebar";
import MobileCaseStudyNav from "@/components/MobileCaseStudyNav";
import { CaseStudyContent } from "@/content/case-studies/types";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button, Form, InputOTP, Label, Spinner, REGEXP_ONLY_DIGITS_AND_CHARS } from "@heroui/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface CaseStudyPageProps {
  caseStudy: CaseStudyContent;
}

export default function CaseStudyPage({ caseStudy }: CaseStudyPageProps) {
  const { setHeaderProps } = useTransition();
  const accessCode = "gcb2024";
  const codeLength = accessCode.length;
  const firstGroupLength = 3;
  const [codeValue, setCodeValue] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContentActive, setIsContentActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check session storage to see if they've already unlocked it this session
    const authorized = sessionStorage.getItem(`authorized-${caseStudy.slug}`);
    if (authorized === "true") {
      setIsAuthorized(true);
    }
  }, [caseStudy.slug]);

  // Update persistent header when locked state or scroll state changes
  useEffect(() => {
    const baseProps = {
      isCaseStudy: true,
      scrolled: isContentActive,
      backLink: "/"
    };

    if (caseStudy.isLocked && !isAuthorized) {
      setHeaderProps({ 
        ...baseProps,
        variant: "case-study", 
        title: "Protected Content", 
      });
    } else {
      setHeaderProps({ 
        ...baseProps,
        variant: "default",
      });
    }
  }, [caseStudy.isLocked, isAuthorized, isContentActive, setHeaderProps]);

  // Apply a fixed CSS mask to the smooth-wrapper for the top/bottom fade effect
  useEffect(() => {
    const wrapper = document.getElementById("smooth-wrapper");
    if (wrapper) {
      wrapper.style.setProperty(
        "--page-mask",
        "linear-gradient(to bottom, transparent, black 80px)"
      );
    }
    return () => {
      if (wrapper) {
        wrapper.style.removeProperty("--page-mask");
      }
    };
  }, []);

    // Unified Entrance Orchestration (Awwwards Style)
  useGSAP(() => {
    if (!isAuthorized && caseStudy.isLocked) return;
    if (!mounted || !bgRef.current) return;

    const tl = gsap.timeline();

    tl.fromTo(bgRef.current, { 
      opacity: 0,
    }, {
      opacity: 1,
      duration: 1.4,
      delay: 0.4,
      ease: "sine.inOut",
      clearProps: "transform,willChange"
    });

    // 2. Kinetic Title & Content Reveal
    tl.to(".reveal-item", {
      y: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.04,
      ease: "power4.out"
    }, "-=1.1");

    // 3. Metadata Stagger
    tl.to(".meta-item", {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.03,
      ease: "power4.out"
    }, "-=0.6");

    // 4. Hero Entrance
    tl.to(".hero-container", {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: "power4.out"
    }, "-=0.7");

    // 5. Scroll-driven Background Fade
    ScrollTrigger.create({
      trigger: triggerRef.current,
      start: "top center",
      onEnter: () => {
        setIsContentActive(true);
        gsap.to(bgRef.current, { opacity: 0, duration: 0.8, ease: "power2.out" });
      },
      onLeaveBack: () => {
        setIsContentActive(false);
        gsap.to(bgRef.current, { opacity: 1, duration: 0.8, ease: "power2.out" });
      },
    });

    // 6. Hero Parallax
    gsap.to(".hero-parallax", {
      y: "15%",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-container",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

  }, { dependencies: [isAuthorized, caseStudy.isLocked, caseStudy.slug, mounted], scope: pageRef });

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeComplete || isSubmitting) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 450));

    if (codeValue.toLowerCase() === accessCode) {
      setIsAuthorized(true);
      setShowError(false);
      sessionStorage.setItem(`authorized-${caseStudy.slug}`, "true");
    } else {
      setShowError(true);
      setCodeValue("");
    }
    setIsSubmitting(false);
  };

  const sidebarLinks = caseStudy.sections.reduce((acc, curr) => {
    const existing = acc.find((item) => item.label === curr.label);

    if (existing) {
      existing.targetIds.push(curr.id);
    } else {
      acc.push({ id: curr.id, label: curr.label, targetIds: [curr.id] });
    }

    return acc;
  }, [] as { id: string; label: string; targetIds: string[] }[]);

  sidebarLinks.unshift({ id: "intro", label: "Intro", targetIds: ["intro"] });

  const isCodeComplete = Array.from({ length: codeLength }).every((_, index) =>
    /[a-z0-9]/i.test(codeValue[index] ?? "")
  );



  if (caseStudy.isLocked && !isAuthorized) {
    return (
      <div className="min-h-screen bg-background w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl relative z-10 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-card/40 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.55)]">
            <Lock className="text-foreground/80" size={28} />
          </div>
          
          <h1 className="max-w-4xl text-hero font-normal tracking-tight text-foreground mb-4 leading-[1.08]">
            Like a carefully tended garden, some of my work needs to stay protected.
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-12 leading-relaxed max-w-xl">
            Enter the access code for <strong>{caseStudy.title}</strong> to continue.
          </p>

          <Form onSubmit={handleUnlock} className="w-full flex flex-col items-center gap-0">
            <Label className="sr-only">Access code</Label>
            <InputOTP
              maxLength={codeLength}
              value={codeValue}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              isInvalid={showError}
              autoFocus
              onComplete={() => {
                if (showError) setShowError(false);
              }}
              onChange={(value) => {
                setCodeValue(value.toLowerCase());
                if (showError) setShowError(false);
              }}
              className="mb-8"
              inputClassName="text-foreground"
            >
              <InputOTP.Group className="gap-3 md:gap-4">
                {Array.from({ length: firstGroupLength }).map((_, index) => (
                  <InputOTP.Slot
                    key={index}
                    index={index}
                    className="h-16 w-14 md:h-18 md:w-16 rounded-2xl border border-border/60 bg-card/20 backdrop-blur-xl text-center text-2xl md:text-[28px] font-normal text-foreground uppercase shadow-[0_18px_40px_-30px_rgba(0,0,0,0.55)] transition-all data-[active=true]:border-foreground/50 data-[has-value=true]:border-foreground/30 data-[invalid=true]:border-destructive/80"
                  />
                ))}
              </InputOTP.Group>
              <InputOTP.Separator className="mx-2 h-px w-6 bg-border/70" />
              <InputOTP.Group className="gap-3 md:gap-4">
                {Array.from({ length: codeLength - firstGroupLength }).map((_, index) => (
                  <InputOTP.Slot
                    key={firstGroupLength + index}
                    index={firstGroupLength + index}
                    className="h-16 w-14 md:h-18 md:w-16 rounded-2xl border border-border/60 bg-card/20 backdrop-blur-xl text-center text-2xl md:text-[28px] font-normal text-foreground uppercase shadow-[0_18px_40px_-30px_rgba(0,0,0,0.55)] transition-all data-[active=true]:border-foreground/50 data-[has-value=true]:border-foreground/30 data-[invalid=true]:border-destructive/80"
                  />
                ))}
              </InputOTP.Group>
            </InputOTP>

            <Button
              type="submit"
              isDisabled={!isCodeComplete || isSubmitting}
              className="inline-flex min-w-36 rounded-full px-5 py-3 text-xs tracking-[0.22em] uppercase font-medium"
              variant="ghost"
            >
              {isSubmitting ? (
                <>
                  <Spinner color="current" size="sm" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <ArrowRight size={14} />
                </>
              )}
            </Button>

            <AnimatePresence>
              {showError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-destructive text-xs font-medium mt-5 overflow-hidden"
                >
                  <ShieldAlert size={12} />
                  Invalid access code
                </motion.div>
              )}
            </AnimatePresence>
          </Form>

          <div className="mt-12 pt-6 border-t border-border/5 w-full max-w-md">
              <TransitionLink href="/" label="Go back to Home" className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-widest font-medium">
                Back to home
              </TransitionLink>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="min-h-screen w-full relative">

      <CaseStudySidebar links={sidebarLinks} visible={isContentActive} />
      <MobileCaseStudyNav links={sidebarLinks} visible={isContentActive} />

      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none z-[60]" />
      
       {!mounted ? (
         <div 
           className="fixed inset-0 pointer-events-none z-[-1] fixed-preview-portal"
           style={{
             background: `linear-gradient(180deg in oklch, 
               #360000 0%, 
               oklch(22% 0.15 25) 15%, 
               oklch(30% 0.20 25) 30%, 
               oklch(38% 0.25 25) 45%, 
               oklch(46% 0.28 25) 60%, 
               oklch(54% 0.31 25) 75%, 
               oklch(60% 0.33 25) 90%, 
               oklch(65% 0.35 25) 100%
             )`,
             opacity: 0,
           }}
         />
       ) : createPortal(
         <div 
           className="fixed inset-0 pointer-events-none z-[-1] fixed-preview-portal overflow-hidden"
           style={{ transform: "translateZ(0)" }}
         >
           {/* High-Fidelity Eased Gradient */}
           <div 
             ref={bgRef}
             className="absolute inset-0"
             style={{
               background: `linear-gradient(180deg in oklch, 
                 #360000 0%, 
                 oklch(22% 0.15 25) 15%, 
                 oklch(30% 0.20 25) 30%, 
                 oklch(38% 0.25 25) 45%, 
                 oklch(46% 0.28 25) 60%, 
                 oklch(54% 0.31 25) 75%, 
                 oklch(60% 0.33 25) 90%, 
                 oklch(65% 0.35 25) 100%
               )`,
               opacity: 0
             }}
           />
         </div>,
         document.body
       )}

      <div
        className="flex flex-col items-center pt-48 md:pt-80 px-[var(--page-px)] pb-40 relative w-full"
      >
        <main className="w-full flex flex-col items-center relative z-10">
            <header id="intro" className="w-full max-w-[1400px] pb-32 pt-16 flex flex-col md:flex-row md:justify-between md:items-end gap-10 mx-auto">
              <div className="max-w-[480px]">
                <div className="flex flex-wrap gap-x-[0.25em] mb-4">
                  {caseStudy.title.split(" ").map((word, i) => (
                    <div key={i} className="overflow-hidden">
                      <h1 
                        className="reveal-item text-hero font-normal leading-[1.1] tracking-tight text-white opacity-0 translate-y-[110%]"
                      >
                        {word}
                      </h1>
                    </div>
                  ))}
                </div>
                
                <div className="overflow-hidden">
                  <p className="reveal-item text-white/60 text-lg md:text-[20px] leading-relaxed max-w-lg opacity-0 translate-y-[110%]">
                    {caseStudy.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-12 gap-y-6 md:pb-2">
                {caseStudy.meta.map(({ label, value }) => (
                  <div key={label} className="overflow-hidden">
                    <div className="meta-item flex flex-col gap-1.5 opacity-0 translate-y-[100%]">
                      <p className="text-[11px] font-semibold text-white/40 tracking-wider uppercase">{label}</p>
                      <p className="text-white/60 text-[14px]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </header>

            <div className="hero-container w-full max-w-[1400px] mb-32 mx-auto opacity-0 translate-y-[30px]">
              <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-video w-full bg-muted/20">
                <div className="hero-parallax absolute inset-0 -top-[20%] -bottom-[20%] w-full h-[140%]">
                  <Image src={caseStudy.heroSrc} alt={caseStudy.heroAlt} fill className="object-cover" priority />
                </div>
              </div>
            </div>

            {/* Scroll Trigger for Background Fade */}
            <div ref={triggerRef} className="h-px w-full pointer-events-none mb-32" />

            <div className="w-full max-w-[600px] mx-auto">
              <div className="flex flex-col gap-32 pb-32">
                {caseStudy.sections.map((section) => (
                  <section key={section.id} id={section.id} className="flex flex-col items-start w-full">
                    <h2 className="text-lg md:text-xl font-normal text-foreground leading-snug mb-6 tracking-tight">
                      {section.heading}
                    </h2>

                    <div className="flex flex-col gap-5 w-full">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="text-muted-foreground text-[15px] md:text-base leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.bullets && (
                      <ul className="mt-6 flex flex-col gap-3 pl-5 w-full">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="text-muted-foreground text-[15px] md:text-base leading-relaxed list-disc marker:text-muted-foreground/40"
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.imageSrc && (
                      <div className="mt-12 w-full relative rounded-2xl overflow-hidden bg-muted/20 aspect-[4/3]">
                        <Image src={section.imageSrc} alt={section.heading} fill className="object-cover" />
                      </div>
                    )}
                  </section>
                ))}
              </div>

              <div className="border-t border-border py-14">
                <p className="text-[11px] text-muted-foreground/80 tracking-widest font-medium mb-5">
                  Next
                </p>
                <TransitionLink
                  href={caseStudy.nextProject.href}
                  label={caseStudy.nextProject.label}
                  className="group inline-block"
                >
                  {caseStudy.nextProject.eyebrow && (
                    <p className="text-muted-foreground text-sm mb-1">{caseStudy.nextProject.eyebrow}</p>
                  )}
                  <h3 className="text-xl font-normal text-foreground group-hover:text-muted-foreground transition-colors">
                    {caseStudy.nextProject.title}
                  </h3>
                </TransitionLink>
              </div>
            </div>
        </main>
      </div>
    </div>
  );
}

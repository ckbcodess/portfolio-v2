"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Button } from "@/components/ui/button";
import { refractive, convex } from "@hashintel/refractive";

interface SectionLink {
  id: string;
  label: string;
  targetIds?: string[];
}

export default function MobileCaseStudyNav({ links, visible }: { links: SectionLink[], visible?: boolean }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const visibleSections = useRef(new Map<string, number>());
  const navRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      if (visible !== undefined) {
        setIsVisible(prev => prev === visible ? prev : visible);
        if (!visible) setIsOpen(false);
      } else {
        const scrolledPastThreshold = window.scrollY > 80;
        setIsVisible(prev => prev === scrolledPastThreshold ? prev : scrolledPastThreshold);
        if (!scrolledPastThreshold) setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.current.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.current.delete(entry.target.id);
          }
        });

        if (visibleSections.current.size > 0) {
          let maxRatio = -1;
          let maxId = "";

          visibleSections.current.forEach((ratio, id) => {
            if (ratio > maxRatio) {
              maxRatio = ratio;
              maxId = id;
            }
          });

          if (maxId) {
            setActiveId(maxId);
          }
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    links.forEach((link) => {
      const idsToObserve = link.targetIds || [link.id];
      idsToObserve.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      });
    });

    return () => observer.disconnect();
  }, [links]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    const yOffset = 120;
    const top = target.getBoundingClientRect().top + window.scrollY - yOffset;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
    setIsOpen(false);
  };

  const activeLink = links.find((link) => (link.targetIds || [link.id]).includes(activeId)) || links[0];
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  
  const { scrollYProgress } = useScroll();
  const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [circumference, 0]);

  // Replaced "squishy" loose spring with a premium, crisp, critically-damped spring
  const shellTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { type: "spring", stiffness: 400, damping: 40, mass: 0.8 };

  if (!mounted) return null;

  return createPortal(
    <div
      ref={navRef}
      className={`fixed left-1/2 z-[80] flex -translate-x-1/2 items-end md:hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-12 opacity-0"
      }`}
      style={{ bottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="nav-button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-label="Open navigation menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsOpen(true)}
            className="relative overflow-hidden group min-w-[140px] min-h-[52px] flex items-center rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto"
            style={{
              paddingLeft: "16px",
              paddingRight: "24px",
              paddingTop: "14px",
              paddingBottom: "14px"
            }}
          >
            {/* Simple CSS Glass */}
            <div className="absolute inset-0 backdrop-blur-[24px] backdrop-saturate-[1.5] bg-background/80 rounded-[inherit] border border-foreground/10 pointer-events-none" />

            <div className="relative z-50 flex items-center justify-center w-full h-full">
              {/* Circle Indicator (Visually 16px) */}
              <div className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center text-foreground">
                <svg className="-rotate-90 h-full w-full" viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="18" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="opacity-20" />
                  <motion.circle cx="18" cy="18" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={circumference} style={{ strokeDashoffset }} className="opacity-90" strokeLinecap="round" />
                </svg>
              </div>

              {/* Content Div (24px space from indicator) */}
              <div className="ml-[24px] flex items-center gap-[8px]">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={activeLink?.label}
                    initial={{ opacity: 0, y: 5, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -5, filter: "blur(4px)" }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="text-[1.1rem] font-medium tracking-tight text-foreground/90 truncate max-w-[50vw]"
                  >
                    {activeLink?.label}
                  </motion.span>
                </AnimatePresence>

                <motion.svg className="text-foreground/80" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </motion.svg>
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden w-[320px] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] pointer-events-auto flex flex-col"
          >
            {/* Simple CSS Glass */}
            <div className="absolute inset-0 backdrop-blur-[24px] backdrop-saturate-[1.5] bg-background/80 rounded-[inherit] border border-foreground/10 pointer-events-none" />
            
            <div className="relative z-50 flex flex-col w-full p-2">
              <div className="flex items-center justify-between px-4 py-3 mb-2 border-b border-foreground/10">
                <span className="text-[0.95rem] font-medium text-foreground/50">Navigation</span>
                <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="text-foreground/50 hover:text-foreground p-2 -mr-2 rounded-full hover:bg-foreground/10 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex max-h-[45vh] flex-col gap-1 overflow-y-auto no-scrollbar pb-2">
                {links.map((link) => {
                  const isActive = (link.targetIds || [link.id]).includes(activeId);
                  return (
                    <Button
                      key={link.id}
                      variant="ghost"
                      type="button"
                      onClick={() => scrollToSection(link.id)}
                      className={`w-full justify-start rounded-2xl px-4 py-6 text-left text-[1rem] transition-all font-medium h-auto whitespace-normal break-words ${
                        isActive
                          ? "bg-foreground/10 text-foreground"
                          : "text-foreground/40 hover:text-foreground hover:bg-foreground/5"
                      }`}
                    >
                      {link.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}

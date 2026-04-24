"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

interface SectionLink {
  id: string;
  label: string;
  targetIds?: string[];
}

export default function MobileCaseStudyNav({ links }: { links: SectionLink[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const visibleSections = useRef(new Map<string, number>());
  const navRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsOpen(false);
      }

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll);
    const timeout = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

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
    if (!target) {
      return;
    }

    const yOffset = 120;
    const top = target.getBoundingClientRect().top + window.scrollY - yOffset;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
    setIsOpen(false);
  };

  const activeLink = links.find((link) => (link.targetIds || [link.id]).includes(activeId)) || links[0];
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;
  const shellTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const };
  const menuTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : { duration: 0.34, ease: [0.25, 1, 0.5, 1] as const };

  if (!mounted) return null;

  return createPortal(
    <div
      ref={navRef}
      className={`fixed bottom-8 left-1/2 z-[80] flex -translate-x-1/2 items-end md:hidden transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] fixed-preview-portal ${
        isVisible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-12 opacity-0"
      }`}
    >
      <motion.div
        layout
        animate={{ width: isOpen ? 300 : 235, borderRadius: isOpen ? 32 : 9999 }}
        transition={shellTransition}
        className="relative overflow-hidden border border-foreground/10 bg-background/60 shadow-[0_24px_56px_rgb(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150"
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-[1rem] font-medium leading-tight text-muted-foreground">{activeLink?.label}</span>
            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={shellTransition}
              className="shrink-0 text-muted-foreground"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 15 12 9 18 15"></polyline>
            </motion.svg>
          </div>

          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
            <svg className="-rotate-90 h-full w-full" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                className="text-foreground/20"
              />
              <circle
                cx="18"
                cy="18"
                r={radius}
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-foreground/85 transition-all duration-200 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute h-5 w-5 rounded-full border border-foreground/10 bg-background/55 backdrop-blur-md" />
          </div>
        </button>

        <motion.div
          initial={false}
          animate={
            shouldReduceMotion
              ? { height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }
              : { height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -8 }
          }
          transition={menuTransition}
          className="overflow-hidden"
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
          <div className="mx-3 mb-3 mt-1 h-px bg-border/40" />
          <div className="flex max-h-[48vh] flex-col gap-1 overflow-y-auto px-2 pb-3 no-scrollbar">
            {links.map((link) => {
              const isActive = (link.targetIds || [link.id]).includes(activeId);
              return (
                <Button
                  key={link.id}
                  variant="ghost"
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`w-full justify-start rounded-xl px-3 py-5 text-left text-[0.92rem] transition-colors font-normal hover:bg-foreground/8 ${
                    isActive
                      ? "bg-foreground/10 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {link.label}
                </Button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>,
    document.body
  );
}

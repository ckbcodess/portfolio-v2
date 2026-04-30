"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "motion/react";

interface SectionLink {
  id: string;
  label: string;
  targetIds?: string[];
}

export default function CaseStudySidebar({ links, visible }: { links: SectionLink[], visible?: boolean }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const visibleSections = useRef(new Map<string, number>());

  // Visibility: controlled externally via prop, or scroll-based fallback
  useEffect(() => {
    setMounted(true);

    if (visible !== undefined) {
      setIsVisible(visible);
      return;
    }

    const handleScroll = () => {
      setIsVisible(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
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

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    const yOffset = 120;
    const top = target.getBoundingClientRect().top + window.scrollY - yOffset;
    window.scrollTo({ top, behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  if (!mounted) return null;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        staggerDirection: 1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
        when: "afterChildren",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      x: -24, 
      filter: "blur(4px)" 
    },
    visible: { 
      opacity: 1, 
      x: 0, 
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 240,
        damping: 22,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0, 
      x: -24, 
      filter: "blur(4px)",
      transition: {
        duration: 0.2
      }
    },
  };

  return createPortal(
    <aside
      className={`fixed left-[var(--page-px)] top-[120px] z-[60] hidden w-48 shrink-0 flex-col gap-10 md:flex fixed-preview-portal`}
    >
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.nav
            key="sidebar-nav"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-[12px]"
          >
            {links.map((link) => {
              const idsToCheck = link.targetIds || [link.id];
              const isActive = idsToCheck.includes(activeId);

              return (
                <motion.a
                  key={link.id}
                  href={`#${link.id}`}
                  variants={itemVariants}
                  whileHover={{ x: 4, transition: { type: "spring" as const, stiffness: 400, damping: 20 } }}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToSection(link.id);
                  }}
                  className={`text-[14px] font-normal transition-colors duration-200 block ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </motion.a>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </aside>,
    document.body
  );
}


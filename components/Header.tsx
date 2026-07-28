"use client";

import TransitionLink from "./TransitionLink";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTransition } from "./TransitionProvider";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { animate } from "animejs";
import { scrambleText } from "animejs/text";
import dynamic from "next/dynamic";
const RefractiveNav = dynamic(() => import("./RefractiveNav"), { 
  ssr: false,
  loading: () => <div className="h-12 w-[300px] rounded-full" />
});
import Clock from "./Clock";
import ThemeControls from "./ThemeControls";
import { useSound } from "@/components/SoundProvider";
import { Volume2, VolumeX } from "lucide-react";

interface HeaderProps {
  backLink?: string;
  scrolled?: boolean;
}

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "Archive" },
  { href: "/resume", label: "Resume" },
  { href: "/about", label: "Info" },
];



export default function Header({ backLink = "/", scrolled: scrolledProp }: HeaderProps) {
  const pathname = usePathname();
  const { isSoundEnabled, toggleSound } = useSound();
  const { pendingHref, isTransitioning, isArchiveOpen, setArchiveOpen, setInfoOpen, isInfoOpen, isLightboxOpen, canAnimate, isControlsHidden } = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);

  const isCaseStudy = pathname.startsWith("/work/");
  const scrolled = scrolledProp ?? internalScrolled;

  // ─── Two-nav system ───────────────────────────────────────────────────
  const showBack = isCaseStudy && scrolled;

  // Track mode changes to coordinate hide/reveal with spring
  const navMode = showBack ? "back" : "nav";
  const prevModeRef = useRef(navMode);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hide during page transitions
  useEffect(() => {
    if (isTransitioning) {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      setIsNavHidden(true);
    }
  }, [isTransitioning]);

  // Hide during nav mode swaps (scroll-based, both directions)
  useEffect(() => {
    if (navMode !== prevModeRef.current) {
      prevModeRef.current = navMode;
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
      setIsNavHidden(true);
    }
  }, [navMode]);

  // Reveal after layout settles (skip if still mid-transition)
  useEffect(() => {
    if (!isNavHidden || isTransitioning) return;
    revealTimerRef.current = setTimeout(() => setIsNavHidden(false), 120);
    return () => { if (revealTimerRef.current) clearTimeout(revealTimerRef.current); };
  }, [isNavHidden, isTransitioning]);



  const topBlurRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);
  const pastHeroRef = useRef(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!isTransitioning) {
            const scrollY = window.scrollY;
            const progress = Math.min(1, Math.max(0, scrollY / 140));

            const newScrolled = scrollY > 50;
            if (newScrolled !== scrolledRef.current) {
              scrolledRef.current = newScrolled;
              setInternalScrolled(newScrolled);
            }

            const newPastHero = scrollY > 650;
            if (newPastHero !== pastHeroRef.current) {
              pastHeroRef.current = newPastHero;
              setIsPastHero(newPastHero);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTransitioning, isCaseStudy, isLightboxOpen]);

  const activeHref = pendingHref || pathname;
  const logoRef = useRef<HTMLSpanElement>(null);

  const handleLogoEnter = () => {
    if (!logoRef.current || window.matchMedia("(pointer: coarse)").matches) return;
    animate(logoRef.current, {
      innerHTML: scrambleText({
        text: "Home",
        chars: "01<>[]{}_—=+*^?#&$!/\\|;:",
        duration: 250,
        settleDuration: 50,
      })
    });
  };

  const handleLogoLeave = () => {
    if (!logoRef.current || window.matchMedia("(pointer: coarse)").matches) return;
    animate(logoRef.current, {
      innerHTML: scrambleText({
        text: "RG",
        chars: "01<>[]{}_—=+*^?#&$!/\\|;:",
        duration: 250,
        settleDuration: 50,
      })
    });
  };

  // Shared spring config for both navs
  const navSpring = { type: "spring" as const, stiffness: 400, damping: 20, mass: 0.8 };
  const navHideStyle = { duration: 0 };

  // Whether each nav should be visible right now
  const showDefaultNav = !showBack && !isInfoOpen && !isArchiveOpen;
  const showBackNav = showBack && !isInfoOpen && !isArchiveOpen;

  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);

  useEffect(() => {
    if (canAnimate && !hasInitialLoaded) {
      setHasInitialLoaded(true);
    }
  }, [canAnimate, hasInitialLoaded]);

  // Header spring entrance configuration (initial load only)
  const headerSpring = { type: "spring" as const, stiffness: 260, damping: 22, mass: 0.8 };

  return (
    <>
      <motion.header
        initial={hasInitialLoaded ? false : { opacity: 0, scale: 0.92, y: 0 }}
        animate={
          isInfoOpen || isArchiveOpen || isLightboxOpen || isControlsHidden
            ? { opacity: 0, scale: 0.96, y: 0, pointerEvents: "none" }
            : !canAnimate && !hasInitialLoaded
            ? { opacity: 0, scale: 0.92, y: 0 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        transition={hasInitialLoaded ? { duration: 0.2, ease: "easeOut" } : headerSpring}
        className="fixed top-4 sm:top-6 inset-x-0 z-[1000] pointer-events-none flex justify-center px-[var(--page-px)]"
      >
      <div className="w-full flex items-center justify-center relative max-w-[1400px] mx-auto">
        {/* ─── Navigation: Centered single pill ─── */}
        <div className={`flex items-center justify-center relative max-w-[620px] mx-auto w-full ${isInfoOpen ? "pointer-events-none hidden" : "pointer-events-auto"}`}>
          {/* Default Navigation */}
          <motion.div
            animate={{
              opacity: showDefaultNav ? 1 : 0,
              scale: showDefaultNav ? 1 : 0.92,
            }}
            style={{
              visibility: showDefaultNav ? "visible" : "hidden",
              position: showBack ? "absolute" : "relative",
              width: "100%",
            }}
            transition={showDefaultNav ? navSpring : navHideStyle}
            className="w-full flex justify-center animate-fade-in"
          >
            <RefractiveNav
              isCaseStudyHero={isCaseStudy}
              className="relative rounded-[14px] overflow-hidden w-full text-white"
            >
              <div className="px-3 py-2 sm:px-6 sm:py-3 flex items-center justify-between gap-2 sm:gap-6 md:gap-8 whitespace-nowrap w-full">
                {/* Left group: Home, Archive, Resume, Info */}
                <div className="flex items-center gap-2 sm:gap-3.5 md:gap-5">
                  {NAV_ITEMS.map((item) => {
                    const isActive = activeHref === item.href || (item.href === "/" && activeHref === "/");
                    const isInfo = item.label === "Info";
                    return (
                      <TransitionLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        data-cursor="pointer"
                        onClick={(e) => {
                          if (isInfo) {
                            e.preventDefault();
                            setInfoOpen(true);
                          }
                        }}
                        className={`text-xs sm:text-sm font-normal tracking-tight transition-all duration-300 ${
                          isActive ? "opacity-100 font-medium text-white" : "opacity-70 text-white hover:opacity-100"
                        }`}
                      >
                        {item.label}
                      </TransitionLink>
                    );
                  })}
                </div>

                {/* Right group: Theme, Volume, Clock */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  {/* Theme controls */}
                  <ThemeControls isHero={true} />

                  {/* Volume Toggle */}
                  <button
                    onClick={toggleSound}
                    data-cursor="pointer"
                    className="transition-all duration-300 p-1 -m-1 flex items-center justify-center cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-sm text-white/70 hover:text-white"
                    aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
                  >
                    {isSoundEnabled ? <Volume2 size={13} strokeWidth={2} /> : <VolumeX size={13} strokeWidth={2} />}
                  </button>

                  {/* Clock */}
                  <div className="hidden sm:block text-[10px] sm:text-xs font-normal tabular-nums select-none text-white/80">
                    <Clock />
                  </div>
                </div>
              </div>
            </RefractiveNav>
          </motion.div>

          {/* Back Button Navigation */}
          <motion.div
            animate={{
              opacity: showBackNav ? 1 : 0,
              scale: showBackNav ? 1 : 0.92,
            }}
            style={{
              visibility: showBackNav ? "visible" : "hidden",
              position: !showBack ? "absolute" : "relative",
            }}
            transition={showBackNav ? navSpring : navHideStyle}
          >
            <RefractiveNav
              isScrolled={scrolled}
              className="relative rounded-[14px] overflow-hidden text-white"
            >
              <div className="px-4 py-2 sm:px-5 sm:py-3 flex items-center justify-center whitespace-nowrap">
                <TransitionLink
                  href={backLink}
                  label="Back"
                  data-cursor="pointer"
                  className="flex items-center gap-1.5 sm:gap-2 transition-colors group p-4 -m-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform -ml-0.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="text-xs sm:text-sm font-normal">Back</span>
                </TransitionLink>
              </div>
            </RefractiveNav>
          </motion.div>
        </div>
      </div>
    </motion.header>
    </>
  );
}

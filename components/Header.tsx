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
  { href: "/#case-studies", label: "Archive" },
  { href: "/resume", label: "Resume" },
  { href: "/about", label: "Info" },
];



export default function Header({ backLink = "/", scrolled: scrolledProp }: HeaderProps) {
  const pathname = usePathname();
  const { isSoundEnabled, toggleSound } = useSound();
  const { pendingHref, isTransitioning, setArchiveOpen, setInfoOpen } = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [internalScrolled, setInternalScrolled] = useState(false);

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



  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!isTransitioning) {
            setInternalScrolled(window.scrollY > 50);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTransitioning]);

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
  const showDefaultNav = !showBack && !isNavHidden;
  const showBackNav = showBack && !isNavHidden;

  return (
    <header className="w-full fixed top-0 left-0 z-[1000] pointer-events-none pt-6 md:pt-[48px]">
      <div className="w-full px-[var(--page-px)] flex items-center relative h-20 max-w-[1400px] mx-auto">
        {/* Left Section: Logo (Mobile only on home, or general on mobile) */}
        <div className="flex-1 flex justify-start pointer-events-auto relative z-[1000] lg:hidden">
          <TransitionLink
            href="/"
            label="Home"
            data-cursor="pointer"
            onMouseEnter={handleLogoEnter}
            onMouseLeave={handleLogoLeave}
            className={`text-sm font-normal tracking-tight transition-colors p-4 -m-4 ${
              isCaseStudy && !scrolled ? "text-white" : "text-foreground"
            }`}
          >
            <span ref={logoRef} className="inline-block min-w-[2ch]">RG</span>
          </TransitionLink>
        </div>

        {/* ─── Desktop Nav: Centered single pill ─── */}
        <div className="flex-1 hidden lg:flex items-center justify-center pointer-events-auto relative max-w-[620px] mx-auto w-full">
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
              isCaseStudyHero={isCaseStudy && !scrolled}
              className={`relative rounded-full overflow-hidden w-full ${
                isCaseStudy && !scrolled ? "text-white" : "text-foreground"
              }`}
            >
              <div className="px-6 py-3 flex items-center justify-between gap-8 whitespace-nowrap w-full">
                {/* Left group: Home, Archive, Resume */}
                <div className="flex items-center gap-6">
                  {NAV_ITEMS.slice(0, 3).map((item) => {
                    const isActive = activeHref === item.href || (item.href === "/" && activeHref === "/");
                    const isArchive = item.label === "Archive";
                    return (
                      <TransitionLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        data-cursor="pointer"
                        onClick={isArchive ? (e) => {
                          e.preventDefault();
                          setArchiveOpen(true);
                        } : undefined}
                        className={`text-sm font-normal tracking-tight transition-all duration-300 ${
                          isActive ? "opacity-100 font-semibold" : "opacity-40 hover:opacity-100"
                        }`}
                      >
                        {item.label}
                      </TransitionLink>
                    );
                  })}
                </div>

                {/* Right group: Info, Theme, Volume, Clock */}
                <div className="flex items-center gap-6">
                  {/* Info Link */}
                  {(() => {
                    const item = NAV_ITEMS[3];
                    const isActive = activeHref === item.href;
                    return (
                      <TransitionLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        data-cursor="pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          setInfoOpen(true);
                        }}
                        className={`text-sm font-normal tracking-tight transition-all duration-300 ${
                          isActive ? "opacity-100 font-semibold" : "opacity-40 hover:opacity-100"
                        }`}
                      >
                        {item.label}
                      </TransitionLink>
                    );
                  })()}



                  {/* Theme controls */}
                  <ThemeControls isHero={isCaseStudy && !scrolled} />

                  {/* Volume Toggle */}
                  <button
                    onClick={toggleSound}
                    data-cursor="pointer"
                    className={`transition-all duration-300 p-1 -m-1 flex items-center justify-center cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm ${
                      isCaseStudy && !scrolled ? "text-white opacity-100" : "text-foreground/60 hover:text-foreground"
                    }`}
                    aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
                  >
                    {isSoundEnabled ? <Volume2 size={14} strokeWidth={2} /> : <VolumeX size={14} strokeWidth={2} />}
                  </button>



                  {/* Clock */}
                  <div className={`text-xs font-normal tabular-nums select-none opacity-80 ${
                    isCaseStudy && !scrolled ? "text-white" : "text-foreground"
                  }`}>
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
              className="relative rounded-full overflow-hidden text-foreground"
            >
              <div className="px-5 py-3 flex items-center justify-center whitespace-nowrap">
                <TransitionLink
                  href={backLink}
                  label="Back"
                  data-cursor="pointer"
                  className="flex items-center gap-2 transition-colors group p-4 -m-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform -ml-0.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="text-sm font-normal">Back</span>
                </TransitionLink>
              </div>
            </RefractiveNav>
          </motion.div>
        </div>

        {/* Right Section — Mobile controls only on desktop hidden */}
        <div className="flex-1 flex justify-end relative z-[1000] lg:hidden">
          <div className="flex items-center gap-4 mr-8 pointer-events-auto">
            <ThemeControls isHero={isCaseStudy && !scrolled && !isMenuOpen} />
            <button
              onClick={toggleSound}
              className={`${
                (isCaseStudy && !scrolled && !isMenuOpen) ? "text-white" : "text-foreground/60 hover:text-foreground"
              } transition-colors p-2 -m-2 flex items-center justify-center cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm`}
              aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
            >
              {isSoundEnabled ? <Volume2 size={16} strokeWidth={2} /> : <VolumeX size={16} strokeWidth={2} />}
            </button>
          </div>

          <div className="pointer-events-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 -mr-2 transition-colors relative w-10 h-10 flex items-center justify-center ${
                (isCaseStudy && !scrolled && !isMenuOpen) ? "text-white" : "text-black dark:text-white"
              }`}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMenuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.12, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "circOut" }}
              className="lg:hidden fixed inset-0 z-[999] bg-background/80 backdrop-blur-3xl flex flex-col pt-32 px-[var(--page-px)] pointer-events-auto"
            >
              <nav className="flex flex-col gap-8 flex-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeHref === item.href;
                  return (
                    <TransitionLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      data-cursor="pointer"
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        if (item.label === "Archive") {
                          e.preventDefault();
                          setArchiveOpen(true);
                        } else if (item.label === "Info") {
                          e.preventDefault();
                          setInfoOpen(true);
                        }
                      }}
                      className={`text-4xl font-normal tracking-tight transition-opacity block ${
                        isActive ? "text-foreground" : "text-foreground/40 hover:opacity-60"
                      }`}
                    >
                      {item.label}
                    </TransitionLink>
                  );
                })}
              </nav>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

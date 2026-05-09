"use client";

import TransitionLink from "./TransitionLink";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import ThemeControls from "./ThemeControls";
import { useSound } from "@/components/SoundProvider";
import { useTransition } from "./TransitionProvider";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { animate, spring } from "animejs";
import dynamic from "next/dynamic";
const RefractiveNav = dynamic(() => import("./RefractiveNav"), { 
  ssr: false,
  loading: () => <div className="h-12 w-[300px] bg-black/5 dark:bg-black/40 rounded-full animate-pulse" />
});
import Clock from "./Clock";

interface HeaderProps {
  backLink?: string;
  scrolled?: boolean;
}

const NAV_ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/about", label: "Bio" },
  { href: "https://drive.google.com/file/d/1EJm5aBA3I95pPkgT-4PDKTlOZe7ChLH9/view?usp=sharing", label: "Resume", isExternal: true },
];

const SPRING_VALUES = [0, 0.0119, 0.0444, 0.0932, 0.1542, 0.2239, 0.2991, 0.3772, 0.4559, 0.5331, 0.6075, 0.6778, 0.743, 0.8027, 0.8563, 0.9038, 0.9451, 0.9804, 1.0099, 1.034, 1.053, 1.0675, 1.0778, 1.0845, 1.0881, 1.089, 1.0878, 1.0847, 1.0802, 1.0747, 1.0684, 1.0617, 1.0547, 1.0477, 1.0408, 1.0342, 1.028, 1.0223, 1.017, 1.0123, 1.0081, 1.0045, 1.0014, 0.9989, 0.9968, 0.9951, 0.9939, 0.993, 0.9924, 0.9921, 0.9921, 0.9922, 0.9925, 0.9929, 0.9934, 0.994, 0.9946, 0.9952, 0.9958, 0.9964, 0.997, 0.9976, 0.9981, 0.9985, 0.9989, 0.9993, 0.9996, 0.9999, 1.0001, 1.0003, 1.0004, 1.0006, 1.0006, 1.0007, 1.0007, 1.0007, 1.0007, 1.0007, 1.0006, 1.0006, 1.0005, 1.0005, 1.0004, 1.0004, 1.0003, 1.0003, 1.0002, 1.0002, 1.0001, 1.0001, 1.0001, 1, 1, 1, 1, 1, 0.9999, 0.9999, 0.9999, 0.9999, 1];

const customSpringEase = (t: number) => {
  const index = Math.min(Math.floor(t * SPRING_VALUES.length), SPRING_VALUES.length - 1);
  return SPRING_VALUES[index];
};

export default function Header({ backLink = "/", scrolled: scrolledProp }: HeaderProps) {
  const pathname = usePathname();
  const { isSoundEnabled, toggleSound } = useSound();
  const { pendingHref, isTransitioning } = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [internalScrolled, setInternalScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navInnerRef = useRef<HTMLDivElement>(null);

  const isCaseStudy = pathname.startsWith("/work/");
  const scrolled = scrolledProp ?? internalScrolled;

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

  useEffect(() => {
    if (!navRef.current || !navInnerRef.current) return;

    const currentWidth = navRef.current.offsetWidth;
    const currentHeight = navRef.current.offsetHeight;

    // Reset styles to measure the target size
    navRef.current.style.width = 'auto';
    navRef.current.style.height = 'auto';
    
    const targetWidth = navInnerRef.current.offsetWidth;
    const targetHeight = navInnerRef.current.offsetHeight;

    animate(navRef.current, {
      width: [currentWidth, targetWidth],
      height: [currentHeight, targetHeight],
      duration: 800,
      ease: customSpringEase
    });
  }, [isCaseStudy, scrolled]);

  const activeHref = pendingHref || pathname;

  return (
    <header className="w-full fixed top-0 left-0 z-50 pointer-events-none pt-[48px]">
      <div className="w-full px-[var(--page-px)] flex items-center relative h-20">
        {/* Left Section: Logo */}
        <div className="flex-1 flex justify-start pointer-events-auto">
          <TransitionLink
            href="/"
            label="Home"
            className={`text-sm font-normal tracking-tight transition-colors p-4 -m-4 ${
              isCaseStudy && !scrolled ? "text-white" : "text-foreground"
            }`}
          >
            RG
          </TransitionLink>
        </div>

        <div className="flex-none hidden lg:flex items-center justify-center pointer-events-auto">
          <RefractiveNav 
            ref={navRef}
            isScrolled={scrolled}
            isCaseStudyHero={isCaseStudy && !scrolled}
            className={`relative rounded-full will-change-[width,height] overflow-hidden ${
              isCaseStudy && !scrolled
                ? "text-white" 
                : "text-foreground"
            }`}
          >
            <div ref={navInnerRef} className="h-full">
              <AnimatePresence mode="wait" initial={false}>
                {isCaseStudy && scrolled ? (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="px-5 py-3 flex items-center justify-center whitespace-nowrap"
                  >
                    <TransitionLink
                      href={backLink}
                      label="Back"
                      className="flex items-center gap-2 transition-colors group p-4 -m-4"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform -ml-0.5">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      <span className="text-sm font-normal">Back</span>
                    </TransitionLink>
                  </motion.div>
                ) : (
                  <motion.div
                    key="nav"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="px-8 py-3 flex items-center justify-center gap-8 whitespace-nowrap"
                  >
                    {NAV_ITEMS.map((item) => {
                      const isActive = activeHref === item.href;
                      const content = (
                        <span className={`text-sm font-normal tracking-tight transition-all duration-300 ${
                          isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                        }`}>
                          {item.label}
                        </span>
                      );

                      if (item.isExternal) {
                        return (
                          <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="group">
                            {content}
                          </a>
                        );
                      }
                      return (
                        <TransitionLink key={item.href} href={item.href} label={item.label} className="group">
                          {content}
                        </TransitionLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </RefractiveNav>
        </div>

        {/* Right Section — Time, Theme, Sound (Hidden on case study scroll) */}
        <div className="flex-1 flex justify-end">
          <AnimatePresence mode="wait">
            {(!isCaseStudy || !scrolled) && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 160 }}
                className="hidden lg:flex items-center gap-6 pointer-events-auto"
              >
                <div className={`text-base font-normal tabular-nums inline-flex w-[10.5ch] justify-end ${
                  isCaseStudy && !scrolled ? "text-white" : "text-foreground"
                }`}>
                  <Clock />
                </div>
                <ThemeControls isHero={isCaseStudy && !scrolled} />
                <SoundToggle 
                  isSoundEnabled={isSoundEnabled} 
                  toggleSound={toggleSound} 
                  isCaseStudy={isCaseStudy && !scrolled}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="lg:hidden pointer-events-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
              className="lg:hidden fixed inset-0 z-[1000] bg-background/40 backdrop-blur-xl flex flex-col pt-8 px-6 pointer-events-auto"
            >
              <div className="flex justify-end items-center w-full mb-12">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 -mr-2 text-foreground/60 hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X size={28} />
                </button>
              </div>
              <nav className="flex flex-col gap-8">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeHref === item.href;
                  if (item.isExternal) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-4xl font-normal tracking-tight transition-opacity block text-foreground/40 hover:opacity-60"
                      >
                        {item.label}
                      </a>
                    );
                  }
                  return (
                    <TransitionLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      onClick={() => setIsMenuOpen(false)}
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

function SoundToggle({ 
  isSoundEnabled, 
  toggleSound,
  isCaseStudy
}: { 
  isSoundEnabled: boolean; 
  toggleSound: () => void; 
  isCaseStudy: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={toggleSound}
          className={`${
            isCaseStudy ? "text-white" : "text-foreground/60 hover:text-foreground"
          } transition-colors flex items-center justify-center cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm p-4 -m-4`}
          aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
        >
          {isSoundEnabled ? (
            <Volume2 size={16} />
          ) : (
            <VolumeX size={16} />
          )}
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {isSoundEnabled ? "Mute" : "Unmute"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

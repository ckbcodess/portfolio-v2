"use client";

import TransitionLink from "./TransitionLink";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeControls from "./ThemeControls";
import { useSound } from "@/components/SoundProvider";
import { useTransition } from "./TransitionProvider";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
  variant?: "default" | "case-study";
  title?: string;
  backLink?: string;
  isCaseStudy?: boolean;
  scrolled?: boolean;
}

const NAV_ITEMS = [
  { href: "/playground", label: "Playground" },
  { href: "/about", label: "Bio" },
  { href: "https://drive.google.com/file/d/1EJm5aBA3I95pPkgT-4PDKTlOZe7ChLH9/view?usp=sharing", label: "Resume", isExternal: true },
];

export default function Header({ variant = "default", backLink = "/", isCaseStudy = false, scrolled: scrolledProp }: HeaderProps) {
  const pathname = usePathname();
  const { isSoundEnabled, toggleSound } = useSound();
  const { pendingHref, isTransitioning } = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [internalScrolled, setInternalScrolled] = useState(false);
  const scrolled = scrolledProp ?? internalScrolled;

  useEffect(() => {
    const handleScroll = () => {
      if (isTransitioning) return;
      setInternalScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTransitioning]);

  // Reset internal scroll state on navigation to prevent jumps
  useEffect(() => {
    setInternalScrolled(false);
    setIsMenuOpen(false);
  }, [pathname]);

  const activeHref = pendingHref || pathname;

  return (
    <header className="w-full fixed top-0 left-0 z-50 mix-blend-normal pointer-events-none pt-[var(--page-px)]">
      <div className="w-full px-[var(--page-px)] flex justify-between items-center relative">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <TransitionLink
            href="/"
            label="Home"
            className={`text-sm font-normal tracking-tight transition-colors ${
              isCaseStudy && !scrolled ? "text-white/60 hover:text-white" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            RG
          </TransitionLink>
        </div>

        <motion.div 
          layout={!isTransitioning}
          transition={{
            layout: { type: "spring", damping: 25, stiffness: 200 },
          }}
          className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-foreground/5 backdrop-blur-2xl overflow-hidden pointer-events-auto"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {isCaseStudy && scrolled ? (
              <motion.div
                key="back"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.2,
                  layout: { type: "spring", damping: 25, stiffness: 200 }
                }}
                className="px-5 py-3 flex items-center justify-center whitespace-nowrap"
              >
                <TransitionLink
                  href={backLink}
                  label="Back"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span className="text-sm font-normal">Back</span>
                </TransitionLink>
              </motion.div>
            ) : (
              <motion.div
                key="nav"
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.2,
                  layout: { type: "spring", damping: 25, stiffness: 200 }
                }}
                className="px-8 py-3 flex items-center gap-8 whitespace-nowrap"
              >
                {NAV_ITEMS.map((item) => {
                  const isActive = activeHref === item.href;
                  const label = item.label;
                  const isForcedDark = isCaseStudy && !scrolled;
                  
                  const content = (
                    <span className={`text-sm font-normal tracking-tight whitespace-nowrap transition-colors ${
                      isForcedDark 
                        ? (isActive ? "text-white" : "text-white/40 group-hover:text-white") 
                        : (isActive ? "text-foreground" : "text-foreground/30 group-hover:text-foreground")
                    }`}>
                      {label}
                    </span>
                  );

                  if (item.isExternal) {
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                      >
                        {content}
                      </a>
                    );
                  }
                  return (
                    <TransitionLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      className="group"
                    >
                      {content}
                    </TransitionLink>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>


        {/* Right Section — Time, Theme, Sound (Hidden on case study scroll) */}
        <AnimatePresence>
          {(!isCaseStudy || !scrolled) && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 160 }}
              className="hidden lg:flex items-center gap-8 pointer-events-auto"
            >
              <span className={`text-base font-normal tabular-nums ${
                isCaseStudy && !scrolled ? "text-white" : "text-foreground"
              }`}>
                <Clock />
              </span>
              <div className="flex items-center gap-6">
                <ThemeControls forceLight={isCaseStudy && !scrolled} />
                <SoundToggle 
                  isSoundEnabled={isSoundEnabled} 
                  toggleSound={toggleSound} 
                  forceLight={isCaseStudy && !scrolled} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu Toggle (Always show if not transitioning) */}
        <div className="lg:hidden pointer-events-auto">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 -mr-2 text-foreground/60 hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[1000] bg-background flex flex-col pt-8 px-6 pointer-events-auto"
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
  forceLight
}: { 
  isSoundEnabled: boolean; 
  toggleSound: () => void;
  forceLight?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          onClick={toggleSound}
          className={`${
            forceLight ? "text-white/60 hover:text-white" : "text-foreground/60 hover:text-foreground"
          } transition-colors flex items-center justify-center cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm`}
          aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
        >
          {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          {isSoundEnabled ? "Mute" : "Unmute"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTimeout(() => setTime(new Date()), 0);
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <span className="inline-block min-w-[104px]" />;

  const timeString = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
  const match = timeString.match(/(.*:)(\d{2})(.*)/);

  if (!match) {
    return <span className="tabular-nums inline-block min-w-[104px] text-left">{timeString}</span>;
  }

  const [, prefix, seconds, suffix] = match;
  const suffixClean = suffix.trim();

  return (
    <span className="tabular-nums inline-flex min-w-[104px] items-center justify-start text-left">
      <span>{prefix}</span>
      <span className="relative inline-flex items-center justify-center">
        <span className="invisible">{seconds}</span>
        <span className="absolute inset-0 flex">
          {seconds.split("").map((digit, index) => (
            <span key={index} className="relative inline-flex items-center justify-center">
              <span className="invisible">{digit}</span>
              <AnimatePresence>
                <motion.span
                  key={digit}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {digit}
                </motion.span>
              </AnimatePresence>
            </span>
          ))}
        </span>
      </span>
      <span className="ml-1.5">{suffixClean}</span>
    </span>
  );
}

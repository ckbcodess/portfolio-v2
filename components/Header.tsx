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

export default function Header({ backLink = "/", scrolled: scrolledProp }: HeaderProps) {
  const pathname = usePathname();
  const { isSoundEnabled, toggleSound } = useSound();
  const { pendingHref, isTransitioning } = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [internalScrolled, setInternalScrolled] = useState(false);

  const isCaseStudy = pathname.startsWith("/work/");
  const scrolled = scrolledProp ?? internalScrolled;

  useEffect(() => {
    const handleScroll = () => {
      if (isTransitioning) return;
      setInternalScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTransitioning]);

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

        {/* Middle Section: CSS-Only Morphing Navigation Pill */}
        <div className="flex-none hidden lg:flex items-center justify-center pointer-events-auto">
          <nav className={`relative rounded-full backdrop-blur-[40px] will-change-[width,height,padding,backdrop-filter] transition-[width,height,padding,margin,background-color,border-color,backdrop-filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
            isCaseStudy && !scrolled
              ? "bg-white/10 text-white" 
              : "bg-black/5 dark:bg-black/40 text-foreground"
          }`}
          style={{ transitionDuration: '500ms, 500ms, 500ms, 500ms, 200ms, 200ms, 500ms' }} // Added backdrop-filter duration
          >
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
                    className="flex items-center gap-2 text-foreground transition-colors group p-4 -m-4"
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
          </nav>
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
                <ThemeControls />
                <SoundToggle 
                  isSoundEnabled={isSoundEnabled} 
                  toggleSound={toggleSound} 
                  isCaseStudy={isCaseStudy && !scrolled}
                />
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
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[1000] bg-background/80 backdrop-blur-xl flex flex-col pt-8 px-6 pointer-events-auto"
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

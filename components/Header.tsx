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
import FloatingNav from "./FloatingNav";

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
    <header 
      className="w-full fixed top-0 left-0 z-50 pointer-events-none pt-[var(--page-px)]"
      style={{ transform: "translateZ(0)" }}
    >
      <div className="w-full px-[var(--page-px)] flex justify-between items-center relative">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <TransitionLink
            href="/"
            label="Home"
            className={`text-sm font-normal tracking-tight transition-colors p-4 -m-4 ${
              isCaseStudy ? "text-white" : "text-foreground"
            }`}
          >
            RG
          </TransitionLink>
        </div>

        {/* Center Section: Floating Navigation (Dead Center) */}
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto hidden lg:block ${isCaseStudy && !scrolled ? "dark" : ""}`}>
          <FloatingNav />
        </div>

        {/* Right Section — Time, Theme, Sound (Hidden on case study scroll) */}
        <AnimatePresence mode="wait">
          {(!isCaseStudy || !scrolled) && (
            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 160 }}
              className="hidden lg:flex pointer-events-auto"
            >
              <div className="flex items-center gap-6">
                <div className={`text-base font-normal tabular-nums inline-flex w-[10.5ch] justify-end ${
                  isCaseStudy ? "text-white" : "text-foreground"
                }`}>
                  <Clock />
                </div>
                <ThemeControls />
                <SoundToggle 
                  isSoundEnabled={isSoundEnabled} 
                  toggleSound={toggleSound} 
                  isCaseStudy={isCaseStudy}
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
            <Volume2 size={16} stroke={isCaseStudy ? "white" : "currentColor"} />
          ) : (
            <VolumeX size={16} stroke={isCaseStudy ? "white" : "currentColor"} />
          )}
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

  if (!time) return <span className="inline-block w-[10.5ch]" />;

  const timeString = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });

  return (
    <span className="tabular-nums inline-flex w-[10.5ch] items-center justify-end text-right">
      {timeString}
    </span>
  );
}

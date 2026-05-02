"use client";

import TransitionLink from "./TransitionLink";
import RefractiveNav from "./RefractiveNav";
import { usePathname } from "next/navigation";
import { useTransition } from "./TransitionProvider";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

interface FloatingNavProps {
  isCaseStudy?: boolean;
  scrolled?: boolean;
  backLink?: string;
}

export default function FloatingNav({ isCaseStudy, scrolled, backLink = "/" }: FloatingNavProps) {
  const pathname = usePathname();
  const { pendingHref } = useTransition();

  const navItems = [
    { label: "Playground", href: "/playground", transitionLabel: "Playground" },
    { label: "Bio", href: "/about", transitionLabel: "Bio" },
    { label: "Resume", href: "https://drive.google.com/file/d/1EJm5aBA3I95pPkgT-4PDKTlOZe7ChLH9/view?usp=sharing", isExternal: true },
  ];

  const showBack = isCaseStudy && scrolled;

  return (
    <div className="pointer-events-auto">
      <RefractiveNav>
        <AnimatePresence mode="wait">
          {showBack ? (
            <motion.div
              key="back"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="flex items-center"
            >
              <TransitionLink
                href={backLink}
                label="Back"
                className="group relative px-6 py-2.5 h-full flex items-center justify-center gap-2 text-[0.9rem] font-normal rounded-full transition-all duration-300 text-foreground hover:text-muted-foreground active:scale-95 whitespace-nowrap"
              >
                <ArrowLeft size={16} className="relative z-10" />
                <span className="relative z-10">Back</span>
              </TransitionLink>
            </motion.div>
          ) : (
            <motion.div
              key="nav"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="hidden lg:flex items-center"
            >
              {navItems.map((item) => {
                const isActive = !item.isExternal && (pendingHref || pathname) === item.href;
                
                if (item.isExternal) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group relative px-3 py-2 md:px-5 md:py-2.5 h-full flex items-center justify-center text-[0.85rem] md:text-[0.9rem] font-normal rounded-full overflow-hidden transition-all duration-300",
                        "text-muted-foreground hover:text-foreground active:scale-95"
                      )}
                    >
                      <span className="relative z-10">{item.label}</span>
                    </a>
                  );
                }

                return (
                  <TransitionLink
                    key={item.href}
                    href={item.href}
                    label={item.transitionLabel || item.label}
                    className={cn(
                      "group relative px-3 py-2 md:px-5 md:py-2.5 h-full flex items-center justify-center text-[0.85rem] md:text-[0.9rem] font-normal rounded-full overflow-hidden transition-all duration-300",
                      isActive 
                        ? "text-foreground shadow-sm border border-white/10 dark:border-white/20 active:scale-95" 
                        : "text-muted-foreground hover:text-foreground active:scale-95"
                    )}
                    style={isActive ? { backgroundColor: 'var(--glass-bg)' } : undefined}
                  >
                    {isActive && (
                      <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-white/15 via-white/1 to-transparent pointer-events-none" />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </TransitionLink>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </RefractiveNav>
    </div>
  );
}

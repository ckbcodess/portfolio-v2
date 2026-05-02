"use client";

import TransitionLink from "./TransitionLink";
import dynamic from "next/dynamic";
const RefractiveNav = dynamic(() => import("./RefractiveNav"), { ssr: false });
import { usePathname } from "next/navigation";
import { useTransition } from "./TransitionProvider";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";

export default function FloatingNav() {
  const pathname = usePathname();
  const { pendingHref } = useTransition();
  const [isMorphed, setIsMorphed] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) {
      setIsMorphed(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Morph when scrolled past the 50% mark of the hero
          setIsMorphed(!entry.isIntersecting);
        });
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]); // Re-bind observer if pathname changes

  const navItems = [
    { label: "Playground", href: "/playground", transitionLabel: "Playground" },
    { label: "Bio", href: "/about", transitionLabel: "Bio" },
    { label: "Resume", href: "https://drive.google.com/file/d/1EJm5aBA3I95pPkgT-4PDKTlOZe7ChLH9/view?usp=sharing", isExternal: true },
  ];

  return (
    <div className="pointer-events-auto">
      <RefractiveNav>
        <div className="relative flex items-center overflow-hidden">
          {/* Default Nav State */}
          <div 
            className="grid transition-[grid-template-columns,opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              gridTemplateColumns: isMorphed ? "0fr" : "1fr",
              opacity: isMorphed ? 0 : 1,
              transform: isMorphed ? "translateY(-10px)" : "translateY(0px)"
            }}
          >
            <div className="overflow-hidden flex items-center gap-1">
              <div className="w-max flex items-center gap-1">
            {navItems.map((item) => {
          const isActive = !item.isExternal && (pendingHref || pathname) === item.href;
          
          if (item.isExternal) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={isMorphed ? -1 : 0}
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
              tabIndex={isMorphed ? -1 : 0}
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
              </div>
            </div>
          </div>

          {/* Back Button State */}
          <div 
            className="grid transition-[grid-template-columns,opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              gridTemplateColumns: isMorphed ? "1fr" : "0fr",
              opacity: isMorphed ? 1 : 0,
              transform: isMorphed ? "translateY(0px)" : "translateY(10px)"
            }}
          >
            <div className="overflow-hidden flex items-center justify-center">
              <div className="w-max">
            <TransitionLink
              href="/"
              label="Home"
              tabIndex={isMorphed ? 0 : -1}
              className={cn(
                "group relative px-5 py-2.5 h-full flex items-center justify-center gap-1.5 text-[0.9rem] font-medium rounded-full overflow-hidden transition-all duration-300",
                "text-foreground shadow-sm border border-white/10 dark:border-white/20 active:scale-95 bg-[var(--glass-bg)]"
              )}
            >
              <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-white/15 via-white/1 to-transparent pointer-events-none" />
              <ChevronLeft size={16} className="relative z-10 transition-transform group-hover:-translate-x-1" />
              <span className="relative z-10">Back</span>
            </TransitionLink>
              </div>
            </div>
          </div>
        </div>
      </RefractiveNav>
    </div>
  );
}

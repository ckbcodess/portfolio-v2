"use client";

import TransitionLink from "./TransitionLink";
import RefractiveNav from "./RefractiveNav";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FloatingNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", transitionLabel: "Home" },
    { label: "About", href: "/about", transitionLabel: "About" },
    { label: "Playground", href: "/playground", transitionLabel: "Playground" },
    { label: "Resume", href: "/resume", transitionLabel: "Resume" },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <RefractiveNav>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <TransitionLink
              key={item.href}
              href={item.href}
              label={item.transitionLabel}
              className={cn(
                "group relative px-3 py-2 md:px-5 md:py-2.5 h-full flex items-center justify-center text-[0.85rem] md:text-[0.9rem] font-medium rounded-full overflow-hidden transition-all duration-300",
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
      </RefractiveNav>
    </div>
  );
}

"use client";

import React, { forwardRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";

export interface RefractionSettings {
  radius?: number;
  blur?: number;
  glassThickness?: number;
  specularOpacity?: number;
  specularSaturation?: number;
  bezelWidth?: number;
  refractiveIndex?: number;
  specularAngle?: number;
}

const RefractiveNav = forwardRef<HTMLElement, {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  settings?: RefractionSettings;
  isScrolled?: boolean;
  isCaseStudyHero?: boolean;
}>(({
  children,
  className,
  style,
  settings,
  isScrolled = false,
  isCaseStudyHero = false
}, ref) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const progressRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
          const ratio = totalScroll > 0 ? Math.min(Math.max(window.scrollY / totalScroll, 0), 1) : 0;
          if (progressRef.current) {
            progressRef.current.style.transform = `scaleX(${ratio})`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <nav
      ref={ref}
      className={className}
      style={{
        ...style,
        backdropFilter: "blur(32px) saturate(1.8)",
        WebkitBackdropFilter: "blur(32px) saturate(1.8)",
        backgroundColor: isDark ? "rgba(5, 5, 8, 0.85)" : "rgba(0, 0, 0, 0.45)"
      }}
      role="navigation"
      aria-label="Main Floating Navigation"
    >
      {/* Dynamic Scroll Progress Background Indicator Fill */}
      <div
        className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-10"
        style={{ WebkitMaskImage: "-webkit-radial-gradient(white, black)" }}
      >
        <div
          ref={progressRef}
          className="w-full h-full origin-left bg-white/[0.08] dark:bg-white/[0.06] transition-transform duration-75 ease-out transform-gpu will-change-transform"
          style={{ transform: "scaleX(0)" }}
        />
      </div>


      {/* Local noise texture overlay for high-fidelity glass */}
      <div
        className="absolute inset-0 rounded-[14px] pointer-events-none mix-blend-overlay z-40 opacity-[0.04] dark:opacity-[0.08]"
        style={{ backgroundImage: 'url(/noise.svg)' }}
      />

      {/* Content Container */}
      <div className="relative z-50 flex items-center gap-1 p-1 w-full h-full">
        {children}
      </div>
    </nav>
  );
});

RefractiveNav.displayName = "RefractiveNav";

export default RefractiveNav;

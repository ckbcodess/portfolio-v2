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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(window.scrollY / totalScroll);
      } else {
        setScrollProgress(0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || isCaseStudyHero);

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
      {/* Dynamic Scroll Progress Background Indicator Fill - Reduced opacity to 8% for subtle visibility */}
      <div
        className="absolute inset-0 origin-left pointer-events-none transition-transform duration-100 ease-out bg-white/[0.08] rounded-[14px] z-10"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />


      {/* Local noise texture overlay for high-fidelity glass */}
      <div
        className={`absolute inset-0 rounded-[14px] pointer-events-none mix-blend-overlay z-40 ${isCaseStudyHero ? "opacity-[0.08]" : "opacity-[0.04] dark:opacity-[0.08]"
          }`}
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

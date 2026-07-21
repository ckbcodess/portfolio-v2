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
      style={style}
      role="navigation"
      aria-label="Main Floating Navigation"
    >
      {/* Core Glass Atmosphere Layer - High blur and darker frosty glass for maximum readability */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[14px] bg-black/60 dark:bg-black/75"
        style={{
          backdropFilter: "blur(40px) saturate(1.6)",
          WebkitBackdropFilter: "blur(40px) saturate(1.6)"
        }}
      />

      {/* Dynamic Scroll Progress Background Indicator Fill */}
      <div
        className="absolute inset-0 origin-left pointer-events-none transition-transform duration-100 ease-out bg-black/[0.04] dark:bg-white/[0.04] rounded-[14px] z-10"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      {/* Crisp Inner Rim / Specular Border */}
      <div className="absolute inset-0 rounded-[14px] border-[0.5px] border-white/10 dark:border-white/5 pointer-events-none z-30" />


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

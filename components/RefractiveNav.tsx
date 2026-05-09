"use client";

import { refractive, convex } from "@hashintel/refractive";
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || isCaseStudyHero);

  return (
    <refractive.nav
      ref={ref}
      refraction={{
        radius: settings?.radius ?? 24,
        blur: settings?.blur ?? 40, // Increased for deep glass effect
        glassThickness: settings?.glassThickness ?? 24,
        // Virtually invisible highlights for dark mode to ensure maximum integration
        specularOpacity: settings?.specularOpacity ?? (isDark ? 0.03 : 0.18),
        // @ts-expect-error - specularSaturation is supported by the engine but missing from types
        specularSaturation: settings?.specularSaturation ?? 85,
        bezelWidth: settings?.bezelWidth ?? 12,
        bezelHeightFn: convex,
        refractiveIndex: settings?.refractiveIndex ?? 2.8,
        specularAngle: settings?.specularAngle ?? 135,
      }}
      className={className}
      style={style}
      role="navigation"
      aria-label="Main Floating Navigation"
    >
      {/* Subtle Theme Tint Layer & Saturation Boost - Merged for performance */}
      <div 
        className={`absolute inset-0 backdrop-blur-[40px] backdrop-saturate-[1.8] pointer-events-none ${
          isCaseStudyHero ? "bg-black/10" : "bg-background/10 dark:bg-black/10"
        }`} 
      />

      {/* Local noise texture overlay for high-fidelity glass */}
      <div 
        className={`absolute inset-0 rounded-full pointer-events-none mix-blend-overlay z-20 ${
          isCaseStudyHero ? "opacity-[0.05]" : "opacity-[0.03] dark:opacity-[0.05]"
        }`}
        style={{ backgroundImage: 'url(/noise.svg)' }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 flex items-center gap-1 p-1 w-full h-full">
        {children}
      </div>
    </refractive.nav>
  );
});

RefractiveNav.displayName = "RefractiveNav";

export default RefractiveNav;

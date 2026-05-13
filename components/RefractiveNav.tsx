"use client";

import { refractive, convex, concave, convexCircle } from "@hashintel/refractive";
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
        blur: settings?.blur ?? 2, // Lowered to make refraction more distinct
        glassThickness: settings?.glassThickness ?? 24,
        // Refined specular for more "catch" on the edges
        specularOpacity: settings?.specularOpacity ?? (isDark ? 0.08 : 0.22),
        // @ts-expect-error - specularSaturation is supported by the engine but missing from types
        specularSaturation: settings?.specularSaturation ?? 95,
        bezelWidth: settings?.bezelWidth ?? 14,
        bezelHeightFn: convex,
        refractiveIndex: settings?.refractiveIndex ?? 3.8, // Slightly lower for cleaner "glass" bend
        specularAngle: settings?.specularAngle ?? 135,
      }}
      className={className}
      style={style}
      role="navigation"
      aria-label="Main Floating Navigation"
    >
      {/* Core Glass Atmosphere Layer - Reduced blur to let refraction show */}
      <div
        className={`absolute inset-0 backdrop-blur-[12px] backdrop-saturate-[1.4] pointer-events-none ${isCaseStudyHero ? "bg-black/5" : "bg-[#f9f9f9]/80 dark:bg-[#0f1014]/80"
          }`}
      />

      {/* Crisp Inner Rim / Specular Border */}
      <div className="absolute inset-0 rounded-full border-[0.5px] border-white/10 dark:border-white/5 pointer-events-none z-30" />


      {/* Local noise texture overlay for high-fidelity glass */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none mix-blend-overlay z-40 ${isCaseStudyHero ? "opacity-[0.08]" : "opacity-[0.04] dark:opacity-[0.08]"
          }`}
        style={{ backgroundImage: 'url(/noise.svg)' }}
      />

      {/* Content Container */}
      <div className="relative z-50 flex items-center gap-1 p-1 w-full h-full">
        {children}
      </div>
    </refractive.nav>
  );
});

RefractiveNav.displayName = "RefractiveNav";

export default RefractiveNav;

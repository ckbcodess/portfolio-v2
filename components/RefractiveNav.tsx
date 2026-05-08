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
}>(({ 
  children, 
  className,
  style,
  settings,
  isScrolled = false
}, ref) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <refractive.nav
      ref={ref}
      refraction={{
        radius: settings?.radius ?? 24,
        blur: settings?.blur ?? 2.5,
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
      className={`shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.1)] ${className}`}
      style={style}
      role="navigation"
      aria-label="Main Floating Navigation"
    >
      {/* Dynamic saturation and vibrance boost */}
      <div className="absolute inset-0 backdrop-saturate-[1.8] pointer-events-none" />

      {/* Subtle Theme Tint Layer - Only visible when scrolled */}
      <div 
        className={`absolute inset-0 bg-background/40 dark:bg-black/20 backdrop-blur-md pointer-events-none transition-opacity duration-700 ${
          isScrolled ? "opacity-100" : "opacity-0"
        }`} 
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

"use client";

import { refractive, convex } from "@hashintel/refractive";

export default function RefractiveNav({ children }: { children: React.ReactNode }) {
  return (
    <refractive.nav
      refraction={{
        radius: 28,
        blur: 3,
        glassThickness: 32,
        specularOpacity: 0.5,
        // @ts-expect-error - specularSaturation is supported by the engine but missing from types
        specularSaturation: 20,
        bezelWidth: 50,
        bezelHeightFn: convex,
        refractiveIndex: 2.2,
        specularAngle: 45,
      }}
      className="relative flex items-center h-14 rounded-full overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/10 dark:border-white/5"
      role="navigation"
      aria-label="Main Floating Navigation"
    >
      {/* Luminosity Layer (Light Mode) */}
      <div 
        className="absolute inset-0 mix-blend-luminosity dark:hidden pointer-events-none" 
        style={{ backgroundColor: 'var(--glass-bg)', opacity: 0.4 }}
      />
      
      {/* Vibrancy Layer */}
      <div 
        className="absolute inset-0 mix-blend-overlay dark:mix-blend-soft-light pointer-events-none opacity-80 dark:opacity-75" 
        style={{ backgroundColor: 'var(--glass-bg)' }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex items-center gap-1 p-1 w-full h-full">
        {children}
      </div>
    </refractive.nav>
  );
}

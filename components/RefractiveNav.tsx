"use client";

import { motion } from "motion/react";

export default function RefractiveNav({ children }: { children: React.ReactNode }) {
  return (
    <motion.nav
      layout
      className="relative flex items-center h-14 rounded-full overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/10 dark:border-white/5 backdrop-blur-xl bg-white/5 dark:bg-black/20 transition-colors duration-300"
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
    </motion.nav>
  );
}

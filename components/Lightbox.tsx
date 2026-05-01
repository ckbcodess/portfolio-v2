"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

interface LightboxProps {
  src: string | null;
  alt?: string;
  layoutId?: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

/**
 * Lightweight, buttery-smooth lightbox using Framer Motion layout animations.
 *
 * Usage:
 *   1. Wrap your thumbnail in a `<motion.div layoutId={uniqueId}>` 
 *   2. On click set the active image src + layoutId
 *   3. Render `<Lightbox src={...} layoutId={...} onClose={...} />`
 *
 * The component handles:
 *   - Smooth morph transition via shared `layoutId`
 *   - Blurred backdrop overlay with fade
 *   - Escape key + click-to-dismiss
 *   - Scroll lock while open
 *   - Keyboard accessibility
 */
export default function Lightbox({ src, alt = "", layoutId, onClose, onNext, onPrev }: LightboxProps) {
  // Escape to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext?.();
      if (e.key === "ArrowLeft") onPrev?.();
    },
    [onClose, onNext, onPrev],
  );

  useEffect(() => {
    if (!src) return;
    document.addEventListener("keydown", handleKeyDown);
    document.documentElement.setAttribute("data-lightbox-open", "true");
    
    // Focus management
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const activeElement = document.activeElement as HTMLElement;
    
    // Lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.removeAttribute("data-lightbox-open");
      document.body.style.overflow = prev;
      if (activeElement) activeElement.focus();
    };
  }, [src, handleKeyDown]);

  return (
    <AnimatePresence>
      {src && (
        <>
          {/* Backdrop */}
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1000000] bg-black/90 backdrop-blur-2xl"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Image container */}
          <motion.div
            key="lightbox-content"
            className="fixed inset-0 z-[1000001] flex items-center justify-center p-6 md:p-12 lg:p-20"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              layoutId={layoutId}
              className="relative max-w-[90vw] max-h-[85vh] w-full h-auto overflow-hidden rounded-lg shadow-2xl"
              style={{ aspectRatio: "auto" }}
              transition={{
                layout: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={src}
                alt={alt}
                width={1920}
                height={1080}
                className="w-full h-full object-contain"
                quality={95}
                priority
              />
            </motion.div>

            {/* Navigation buttons */}
            {onPrev && (
              <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-foreground/40 hover:text-foreground transition-colors z-[1000002]"
                aria-label="Previous image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            {onNext && (
              <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-foreground/40 hover:text-foreground transition-colors z-[1000002]"
                aria-label="Next image"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}

            {/* Close hint */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.4, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-foreground text-xs font-normal tracking-tight select-none pointer-events-none"
            >
              Arrows or click to navigate · Esc to close
            </motion.span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

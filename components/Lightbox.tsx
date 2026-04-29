"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

interface LightboxProps {
  src: string | null;
  alt?: string;
  layoutId?: string;
  onClose: () => void;
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
export default function Lightbox({ src, alt = "", layoutId, onClose }: LightboxProps) {
  // Escape to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!src) return;
    document.addEventListener("keydown", handleKeyDown);
    // Lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
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
            className="fixed inset-0 z-[99999] bg-background/80 backdrop-blur-xl"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Image container */}
          <motion.div
            key="lightbox-content"
            className="fixed inset-0 z-[100000] flex items-center justify-center p-6 md:p-12 lg:p-20"
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

            {/* Close hint */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.4, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-foreground text-xs font-normal tracking-tight select-none pointer-events-none"
            >
              Press Esc or click anywhere to close
            </motion.span>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

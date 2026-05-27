"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X } from "lucide-react";

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


            {/* Close Button - Topmost */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              data-cursor="pointer"
              className="absolute top-6 right-6 p-4 text-foreground/40 hover:text-foreground transition-all hover:scale-110 active:scale-95 z-[1000004] pointer-events-auto"
              aria-label="Close lightbox"
            >
              <X size={24} strokeWidth={2} />
            </button>

            <motion.div
              layoutId={layoutId}
              className="relative max-w-[90vw] max-h-[85vh] w-full h-auto overflow-hidden rounded-lg shadow-2xl z-[1000002]"
              style={{ aspectRatio: "auto" }}
              transition={{
                layout: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation Zones */}
              {(onPrev || onNext) && (
                <div className="absolute inset-0 flex z-10 pointer-events-auto">
                  {[
                    { type: 'left', handler: onPrev, cursor: 'lightbox-left' },
                    { type: 'right', handler: onNext, cursor: 'lightbox-right' }
                  ].map(({ type, handler, cursor }) => (
                    <div 
                      key={type}
                      className={`flex-1 ${handler ? "cursor-none" : "cursor-default"}`}
                      data-cursor={handler ? cursor : undefined}
                      onClick={(e) => {
                        if (handler) {
                          e.stopPropagation();
                          handler();
                        }
                      }}
                    />
                  ))}
                </div>
              )}
              {src.endsWith(".mp4") ? (
                <video
                  src={src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-contain max-h-[85vh]"
                />
              ) : (
                <Image
                  src={src}
                  alt={alt}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-contain"
                  quality={95}
                  priority
                />
              )}
            </motion.div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X } from "lucide-react";
import { useTransition } from "./TransitionProvider";

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
 */
export default function Lightbox({ src, alt = "", layoutId, onClose, onNext, onPrev }: LightboxProps) {
  const { setLightboxOpen } = useTransition();

  useEffect(() => {
    if (src) {
      setLightboxOpen(true);
      return () => setLightboxOpen(false);
    } else {
      setLightboxOpen(false);
    }
  }, [src, setLightboxOpen]);

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
    
    // Lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.removeAttribute("data-lightbox-open");
      document.body.style.overflow = prev;
    };
  }, [src, handleKeyDown]);

  const handleClose = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    onClose();
  };

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
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Dedicated Fixed Close Button - High contrast, accessible, touch-ready */}
          <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[1000005] pointer-events-auto">
            <button
              type="button"
              onClick={handleClose}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleClose(e);
              }}
              data-cursor="close"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-black/70 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-2xl cursor-pointer touch-manipulation"
              aria-label="Close lightbox"
            >
              <X size={22} strokeWidth={2} />
            </button>
          </div>

          {/* Image container */}
          <motion.div
            key="lightbox-content"
            className="fixed inset-0 z-[1000001] flex items-center justify-center p-6 md:p-12 lg:p-20"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
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

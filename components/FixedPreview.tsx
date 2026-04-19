"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

interface FixedPreviewProps {
  activeImage: string;
}

/**
 * Fixed preview panel pinned to the bottom-right of the viewport.
 *
 * Rendered via createPortal to document.body so that GSAP ScrollSmoother's
 * transform on #smooth-wrapper doesn't break `position: fixed` (CSS spec:
 * a transformed ancestor turns fixed into absolute).
 *
 * The motion.aside IS the fixed element — no intermediate wrappers
 * that would fight with the entrance animation.
 */
export default function FixedPreview({ activeImage }: FixedPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 1.2,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="hidden lg:flex fixed bottom-20 right-20 z-40"
      aria-label="Case study preview"
    >
      <div className="w-[600px] h-[338px] rounded-lg overflow-hidden bg-neutral-900 relative">
        <AnimatePresence mode="wait">
          {activeImage && (
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={activeImage}
                alt="Case study preview"
                fill
                sizes="600px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>,
    document.body
  );
}

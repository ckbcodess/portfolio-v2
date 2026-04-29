"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import PreviewCard from "./PreviewCard";
import { useTransition } from "./TransitionProvider";

interface FixedPreviewProps {
  activeImage: string;
  isVisible?: boolean;
}

export default function FixedPreview({ activeImage, isVisible = true }: FixedPreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) return null;

  // We keep it mounted during transition so GSAP can handle the fade-out
  // before the router unmounts the page.
  const shouldShow = isVisible;

  return createPortal(
    <AnimatePresence>
      {shouldShow && (
        <div className="fixed inset-x-0 bottom-[8%] px-[var(--page-px)] flex justify-end pointer-events-none z-[100] hidden lg:flex">
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.8,
            }}
            className="fixed-preview-portal pointer-events-auto w-[clamp(350px,38vw,600px)] h-auto"
            aria-label="Case study preview"
          >
            <PreviewCard activeImage={activeImage} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

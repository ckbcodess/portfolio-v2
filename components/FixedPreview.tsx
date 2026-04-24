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
  const { isTransitioning } = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // We keep it mounted during transition so GSAP can handle the fade-out
  // before the router unmounts the page.
  const shouldShow = isVisible;

  return createPortal(
    <AnimatePresence>
      {shouldShow && (
        <motion.aside
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.8,
          }}
          className="fixed-preview-portal hidden lg:block fixed bottom-[8%] right-[var(--page-px)] z-[100] w-[clamp(350px,38vw,600px)] h-auto"
          aria-label="Case study preview"
        >
          <PreviewCard activeImage={activeImage} />
        </motion.aside>
      )}
    </AnimatePresence>,
    document.body
  );
}

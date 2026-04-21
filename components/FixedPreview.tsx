"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import PreviewCard from "./PreviewCard";

interface FixedPreviewProps {
  activeImage: string;
}

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
        duration: 0.5,
        delay: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="hidden lg:block fixed bottom-[8%] right-[var(--page-px)] z-[100] w-[clamp(350px,38vw,600px)] h-auto"
      aria-label="Case study preview"
    >
      <PreviewCard activeImage={activeImage} />
    </motion.aside>,
    document.body
  );
}

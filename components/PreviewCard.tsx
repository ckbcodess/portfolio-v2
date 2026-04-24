"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface PreviewCardProps {
  activeImage: string;
  className?: string;
  aspectRatio?: string;
}

export default function PreviewCard({ activeImage, className, aspectRatio = "aspect-video" }: PreviewCardProps) {
  return (
    <div className={`w-full ${aspectRatio} rounded-lg overflow-hidden bg-neutral-900 relative ${className}`}>
      <AnimatePresence mode="sync" initial={false}>
        {activeImage && (
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={activeImage}
              alt="Case study preview"
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

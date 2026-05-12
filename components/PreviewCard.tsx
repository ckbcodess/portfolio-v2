"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

interface PreviewCardProps {
  activeImage: string;
  className?: string;
  aspectRatio?: string;
}

export default function PreviewCard({ activeImage, className, aspectRatio = "aspect-video" }: PreviewCardProps) {
  const hasHeightClass = className?.includes("h-");
  const aspectClass = hasHeightClass ? "" : aspectRatio;
  const isVideo = activeImage?.endsWith(".mp4");

  return (
    <div className={`w-full ${aspectClass} rounded-lg overflow-hidden bg-neutral-900 relative ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        {activeImage && (
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-0 transform-gpu"
          >
            {isVideo ? (
              <video
                src={activeImage}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={activeImage}
                alt="Case study preview"
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
                priority
                decoding="async"
              />
            )}
            <div className="absolute inset-0 bg-black/5" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

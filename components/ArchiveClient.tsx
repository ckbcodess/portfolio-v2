"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, Variants } from "motion/react";
import type { ArchiveRow } from "@/lib/types";
import { useTransition } from "@/components/TransitionProvider";
import { MaskReveal } from "@/components/MaskReveal";
import ArchiveGalleryLightbox from "@/components/ArchiveGalleryLightbox";

interface ArchiveClientProps {
  rows: ArchiveRow[];
}

export default function ArchiveClient({ rows }: ArchiveClientProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const { canAnimate } = useTransition();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 1, scale: 1 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0,
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div
      ref={pageRef}
      className="bg-background min-h-screen pt-20 sm:pt-24 md:pt-32 pb-16 md:pb-24 w-full selection:bg-primary selection:text-primary-foreground flex flex-col items-center"
    >
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate={canAnimate ? "show" : "hidden"}
        className="w-full flex flex-col gap-12 sm:gap-16 md:gap-20 origin-top-left"
      >
        {/* Hero Section: Aligned with Homepage container position */}
        <section className="w-full max-w-[1200px] px-[var(--page-px)] mx-auto flex flex-col md:flex-row items-start justify-between gap-10 md:gap-12 relative">
          <div className="flex flex-col gap-3 sm:gap-4 items-start w-full md:w-[460px] shrink-0 text-left">
            {/* Title label "Archive" matching Homepage positioning */}
            <MaskReveal delay={0.1}>
              <div className="h-8 flex items-center">
                <div className="relative overflow-hidden h-6 flex items-center">
                  <h1 className="text-foreground text-sm font-medium tracking-tight whitespace-nowrap">
                    Archive
                  </h1>
                </div>
              </div>
            </MaskReveal>

            {/* "Some of my work." with exact Homepage TabSection typography */}
            <MaskReveal delay={0.2}>
              <h2 className="text-xl sm:text-2xl text-foreground font-normal font-heading leading-[1.4] tracking-tight text-left m-0">
                Some of my work.
              </h2>
            </MaskReveal>
          </div>
        </section>

        {/* Full-Width Masonry / Grid Gallery */}
        <section id="archive-grid" className="w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-2">
          <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full">
            {rows.map((row, idx) => {
              if (!row.image) return null;
              const imgSrc = row.image;
              const aspectClass = "aspect-[16/12]";
              const itemNumber = String(idx + 1).padStart(2, "0");

              return (
                <motion.div
                  key={row.title + idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.03 }}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative overflow-hidden cursor-pointer w-full rounded-[4px]"
                >
                  <div
                    className={`relative w-full overflow-hidden rounded-[6px] bg-transparent group-hover:bg-white/[0.08] dark:group-hover:bg-white/[0.08] transition-colors duration-300 ${aspectClass}`}
                  >
                    {/* Item Number Badge */}
                    <span className="absolute top-2.5 left-3 z-20 font-mono text-[11px] font-medium tracking-wider text-white/40 group-hover:text-white/80 transition-colors pointer-events-none select-none">
                      {itemNumber}
                    </span>

                    {imgSrc.endsWith(".webm") || imgSrc.endsWith(".mp4") ? (
                      <video
                        src={imgSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="relative z-10 w-full h-full object-contain object-center p-6 sm:p-8"
                      />
                    ) : (
                      <Image
                        src={imgSrc}
                        alt={row.title}
                        fill
                        className="relative z-10 object-contain object-center p-6 sm:p-8"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </motion.main>

      {/* Gallery Lightbox Modal */}
      <ArchiveGalleryLightbox
        items={rows}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
}

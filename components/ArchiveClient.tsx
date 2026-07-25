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

// Borderless solid dark black SVG placeholder image data URI
const BLACK_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='%23121214'/></svg>";

export default function ArchiveClient({ rows }: ArchiveClientProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const { canAnimate } = useTransition();
  const [isArtOnly, setIsArtOnly] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Ensure 12 items populated with black image placeholders with varied masonry aspect ratios
  const displayRows = Array.from({ length: 12 }, (_, i) => {
    const existing = rows[i];
    const aspects = [
      "landscape",
      "portrait",
      "landscape",
      "square",
      "portrait",
      "landscape",
      "landscape",
      "portrait",
      "landscape",
      "square",
      "portrait",
      "landscape",
    ] as const;

    return {
      title: existing?.title || `Project ${i + 1}`,
      role: existing?.role || "Design & Engineering",
      year: existing?.year || "2026",
      tech: existing?.tech,
      image: existing?.image || BLACK_PLACEHOLDER,
      isArt: existing?.isArt || i % 3 === 1,
      aspectRatio: aspects[i % aspects.length],
    };
  });

  const filteredRows = isArtOnly
    ? displayRows.filter((r) => r.isArt)
    : displayRows;

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
        {/* Hero Section: Aligned with Homepage container */}
        <section className="w-full max-w-[1200px] px-[var(--page-px)] mx-auto flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12 relative">
          <div className="flex flex-col gap-3 sm:gap-4 items-start w-full md:w-[460px] shrink-0 text-left">
            {/* Plain text label "Archive" in position of "Ransford JC" */}
            <MaskReveal delay={0.1}>
              <div className="relative overflow-hidden h-6 flex items-center">
                <h1 className="text-foreground text-sm font-medium tracking-tight whitespace-nowrap">
                  Archive
                </h1>
              </div>
            </MaskReveal>

            {/* "Some of my work." with exact Homepage TabSection typography */}
            <MaskReveal delay={0.2}>
              <h2 className="text-xl sm:text-2xl text-foreground font-normal font-heading leading-[1.4] tracking-tight text-left m-0">
                Some of my work.
              </h2>
            </MaskReveal>
          </div>

          {/* Right Header Switch Control (Art Filter Switch) */}
          <div className="flex items-center gap-3 self-start md:self-end pt-1">
            <span className="text-xs sm:text-sm font-medium text-foreground/80">Art</span>
            <button
              type="button"
              role="switch"
              aria-checked={isArtOnly}
              onClick={() => setIsArtOnly((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isArtOnly ? "bg-foreground" : "bg-foreground/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isArtOnly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Full-Width Edge-to-Edge Masonry Gallery Grid (Borderless Cards) */}
        <section id="archive-grid" className="w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-2">
          <div className="columns-1 min-[500px]:columns-2 md:columns-4 gap-3 sm:gap-4 md:gap-5 w-full">
            {filteredRows.map((row, idx) => {
              const isCard1 = idx === 0;
              const imgSrc = row.image || BLACK_PLACEHOLDER;
              const aspectClass =
                row.aspectRatio === "portrait"
                  ? "aspect-[3/4.2]"
                  : row.aspectRatio === "square"
                  ? "aspect-square"
                  : "aspect-[16/10]";

              return (
                <motion.div
                  key={row.title + idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.03 }}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative overflow-hidden cursor-pointer w-full break-inside-avoid mb-3 sm:mb-4 md:mb-5 rounded-[4px]"
                >
                  {isCard1 ? (
                    /* Card 1: Outer container frame wrapping inner borderless placeholder image */
                    <div className="w-full bg-transparent rounded-[4px] aspect-[16/11] flex items-center justify-center relative">
                      <div className="relative w-full aspect-[16/10] rounded-[4px] overflow-hidden bg-transparent flex items-center justify-center">
                        <Image
                          src={imgSrc}
                          alt={row.title}
                          fill
                          className="object-cover opacity-90"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                        {/* Dark Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    /* Regular Borderless Masonry Visual Cards */
                    <div
                      className={`relative w-full overflow-hidden rounded-[4px] bg-transparent ${aspectClass}`}
                    >
                      <Image
                        src={imgSrc}
                        alt={row.title}
                        fill
                        className="object-cover opacity-90"
                        sizes="(max-width: 768px) 100vw, 25vw"
                      />
                      {/* Dark Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      </motion.main>

      {/* Gallery Lightbox Modal */}
      <ArchiveGalleryLightbox
        items={filteredRows}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
}

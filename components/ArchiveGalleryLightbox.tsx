"use client";

import React, { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ArchiveRow } from "@/lib/types";

interface ArchiveGalleryLightboxProps {
  items: ArchiveRow[];
  currentIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export default function ArchiveGalleryLightbox({
  items,
  currentIndex,
  onClose,
  onSelectIndex,
}: ArchiveGalleryLightboxProps) {
  const activeItem = currentIndex !== null ? items[currentIndex] : null;

  const handleNext = useCallback(() => {
    if (currentIndex === null || items.length === 0) return;
    onSelectIndex((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null || items.length === 0) return;
    onSelectIndex((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    },
    [currentIndex, onClose, handleNext, handlePrev]
  );

  useEffect(() => {
    if (currentIndex === null) return;
    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [currentIndex, handleKeyDown]);

  if (currentIndex === null || !activeItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-[100000] bg-black/92 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-10 select-none cursor-pointer"
        onClick={onClose}
      >
        {/* Minimalist Top Header: Counter & Close */}
        <div
          className="w-full max-w-[1200px] flex items-center justify-between z-10 shrink-0 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-mono text-white/40">
            {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>

          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-2 -mr-2 cursor-pointer"
            aria-label="Close Lightbox"
          >
            <X size={20} />
          </button>
        </div>

        {/* Center Media Focus Container */}
        <div
          className="relative flex-1 w-full max-w-[1100px] my-4 flex items-center justify-center min-h-0 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Previous Click Zone */}
          {items.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-0 bottom-0 w-1/4 z-20 flex items-center justify-start pl-4 group cursor-pointer text-white/20 hover:text-white transition-colors"
              aria-label="Previous"
            >
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={20} />
              </div>
            </button>
          )}

          {/* Main Media Item */}
          <motion.div
            key={activeItem.title + currentIndex}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full h-full max-h-[78vh] flex items-center justify-center overflow-hidden rounded-xl"
          >
            {activeItem.image ? (
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1100px"
                priority
              />
            ) : (
              <div
                className={`w-full h-full min-h-[320px] max-h-[60vh] rounded-2xl flex flex-col items-center justify-center p-8 text-center ${
                  activeItem.gradient
                    ? `bg-gradient-to-br ${activeItem.gradient}`
                    : "bg-neutral-900"
                }`}
              >
                <h2 className="text-white text-3xl sm:text-4xl font-semibold tracking-tight">
                  {activeItem.title}
                </h2>
              </div>
            )}
          </motion.div>

          {/* Next Click Zone */}
          {items.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-0 bottom-0 w-1/4 z-20 flex items-center justify-end pr-4 group cursor-pointer text-white/20 hover:text-white transition-colors"
              aria-label="Next"
            >
              <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={20} />
              </div>
            </button>
          )}
        </div>

        {/* Minimalist Bottom Caption Bar */}
        <div
          className="w-full max-w-[1200px] flex items-center justify-between z-10 shrink-0 text-xs font-mono text-white/60 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{activeItem.title}</span>
            <span className="text-white/30">•</span>
            <span>{activeItem.role}</span>
          </div>
          <span className="text-white/40">{activeItem.year}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { ArchiveRow } from "@/lib/types";
import { useTransition } from "./TransitionProvider";

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
  const { setLightboxOpen } = useTransition();
  const activeItem = currentIndex !== null ? items[currentIndex] : null;
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Reset isPlaying when switching active items
  useEffect(() => {
    setIsPlaying(true);
  }, [currentIndex]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (currentIndex !== null) {
      setLightboxOpen(true);
      return () => {
        setLightboxOpen(false);
      };
    } else {
      setLightboxOpen(false);
    }
  }, [currentIndex, setLightboxOpen]);

  const handleNext = useCallback(() => {
    if (currentIndex === null || items.length === 0) return;
    if (currentIndex < items.length - 1) {
      onSelectIndex(currentIndex + 1);
    }
  }, [currentIndex, items.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null || items.length === 0) return;
    if (currentIndex > 0) {
      onSelectIndex(currentIndex - 1);
    }
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

    const preventScroll = (e: TouchEvent | WheelEvent) => {
      e.preventDefault();
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [currentIndex, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    // If the click/tap is outside the main image wrapper element, close the lightbox
    if (imageWrapperRef.current && !imageWrapperRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (currentIndex === null || !activeItem) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="group fixed inset-0 z-[100000] bg-black/60 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 select-none cursor-pointer touch-manipulation overflow-hidden"
        data-cursor="close"
        onClick={handleBackdropClick}
      >
        {/* Super blurry background version of selected image/thumbnail */}
        {activeItem.image && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 scale-110 blur-[80px]">
            {activeItem.image.endsWith(".webm") || activeItem.image.endsWith(".mp4") ? (
              <video
                src={activeItem.image}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={activeItem.image}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            )}
          </div>
        )}

        {/* Top Right Close Button (Always visible & elevated on touch) */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white/90 hover:text-white transition-colors p-3.5 sm:p-3 cursor-pointer rounded-full bg-black/70 hover:bg-white/20 border border-white/20 backdrop-blur-md active:scale-95 flex items-center justify-center shadow-2xl min-w-[44px] min-h-[44px]"
            data-cursor="close"
            aria-label="Close Lightbox"
          >
            <X size={22} />
          </button>
        </div>

        {/* Center Media Focus Container */}
        <div className="relative w-full h-full max-w-[1400px] flex items-center justify-center min-h-0 pointer-events-none z-10">
          {/* Left Navigation Arrow (Always visible on mobile touch, fades in on hover for desktop) */}
          {!isFirst && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="fixed left-3 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white/80 hover:text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 cursor-pointer pointer-events-auto flex items-center justify-center active:scale-95"
              data-cursor="lightbox-left"
              aria-label="Previous image"
            >
              <ChevronLeft size={22} className="transition-transform hover:-translate-x-0.5" />
            </button>
          )}

          {/* Main Media Item in Fullest Quality (Tight image wrapper ref check) */}
          <motion.div
            key={activeItem.title + currentIndex}
            ref={imageWrapperRef}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative max-w-full max-h-[85vh] sm:max-h-[90vh] w-auto h-auto flex items-center justify-center overflow-hidden pointer-events-auto cursor-pointer rounded-lg shadow-2xl"
          >
            {activeItem.image ? (
              activeItem.image.endsWith(".webm") || activeItem.image.endsWith(".mp4") ? (
                <div className="relative group/video flex items-center justify-center cursor-pointer" onClick={togglePlayPause}>
                  <video
                    ref={videoRef}
                    src={activeItem.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-auto h-auto max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain select-none rounded-lg"
                  />
                  {/* Play Overlay Icon when paused */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-opacity duration-200">
                      <div className="p-4 rounded-full bg-black/60 border border-white/20 text-white backdrop-blur-md shadow-2xl">
                        <Play size={32} className="ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Image
                  src={activeItem.image}
                  alt={activeItem.title || "Archive item"}
                  width={1600}
                  height={1200}
                  className="w-auto h-auto max-w-full max-h-[85vh] sm:max-h-[90vh] object-contain select-none"
                  sizes="100vw"
                  quality={100}
                  priority
                />
              )
            ) : (
              <div
                className={`w-[80vw] max-w-[600px] h-[50vh] rounded-2xl flex flex-col items-center justify-center p-8 text-center ${
                  activeItem.gradient
                    ? `bg-gradient-to-br ${activeItem.gradient}`
                    : "bg-neutral-900"
                }`}
              >
                <h2 className="text-white text-2xl sm:text-4xl font-semibold tracking-tight">
                  {activeItem.title}
                </h2>
              </div>
            )}
          </motion.div>

          {/* Right Navigation Arrow (Always visible on mobile touch, fades in on hover for desktop) */}
          {!isLast && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="fixed right-3 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white/80 hover:text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 cursor-pointer pointer-events-auto flex items-center justify-center active:scale-95"
              data-cursor="lightbox-right"
              aria-label="Next image"
            >
              <ChevronRight size={22} className="transition-transform hover:translate-x-0.5" />
            </button>
          )}
        </div>

        {/* Bottom Right Clean Tabular Counter (e.g. 01/12) */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-30 pointer-events-auto flex items-center gap-1 text-white/70 text-xs sm:text-sm font-medium tracking-tight select-none">
          <span className="inline-flex items-center tabular-nums">
            {String(currentIndex + 1)
              .padStart(2, "0")
              .split("")
              .map((digit, i) => (
                <div key={i} className="relative w-[0.6em] h-[1em] flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={digit + i}
                      initial={{ opacity: 0, filter: "blur(4px)", y: 6 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      exit={{ opacity: 0, filter: "blur(4px)", y: -6 }}
                      transition={{
                        duration: 0.35,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute"
                    >
                      {digit}
                    </motion.span>
                  </AnimatePresence>
                </div>
              ))}
          </span>
          <span className="text-white/40">/</span>
          <span className="tabular-nums text-white/40">
            {String(items.length).padStart(2, "0")}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

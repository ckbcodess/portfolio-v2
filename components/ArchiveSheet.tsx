"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight, Grid, List } from "lucide-react";
import type { ArchiveRow } from "@/lib/types";
import TransitionLink from "./TransitionLink";
import { useTransition } from "./TransitionProvider";

interface ArchiveSheetProps {
  rows: ArchiveRow[];
  isOpen: boolean;
  onClose: () => void;
}

// Vibrant curated color palettes matching reference design (high-contrast dark mode)
const CARD_PALETTES = [
  { bg: "bg-[#ff3b30]", gradient: "from-[#ff453a] to-[#ff2d55]", text: "text-white" }, // Coral/Red (Item 1 inner)
  { bg: "bg-[#ffe600]", gradient: "from-[#ffe600] to-[#ffd600]", text: "text-black" }, // Yellow (Item 2)
  { bg: "bg-[#00f076]", gradient: "from-[#00ff87] to-[#60efff]", text: "text-black" }, // Neon Green (Item 3)
  { bg: "bg-[#0091ff]", gradient: "from-[#00c6ff] to-[#0072ff]", text: "text-white" }, // Electric Blue (Item 4)
  { bg: "bg-[#d35400]", gradient: "from-[#e67e22] to-[#d35400]", text: "text-white" }, // Burnt Orange (Item 5)
  { bg: "bg-[#6c5ce7]", gradient: "from-[#a29bfe] to-[#6c5ce7]", text: "text-white" }, // Vivid Purple (Item 6)
  { bg: "bg-[#1b4d2e]", gradient: "from-[#2ecc71] to-[#1b4d2e]", text: "text-white" }, // Forest Green (Item 7)
  { bg: "bg-[#4a2e2b]", gradient: "from-[#8e44ad] to-[#4a2e2b]", text: "text-white" }, // Dark Brown (Item 8)
  { bg: "bg-[#008f8c]", gradient: "from-[#00fff6] to-[#008f8c]", text: "text-black" }, // Emerald/Teal (Item 9)
  { bg: "bg-[#00ff66]", gradient: "from-[#00ff66] to-[#00b347]", text: "text-black" }, // Bright Green (Item 10)
  { bg: "bg-[#00a8ff]", gradient: "from-[#00d2ff] to-[#0081ff]", text: "text-white" }, // Cyan (Item 11)
  { bg: "bg-[#ffea00]", gradient: "from-[#fff000] to-[#ffc700]", text: "text-black" }, // Yellow (Item 12)
];

const panelVariants = {
  hidden: {
    y: "100%",
    transition: { type: "spring" as const, stiffness: 320, damping: 36, mass: 0.9 },
  },
  visible: {
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 36, mass: 0.9 },
  },
};

export default function ArchiveSheet({ rows, isOpen, onClose }: ArchiveSheetProps) {
  const { navigate } = useTransition();
  const [isArtOnly, setIsArtOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Lock main page body scroll while sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredRows = isArtOnly ? rows.filter((r) => r.isArt) : rows;

  return (
    <>
      {/* Backdrop Blur Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="archive-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            onPointerDown={onClose}
            className="fixed inset-0 z-[940] bg-black/40 backdrop-blur-xs cursor-pointer pointer-events-auto w-full h-full touch-none"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet Panel */}
      <motion.div
        key="archive-panel"
        variants={panelVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.02, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 90 || info.velocity.y > 350) {
            onClose();
          }
        }}
        className="fixed bottom-0 left-0 right-0 z-[950] w-full h-[90dvh] sm:h-[92dvh] bg-[#0c0c0e] dark:bg-[#09090b] rounded-t-[28px] sm:rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col text-foreground touch-pan-y border-t border-white/10"
        style={{ willChange: "transform" }}
        aria-hidden={!isOpen}
        aria-label="Archive Sheet"
      >
        {/* Mobile Drag Handle Indicator */}
        <div
          onClick={onClose}
          className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none shrink-0 touch-none"
          aria-label="Close Archive Sheet"
        >
          <div className="w-12 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors" />
        </div>

        {/* Sheet Top Header Bar */}
        <div className="px-6 sm:px-10 md:px-14 pt-4 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0 border-b border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono uppercase tracking-widest text-white/50">Archive</span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Some of my work.
            </h1>
          </div>

          {/* Right Header Controls: Art Switch Toggle & Grid/List View Toggle */}
          <div className="flex items-center gap-5 sm:gap-6 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10 text-white/60">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid" ? "bg-white/15 text-white" : "hover:text-white/80"
                }`}
                title="Grid View"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "list" ? "bg-white/15 text-white" : "hover:text-white/80"
                }`}
                title="List View"
              >
                <List size={15} />
              </button>
            </div>

            {/* Art Toggle Switch matching design reference */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs sm:text-sm font-medium text-white/80">Art</span>
              <button
                type="button"
                role="switch"
                aria-checked={isArtOnly}
                onClick={() => setIsArtOnly((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isArtOnly ? "bg-white" : "bg-white/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isArtOnly ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
                  }`}
                />
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all cursor-pointer border border-white/10"
              aria-label="Close Archive"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Sheet Content Area (Scrollable Grid / Table) */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 md:px-14 py-8 custom-scrollbar">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pb-16">
              {filteredRows.map((row, idx) => {
                const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
                const isCaseStudy = Boolean(row.caseStudyHref);
                const isFeatured = idx === 0 || row.aspectRatio === "featured";

                return (
                  <motion.div
                    key={row.title + idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    onClick={
                      isCaseStudy
                        ? () => {
                            onClose();
                            navigate(row.caseStudyHref!, row.title, row.color || "#333");
                          }
                        : row.externalLink
                        ? () => window.open(row.externalLink, "_blank", "noopener,noreferrer")
                        : undefined
                    }
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                      isFeatured
                        ? "sm:col-span-2 md:col-span-1 bg-[#1a1a1e] border border-white/10 p-5 sm:p-6 flex flex-col justify-between"
                        : "border border-white/5"
                    }`}
                  >
                    {/* Visual Card Content */}
                    {isFeatured ? (
                      /* Card 1 Container Card Style from Screenshot */
                      <div className="flex flex-col gap-4 h-full min-h-[260px] justify-between">
                        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-red-500 via-orange-500 to-pink-600 flex items-center justify-center shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                          {row.image ? (
                            <Image src={row.image} alt={row.title} fill className="object-contain object-center" sizes="(max-width: 768px) 100vw, 33vw" />
                          ) : (
                            <span className="text-white font-mono font-bold tracking-wider text-sm bg-black/40 px-3 py-1.5 rounded-md backdrop-blur-md">
                              {row.title}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <h3 className="text-white font-semibold text-base sm:text-lg group-hover:text-cyan-400 transition-colors">
                              {row.title}
                            </h3>
                            <p className="text-white/60 text-xs mt-0.5">{row.role} • {row.year}</p>
                          </div>
                          {isCaseStudy ? (
                            <TransitionLink
                              href={row.caseStudyHref!}
                              label={row.title}
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                              }}
                              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-white group-hover:text-black transition-all"
                            >
                              <ArrowUpRight size={16} />
                            </TransitionLink>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-white group-hover:text-black transition-all">
                              <ArrowUpRight size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Regular Visual Aspect Color / Image Cards */
                      <div
                        className={`relative w-full overflow-hidden rounded-2xl flex flex-col justify-between p-5 sm:p-6 min-h-[220px] ${
                          row.image
                            ? "bg-neutral-900"
                            : `${palette.bg} bg-gradient-to-br ${palette.gradient}`
                        }`}
                      >
                        {/* Background Thumbnail Image if available */}
                        {row.image && (
                          <Image
                            src={row.image}
                            alt={row.title}
                            fill
                            className="object-contain object-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        )}

                        {/* Card Hover Dark Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300 z-1" />

                        {/* Top Badges */}
                        <div className="relative z-10 flex items-center justify-between">
                          <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-black/40 text-white/90 backdrop-blur-md border border-white/10 uppercase">
                            {row.year}
                          </span>
                          {row.isArt && (
                            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-black font-semibold uppercase">
                              Art
                            </span>
                          )}
                        </div>

                        {/* Bottom Card Title & Metadata */}
                        <div className="relative z-10 flex items-end justify-between pt-12">
                          <div className="flex flex-col gap-1 pr-2">
                            <h3 className="text-white font-semibold text-lg sm:text-xl drop-shadow-md group-hover:translate-x-1 transition-transform">
                              {row.title}
                            </h3>
                            <p className="text-white/80 text-xs font-normal drop-shadow">
                              {row.role} {row.tech ? `• ${row.tech}` : ""}
                            </p>
                          </div>

                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 group-hover:bg-white group-hover:text-black transition-all">
                            <ArrowUpRight size={15} />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Structured List / Table View */
            <div className="pb-16 max-w-5xl mx-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/50 font-mono tracking-wider uppercase">
                    <th className="pb-3 pr-4">Project</th>
                    <th className="pb-3 pr-4 hidden sm:table-cell">Role</th>
                    <th className="pb-3 pr-4">Year</th>
                    <th className="pb-3 text-right">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, idx) => {
                    const isCaseStudy = Boolean(row.caseStudyHref);
                    return (
                      <tr
                        key={row.title + idx}
                        onClick={
                          isCaseStudy
                            ? () => {
                                onClose();
                                navigate(row.caseStudyHref!, row.title, row.color || "#333");
                              }
                            : row.externalLink
                            ? () => window.open(row.externalLink, "_blank", "noopener,noreferrer")
                            : undefined
                        }
                        className="border-b border-white/5 text-sm group hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {row.image && (
                              <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white/10 shrink-0">
                                <Image src={row.image} alt={row.title} fill className="object-contain" sizes="32px" />
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                                {row.title}
                              </span>
                              {row.tech && <span className="text-xs text-white/40">{row.tech}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-white/70 font-normal hidden sm:table-cell">{row.role}</td>
                        <td className="py-4 pr-4 text-white/50 text-xs font-mono">{row.year}</td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-white/60 group-hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors">
                            View <ArrowUpRight size={14} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

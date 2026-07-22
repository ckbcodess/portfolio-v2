"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight } from "lucide-react";
import type { ArchiveRow } from "@/lib/types";
import TransitionLink from "./TransitionLink";
import { useTransition } from "./TransitionProvider";

interface ArchiveDrawerProps {
  rows: ArchiveRow[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchiveDrawer({ rows, isOpen, onClose }: ArchiveDrawerProps) {
  const { navigate } = useTransition();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[90] pointer-events-auto"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed right-0 top-0 bottom-0 h-screen w-full md:w-[600px] bg-white/95 dark:bg-[#121212]/95 border-l border-black/5 dark:border-white/5 p-8 flex flex-col gap-10 shadow-2xl z-[100] pointer-events-auto text-left"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-foreground text-xl font-semibold tracking-tight">Archive</h2>
                <p className="text-muted-foreground text-xs font-normal">A structured log of my works</p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground transition-all cursor-pointer"
                aria-label="Close Archive"
              >
                <X size={18} />
              </button>
            </div>

            {/* Project Log Table */}
            <div className="flex-1 overflow-y-auto scroll-fade-y pr-2 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                    <th className="pb-3 pr-4 font-semibold">Project</th>
                    <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">Role</th>
                    <th className="pb-3 pr-4 font-semibold">Year</th>
                    <th className="pb-3 text-right font-semibold">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isCaseStudy = Boolean(row.caseStudyHref);
                    return (
                      <tr
                        key={row.title}
                        onClick={
                          isCaseStudy
                            ? () => {
                                onClose();
                                navigate(row.caseStudyHref!, row.title, row.color || "#333");
                              }
                            : undefined
                        }
                        className={`border-b border-black/5 dark:border-white/5 text-sm group hover:bg-foreground/[0.01] transition-colors ${
                          isCaseStudy ? "cursor-pointer" : ""
                        }`}
                      >
                        {/* Title (+ optional thumbnail) */}
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {row.image && (
                              <div className="relative w-8 h-8 rounded-md overflow-hidden bg-foreground/5 shrink-0">
                                <Image src={row.image} alt={row.title} fill className="object-cover" sizes="32px" />
                              </div>
                            )}
                            <div className="flex flex-col items-start">
                              {isCaseStudy ? (
                                <TransitionLink
                                  href={row.caseStudyHref!}
                                  label={row.title}
                                  color={row.color || "#333"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onClose();
                                  }}
                                  className="text-foreground font-medium group-hover:text-[#008f8c] dark:group-hover:text-[#00fff6] transition-colors inline-block text-left"
                                >
                                  {row.title}
                                </TransitionLink>
                              ) : (
                                <span className="text-foreground/75 font-medium">{row.title}</span>
                              )}
                              {row.tech && (
                                <span className="text-xs text-muted-foreground/60 font-normal mt-0.5">{row.tech}</span>
                              )}
                              {!row.tech && (
                                <span className="text-xs text-muted-foreground/60 font-normal sm:hidden mt-0.5">
                                  {row.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Role (Hidden on mobile) */}
                        <td className="py-4 pr-4 text-muted-foreground/80 font-normal hidden sm:table-cell">
                          {row.role}
                        </td>

                        {/* Year */}
                        <td className="py-4 pr-4 text-muted-foreground/80 font-normal text-xs">{row.year}</td>

                        {/* Link */}
                        <td className="py-4 text-right">
                          {isCaseStudy ? (
                            <TransitionLink
                              href={row.caseStudyHref!}
                              label={row.title}
                              color={row.color || "#333"}
                              onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                              }}
                              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs font-semibold uppercase tracking-wider transition-colors"
                            >
                              View <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </TransitionLink>
                          ) : row.externalLink ? (
                            <a
                              href={row.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs font-semibold uppercase tracking-wider transition-colors"
                            >
                              Visit <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs font-normal">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

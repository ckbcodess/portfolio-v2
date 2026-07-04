"use client";

import React, { useEffect } from "react";
import { X, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";

interface InfoSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const GEEK_TAGS = [
  "Design Systems",
  "Interaction Design",
  "Google Antigravity",
  "Claude Code",
  "Speedcubing",
  "Figma",
  "Feather",
  "Adobe Suite",
  "Procreate",
  "Artstudio Pro",
];

const CONNECT_LINKS = [
  { label: "Mail", href: "mailto:rnsfordgyasi@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ransford-gyasi/", external: true },
  { label: "Github", href: "https://github.com/rnsford", external: true },
  { label: "Instagram", href: "https://instagram.com", external: true },
  { label: "Twitter [X]", href: "https://x.com", external: true },
];

const panelVariants = {
  hidden: {
    y: "100%",
    transition: { type: "spring" as const, stiffness: 320, damping: 38, mass: 0.9 },
  },
  visible: {
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 38, mass: 0.9 },
  },
};

export default function InfoSheet({ isOpen, onClose }: InfoSheetProps) {
  // Lock scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Blurred backdrop — click to close */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="info-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={onClose}
            className="fixed inset-0 z-[940]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet — full width, 65dvh tall */}
      <motion.div
        key="info-panel"
        variants={panelVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        className="fixed bottom-0 left-0 right-0 z-[950] w-full h-[82dvh] bg-background rounded-t-[24px] shadow-2xl overflow-hidden text-base"
        style={{ willChange: "transform" }}
        aria-hidden={!isOpen}
        aria-label="Info panel"
      >
        {/* Close button — absolute top right */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 md:right-8 md:top-8 w-8 h-8 rounded-full flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 text-foreground/40 hover:text-foreground transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 z-10"
          aria-label="Close Info"
        >
          <X size={14} />
        </button>

        {/* 3-column grid — fills full panel height */}
        <div className="h-full grid grid-cols-1 md:grid-cols-3">

          {/* ── Col 1: Info ── */}
          <div className="flex flex-col justify-between px-8 md:px-10 py-6 md:py-8 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col gap-4">
              <p className="text-foreground/40 text-base">Info</p>
              <div className="flex flex-col gap-4 text-foreground/70 text-lg leading-relaxed">
                <p>
                  I&apos;m a product designer focused on interaction design and pixel-perfect front-end and mobile applications. Lately, I&apos;ve been building with AI tools and learning to engineer my designs into live products. With deep experience in design systems for startups, I&apos;m now on a design engineering journey, translating designs into clean code myself.
                </p>
              </div>
            </div>
            <p className="text-foreground/25 text-sm mt-6">Last updated: June 2026</p>
          </div>

          {/* ── Col 2: Experience ── */}
          <div className="flex flex-col gap-4 px-8 md:px-10 py-6 md:py-8 overflow-y-auto scrollbar-hide">
            <p className="text-foreground/40 text-base">Experience</p>
            <div className="flex flex-col gap-4 text-foreground/70 text-lg leading-relaxed">
              <p>
                Right now I&apos;m at GCB Bank PLC as a design systems engineer, 3+ years in, and lately I&apos;ve been leaning hard into designing with AI tools instead of around them, so much so that this portfolio itself was built with Google Antigravity and Claude Code in about two days.
              </p>
              <p>
                Before that it was Mirepa Capital, where I built the frontend for four of their websites to help position them better as an investment unit, and earlier on there was Allex, where I was solo designer for their mobile and web platforms.
              </p>
              <p>
                And under all of it is 8 years in digital art, since I was 15, so if some of this looks a little illustrated, that&apos;s still me, still a working artist.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <p className="text-foreground/40 text-base">Things i geek about</p>
              <div className="flex flex-wrap gap-1.5">
                {GEEK_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="border border-foreground/10 hover:border-foreground/25 px-[9px] py-[3px] rounded-full text-sm text-foreground/50 hover:text-foreground/80 transition-all duration-200 select-none cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Col 3: Connect (top) + Spotify (bottom-right) ── */}
          <div className="flex flex-col justify-between px-8 md:px-10 py-6 md:py-8 overflow-y-auto scrollbar-hide">
            {/* Connect */}
            <div className="flex flex-col gap-3">
              <p className="text-foreground/40 text-base">Connect</p>
              <div className="flex flex-col gap-0.5">
                {CONNECT_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-foreground/50 hover:text-foreground text-lg py-0.5 transition-colors duration-150 w-fit"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Spotify — fixed size, bottom-right */}
            <div className="flex justify-end">
              <div className="flex flex-col gap-2">
                <p className="text-foreground/40 text-sm">Blasting my ears with:</p>
                <div className="group relative w-[130px] h-[130px] rounded-xl overflow-hidden bg-foreground/5 cursor-pointer shadow-sm transition-all duration-500 hover:shadow-md">
                  <Image
                    src="/spotify-album-art.png"
                    alt="Album art — Margot by Hotel Fiction"
                    fill
                    sizes="130px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-[#1DB954] flex items-center justify-center text-white shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                      <Play size={14} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground font-medium text-lg leading-snug">Margot</span>
                  <span className="text-foreground/40 text-base leading-normal">Hotel Fiction</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { X, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import type { InfoSheetContent } from "@/lib/types";

interface InfoSheetProps {
  content: InfoSheetContent;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function InfoSheet({ content, isOpen, onClose }: InfoSheetProps) {
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

  interface TrackInfo {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    url: string;
    nowPlaying: boolean;
  }

  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [trackLoading, setTrackLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setTrackLoading(true);

    const fetchLastTrack = async () => {
      try {
        // Last.fm is proxied through our API route so the key stays server-side
        const res = await fetch("/api/now-playing");
        const data = await res.json();
        const latestTrack = data?.track;

        if (latestTrack) {
          const name = latestTrack.name;
          const artist = latestTrack.artist || "";
          const album = latestTrack.album || "";

          let albumArt = "/spotify-album-art.png";
          if (latestTrack.albumArt && latestTrack.albumArt.trim() !== "") {
            albumArt = latestTrack.albumArt;
          } else {
            // Last.fm has no art - try to fetch from YouTube (with 3-hour client-side caching)
            const cacheKey = `yt_thumb_${encodeURIComponent(name)}_${encodeURIComponent(artist)}`;
            const cached = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
            const now = Date.now();
            
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                // Check if cache is still valid (3 hours = 10,800,000 ms)
                if (now - parsed.timestamp < 10800000 && parsed.thumbnail) {
                  albumArt = parsed.thumbnail;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
            
            // If not resolved from cache, fetch it from our serverless route
            if (albumArt === "/spotify-album-art.png") {
              try {
                const ytRes = await fetch(
                  `/api/youtube-thumbnail?track=${encodeURIComponent(name)}&artist=${encodeURIComponent(artist)}`
                );
                const ytData = await ytRes.json();
                if (ytData.thumbnailUrl) {
                  albumArt = ytData.thumbnailUrl;
                  if (typeof window !== "undefined") {
                    localStorage.setItem(
                      cacheKey,
                      JSON.stringify({ thumbnail: albumArt, timestamp: now })
                    );
                  }
                }
              } catch (err) {
                console.error("Failed to fetch YouTube thumbnail:", err);
              }
            }
          }

          const url = latestTrack.url || "";
          const nowPlaying = Boolean(latestTrack.nowPlaying);

          setTrack({
            name,
            artist,
            album,
            albumArt,
            url,
            nowPlaying
          });
        }
      } catch (err) {
        console.error("Failed to fetch track from Last.fm:", err);
      } finally {
        setTrackLoading(false);
      }
    };

    fetchLastTrack();
    const interval = setInterval(fetchLastTrack, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

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
            onPointerDown={onClose}
            onTouchStart={(e) => {
              e.preventDefault();
              onClose();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="fixed inset-0 z-[940] bg-black/40 backdrop-blur-xs cursor-pointer pointer-events-auto w-full h-full touch-none"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet — full width, 84dvh tall */}
      <motion.div
        key="info-panel"
        variants={panelVariants}
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.02, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 300) {
            onClose();
          }
        }}
        className="fixed bottom-0 left-0 right-0 z-[950] w-full h-[84dvh] bg-background rounded-t-[24px] shadow-2xl overflow-hidden text-base touch-pan-y"
        style={{ willChange: "transform" }}
        aria-hidden={!isOpen}
        aria-label="Info panel"
      >
        {/* Drag handle bar for mobile bottom sheet indicator */}
        <div 
          onClick={onClose}
          className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none group touch-none"
          aria-label="Close bottom sheet"
        >
          <div className="w-12 h-1.5 rounded-full bg-foreground/25 group-hover:bg-foreground/40 transition-colors" />
        </div>

        {/* Close button — absolute top right (desktop only) */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute right-6 top-6 md:right-8 md:top-8 w-8 h-8 rounded-full items-center justify-center bg-foreground/5 hover:bg-foreground/10 text-foreground/40 hover:text-foreground transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 z-10"
          aria-label="Close Info"
        >
          <X size={14} />
        </button>

        {/* Single scroll area for all content with fade-out edges */}
        <div 
          className="h-full overflow-y-auto px-5 sm:px-8 md:px-10 py-6 sm:py-8 md:py-10"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 40px), transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40px, black calc(100% - 40px), transparent)',
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-start max-w-[1200px] mx-auto pb-10">

            {/* ── Col 1: Info ── */}
            <div className="flex flex-col gap-4 md:gap-6">
              <p className="text-foreground/40 text-xs sm:text-sm">Info</p>
              <div className="flex flex-col gap-4 text-foreground/70 text-sm sm:text-base leading-relaxed">
                {content.info.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* ── Col 2: Experience ── */}
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-4">
                <p className="text-foreground/40 text-xs sm:text-sm">Experience</p>
                <div className="flex flex-col gap-4 text-foreground/70 text-sm sm:text-base leading-relaxed">
                  {content.experience.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-foreground/40 text-xs sm:text-sm">Things i geek about</p>
                <div className="flex flex-wrap gap-1.5">
                  {content.geekTags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-foreground/10 hover:border-foreground/25 px-[9px] py-[3px] rounded-full text-xs sm:text-sm text-foreground/50 hover:text-foreground/80 transition-all duration-200 select-none cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Col 3: Connect + Spotify ── */}
            <div className="flex flex-col gap-10 md:gap-12 justify-between">
              {/* Connect */}
              <div className="flex flex-col gap-4">
                <p className="text-foreground/40 text-xs sm:text-sm">Connect</p>
                <div className="flex flex-col gap-0.5">
                  {content.connectLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target={link.url.startsWith("http") ? "_blank" : undefined}
                      rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-foreground/50 hover:text-foreground text-sm sm:text-base py-0.5 transition-colors duration-150 w-fit"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Spotify/Last.fm scrobbler — fixed size, bottom-right */}
              <div className="flex justify-end w-full">
                <div className="flex flex-col items-end gap-2 text-right">
                  <p className="text-foreground/40 text-xs select-none text-right">
                    {trackLoading ? "\u00a0" : track?.nowPlaying ? "Blasting my ears with:" : "Recently listened to:"}
                  </p>
                  {/* Album art */}
                  {trackLoading ? (
                    <div className="w-[128px] h-[128px] rounded-xl bg-foreground/8 animate-pulse" />
                  ) : (
                    <a
                      href={track?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="relative w-[128px] h-[128px] rounded-xl overflow-hidden bg-foreground/5 cursor-pointer shadow-sm transition-all duration-500 hover:shadow-md">
                        <Image
                          src={track?.albumArt ?? "/spotify-album-art.png"}
                          alt={`Album art — ${track?.name} by ${track?.artist}`}
                          fill
                          sizes="128px"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-[#1DB954] flex items-center justify-center text-white shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Play size={14} fill="currentColor" className="ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </a>
                  )}
                  {/* Track info */}
                  <div className="flex flex-col gap-0.5 max-w-[128px] overflow-hidden">
                    {trackLoading ? (
                      <>
                        <div className="h-4 w-24 rounded bg-foreground/8 animate-pulse mb-1" />
                        <div className="h-3 w-16 rounded bg-foreground/5 animate-pulse" />
                      </>
                    ) : (
                      <>
                        <a
                          href={track?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground font-medium text-base leading-snug hover:underline block w-full overflow-hidden"
                          title={track?.name}
                        >
                          {(track?.name?.length ?? 0) > 15 ? (
                            <div className="overflow-hidden whitespace-nowrap w-full relative">
                              <div
                                className="inline-flex animate-marquee-text"
                                style={{ animationDuration: `${Math.max((track?.name?.length ?? 0) * 0.35, 6)}s` }}
                              >
                                <span className="pr-6">{track?.name}</span>
                                <span className="pr-6">{track?.name}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="truncate">{track?.name}</div>
                          )}
                        </a>
                        <div className="flex items-center justify-between gap-1.5">
                          <span
                            className="text-foreground/40 text-sm leading-normal truncate flex-1"
                            title={track?.artist}
                          >
                            {track?.artist}
                          </span>
                          {track?.nowPlaying && (
                            <div className="flex items-end gap-[2px] h-3 flex-shrink-0 mb-0.5" aria-hidden="true">
                              <div className="w-[2px] bg-foreground/40 rounded-full animate-wave-1 origin-bottom" />
                              <div className="w-[2px] bg-foreground/40 rounded-full animate-wave-2 origin-bottom" />
                              <div className="w-[2px] bg-foreground/40 rounded-full animate-wave-3 origin-bottom" />
                              <div className="w-[2px] bg-foreground/40 rounded-full animate-wave-4 origin-bottom" />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
          {content.lastUpdated && (
            <div className="max-w-[1200px] mx-auto mt-10 border-t border-foreground/5 pt-4 pb-12">
              <p className="text-foreground/25 text-xs sm:text-sm text-left md:text-right">Last updated: {content.lastUpdated}</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

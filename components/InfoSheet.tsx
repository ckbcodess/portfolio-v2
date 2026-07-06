"use client";

import React, { useEffect, useState } from "react";
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
  {
    label: "Mail",
    href: "mailto:rnsfordgyasi@gmail.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    rotation: "-rotate-[15deg]",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ransford-gyasi/",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
    rotation: "-rotate-[30deg]",
  },
  {
    label: "Github",
    href: "https://github.com/ckbcodess",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
      </svg>
    ),
    rotation: "-rotate-[30deg]",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ckb.didit/?hl=en",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
    rotation: "-rotate-[30deg]",
  },
  {
    label: "Twitter [X]",
    href: "https://x.com/ckbdidit?lang=en",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    rotation: "-rotate-[24deg]",
  },
  {
    label: "Artstation",
    href: "https://www.artstation.com/ckbdidit",
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.935-.388-1.314L15.728 2.728a2.424 2.424 0 0 0-2.164-1.333H9.419L21.598 22.54l1.92-3.325c.378-.637.482-.919.482-1.467zM10.94 9.729L15.272 17H6.607l4.333-7.271z"/>
      </svg>
    ),
    rotation: "-rotate-[20deg]",
  },
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

  interface TrackInfo {
    name: string;
    artist: string;
    album: string;
    albumArt: string;
    url: string;
    nowPlaying: boolean;
  }

  const [track, setTrack] = useState<TrackInfo>({
    name: "Margot",
    artist: "Hotel Fiction",
    album: "Margot",
    albumArt: "/spotify-album-art.png",
    url: "https://www.last.fm/music/Hotel+Fiction/_/Margot",
    nowPlaying: false
  });

  useEffect(() => {
    if (!isOpen) return;

    const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY || "f8423408e5019132bc7e3b7d4d8fbb60";
    const username = process.env.NEXT_PUBLIC_LASTFM_USERNAME || "ckbdidit";

    if (!apiKey || !username) return;

    const fetchLastTrack = async () => {
      try {
        const res = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`
        );
        const data = await res.json();
        const latestTrack = data?.recenttracks?.track?.[0];
        
        if (latestTrack) {
          const name = latestTrack.name;
          const artist = latestTrack.artist?.["#text"] || "";
          const album = latestTrack.album?.["#text"] || "";
          
          let albumArt = "/spotify-album-art.png";
          const images = latestTrack.image || [];
          const xlImage = images.find((img: any) => img.size === "extralarge")?.["#text"] || 
                          images.find((img: any) => img.size === "large")?.["#text"] ||
                          images[0]?.["#text"];
                          
          if (xlImage && xlImage.trim() !== "") {
            albumArt = xlImage;
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
          const nowPlaying = latestTrack["@attr"]?.nowplaying === "true";

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
              <div className="flex flex-col gap-2">
                {CONNECT_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="group relative flex items-end overflow-hidden rounded-2xl bg-foreground/5 hover:bg-[#1d1d1d] dark:hover:bg-[#1d1d1d] light:hover:bg-[#222] px-6 py-4 transition-colors duration-300 w-full"
                  >
                    <span className="font-semibold text-base text-foreground/60 group-hover:text-white transition-colors duration-300 tracking-tight z-10 relative">
                      {link.label}
                    </span>
                    {/* Floating brand icon — rotated, clipped to top-right on hover */}
                    <div
                      className={`absolute right-[-6px] top-[-6px] w-[52px] h-[52px] text-foreground/10 group-hover:text-white/20 transition-all duration-300 ${link.rotation} opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0`}
                    >
                      {link.icon}
                    </div>
                  </a>
                ))}
              </div>
            </div>

             {/* Spotify/Last.fm scrobbler — fixed size, bottom-right */}
             <div className="flex justify-end">
               <div className="flex flex-col gap-2">
                 <p className="text-foreground/40 text-xs select-none">
                   {track.nowPlaying ? "Blasting my ears with:" : "Recently listened to:"}
                 </p>
                 <a 
                   href={track.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="group block"
                 >
                    <div className="relative w-[128px] h-[128px] rounded-xl overflow-hidden bg-foreground/5 cursor-pointer shadow-sm transition-all duration-500 hover:shadow-md">
                      <Image
                        src={track.albumArt}
                        alt={`Album art — ${track.name} by ${track.artist}`}
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
                  <div className="flex flex-col gap-0.5 max-w-[128px] overflow-hidden">
                    <a 
                      href={track.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-foreground font-medium text-base leading-snug hover:underline block w-full overflow-hidden"
                      title={track.name}
                    >
                      {track.name.length > 15 ? (
                        <div className="overflow-hidden whitespace-nowrap w-full relative">
                          <div 
                            className="inline-flex animate-marquee-text"
                            style={{ animationDuration: `${Math.max(track.name.length * 0.35, 6)}s` }}
                          >
                            <span className="pr-6">{track.name}</span>
                            <span className="pr-6">{track.name}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="truncate">
                          {track.name}
                        </div>
                      )}
                    </a>
                   <div className="flex items-center justify-between gap-1.5">
                     <span 
                       className="text-foreground/40 text-sm leading-normal truncate flex-1"
                       title={track.artist}
                     >
                       {track.artist}
                     </span>
                     {track.nowPlaying && (
                       <div className="flex items-end gap-[2px] h-3 flex-shrink-0 mb-0.5" aria-hidden="true">
                         <div className="w-[2px] bg-foreground/40 rounded-full animate-wave-1 origin-bottom" />
                         <div className="w-[2px] bg-foreground/40 rounded-full animate-wave-2 origin-bottom" />
                         <div className="w-[2px] bg-foreground/40 rounded-full animate-wave-3 origin-bottom" />
                         <div className="w-[2px] bg-foreground/40 rounded-full animate-wave-4 origin-bottom" />
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}

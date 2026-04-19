"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { GradientWaveText } from "./gradient-wave-text";

interface Track {
  name: string;
  artist: string;
  album: string;
  image: string;
  isPlaying: boolean;
  url: string;
}

export default function MusicWidget() {
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Note: These should ideally be in .env but I'm placing them here 
  // with placeholders for you to fill.
  const API_KEY = process.env.NEXT_PUBLIC_LASTFM_API_KEY || "YOUR_LASTFM_API_KEY";
  const USERNAME = process.env.NEXT_PUBLIC_LASTFM_USERNAME || "YOUR_LASTFM_USERNAME";

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        if (API_KEY === "YOUR_LASTFM_API_KEY") return;
        
        // Add timestamp to bypass any caching
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=1&_=${Date.now()}`,
          { cache: "no-store", next: { revalidate: 0 } }
        );
        const data = await response.json();
        if (!data?.recenttracks?.track?.[0]) {
          setTrack(null);
          return;
        }
        const recentTrack = data.recenttracks.track[0];
        
        if (recentTrack) {
          setTrack({
            name: recentTrack.name || "Unknown Track",
            artist: recentTrack.artist?.["#text"] || "Unknown Artist",
            album: recentTrack.album?.["#text"] || "",
            image: recentTrack.image?.[2]?.["#text"] || "", // Small/Medium image
            isPlaying: recentTrack["@attr"]?.nowplaying === "true",
            url: recentTrack.url
          });
        }
      } catch (error) {
        console.error("Error fetching music status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
    const interval = setInterval(fetchTrack, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, [API_KEY, USERNAME]);

  if (loading || !track || API_KEY === "YOUR_LASTFM_API_KEY") {
    return (
        <div 
            role="status"
            aria-label="Last.fm music status: Not Listening"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-transparent pointer-events-auto"
        >
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <span className="text-[0.7rem] font-medium text-muted-foreground whitespace-nowrap">Not Listening</span>
        </div>
    );
  }

  return (
    <motion.a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Listening to ${track.name} by ${track.artist} on Last.fm`}
      title={`Listening to ${track.name} by ${track.artist}`}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-transparent pointer-events-auto group transition-opacity duration-300 hover:opacity-70"
    >
      {/* Waveform Icon */}
      <div className="relative w-5 h-5 flex shrink-0 items-center justify-center">
        <div className="flex items-end gap-[2px] w-[14px] h-[12px]">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={
                track.isPlaying 
                  ? { height: ["20%", "100%", "30%", "80%", "20%"] } 
                  : { height: ["40%", "20%", "30%"][i] || "20%" }
              }
              transition={{ 
                duration: track.isPlaying ? 0.7 + i * 0.15 : 0, 
                repeat: track.isPlaying ? Infinity : 0, 
                ease: "easeInOut" 
              }}
              className="w-[2.5px] bg-foreground rounded-full"
            />
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes custom-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      
      <div className="flex flex-col min-w-0 max-w-[130px] md:max-w-[160px] justify-center">
        <div 
            className="relative overflow-hidden w-full flex"
            style={{ 
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
                maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
            }}
        >
            <div className="flex w-max whitespace-nowrap animate-[custom-marquee_12s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform">
                <span className="text-[0.75rem] font-medium text-foreground tracking-tight px-4">
                    <GradientWaveText paused={!isHovered} speed={1.5} repeat className="h-auto">
                      {track.name}
                    </GradientWaveText>
                </span>
                <span className="text-[0.75rem] font-medium text-foreground tracking-tight px-4">
                    <GradientWaveText paused={!isHovered} speed={1.5} repeat className="h-auto">
                      {track.name}
                    </GradientWaveText>
                </span>
            </div>
        </div>
        <div className="text-[0.65rem] text-muted-foreground truncate leading-none mt-0.5">
          {track.artist}
        </div>
      </div>
    </motion.a>
  );
}

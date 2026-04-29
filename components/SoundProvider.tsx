"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface SoundContextType {
  isSoundEnabled: boolean;
  isSuppressClick: boolean;
  toggleSound: () => void;
  playClick: () => void;
  setIsSuppressClick: (suppress: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const CLICK_SOUNDS = [
  "/sounds/click-1.wav",
  "/sounds/click-2.wav",
  "/sounds/click-3.wav",
  "/sounds/click-4.wav",
];

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabledState] = useState(true);
  const [isSuppressClick, setIsSuppressClickState] = useState(false);
  const isSoundEnabledRef = React.useRef(true);
  const isSuppressClickRef = React.useRef(false);
  // Lazily instantiated Audio pool — one per file, reused across clicks
  const audioPoolRef = React.useRef<HTMLAudioElement[] | null>(null);
  // Track the last index used so we can guarantee variation
  const lastIndexRef = React.useRef<number>(-1);

  useEffect(() => {
    const saved = localStorage.getItem("sound-enabled");
    const initialValue = saved !== null ? saved === "true" : true;
    setTimeout(() => setIsSoundEnabledState(initialValue), 0);
    isSoundEnabledRef.current = initialValue;
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabledState((prev) => {
      const next = !prev;
      isSoundEnabledRef.current = next;
      localStorage.setItem("sound-enabled", String(next));
      return next;
    });
  }, []);

  const setIsSuppressClick = useCallback((suppress: boolean) => {
    setIsSuppressClickState(suppress);
    isSuppressClickRef.current = suppress;
  }, []);

  const playClick = useCallback(() => {
    if (!isSoundEnabledRef.current || isSuppressClickRef.current) return;

    // Build the pool once (lazy — satisfies browser autoplay policy)
    if (!audioPoolRef.current) {
      audioPoolRef.current = CLICK_SOUNDS.map((src) => {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = 1;
        return audio;
      });
    }

    const pool = audioPoolRef.current;
    const count = pool.length;

    // Pick a random index different from the last one for guaranteed variety
    let idx: number;
    do {
      idx = Math.floor(Math.random() * count);
    } while (count > 1 && idx === lastIndexRef.current);
    lastIndexRef.current = idx;

    const audio = pool[idx];
    // Rewind so rapid clicks always fire from the start
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Ignore autoplay errors (e.g. before first user interaction)
    });
  }, []);

  return (
    <SoundContext.Provider value={{ isSoundEnabled, isSuppressClick, toggleSound, playClick, setIsSuppressClick }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}

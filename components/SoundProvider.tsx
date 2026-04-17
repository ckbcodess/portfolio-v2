"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabledState] = useState(true);
  const isSoundEnabledRef = React.useRef(true);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sound-enabled");
    const initialValue = saved !== null ? saved === "true" : true;
    setIsSoundEnabledState(initialValue);
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

  const playClick = useCallback(() => {
    if (!isSoundEnabledRef.current) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // 1. The high "pop" (Main body)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(0.01, now + 0.12);

    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // 2. The sharp "click" (Initial transient)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1600, now);
    osc2.frequency.exponentialRampToValueAtTime(0.01, now + 0.05);

    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.12);
    osc2.start(now);
    osc2.stop(now + 0.05);
  }, []);

  return (
    <SoundContext.Provider value={{ isSoundEnabled, toggleSound, playClick }}>
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

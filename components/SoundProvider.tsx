"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// ── Audio sprite definitions [startMs, durationMs] ──────────────────────
// Sourced from the CherryMX Black config.json — each entry is a different
// key sound that we repurpose as click variation.  We split every sample
// in half: the first half is the "press" (down) portion, the tail is the
// "release" (up) thock.

const SPRITE_POOL: [number, number][] = [
  [2894, 226],   // key 1
  [12946, 191],  // key 2
  [13470, 190],  // key 3
  [13963, 199],  // key 4
  [14481, 204],  // key 5
  [14994, 187],  // key 6
  [15505, 217],  // key 7
  [15990, 193],  // key 8
  [16529, 184],  // key 9
  [17012, 205],  // key 10
  [17550, 174],  // key 11
  [18052, 186],  // key 12
  [22245, 190],  // key 16
  [22790, 177],  // key 17
  [23317, 166],  // key 18
  [23817, 184],  // key 19
  [24297, 183],  // key 20
  [24811, 186],  // key 21
  [25313, 189],  // key 22
  [31542, 170],  // key 30
  [32031, 175],  // key 31
  [32492, 169],  // key 32
  [32973, 174],  // key 33
  [33453, 188],  // key 34
  [33986, 185],  // key 35
  [34425, 176],  // key 36
  [34932, 180],  // key 37
  [35410, 190],  // key 38
  [35914, 189],  // key 39
  [36428, 173],  // key 40
  [38694, 160],  // key 44
  [39148, 151],  // key 45
  [39632, 190],  // key 46
  [40136, 188],  // key 47
  [40621, 214],  // key 48
  [41103, 180],  // key 49
  [41610, 186],  // key 50
  [42110, 183],  // key 51
  [42594, 180],  // key 52
  [43105, 190],  // key 53
];

/**
 * For each full sample [startMs, durationMs] we derive:
 *  - DOWN (press)   → first ~55% of the sample duration
 *  - UP   (release) → last ~55% of the sample, overlapping slightly for
 *                      a seamless mechanical feel
 */
function deriveDown(sprite: [number, number]): [number, number] {
  const [startMs, durationMs] = sprite;
  const halfDur = Math.round(durationMs * 0.55);
  return [startMs, halfDur];
}

function deriveUp(sprite: [number, number]): [number, number] {
  const [startMs, durationMs] = sprite;
  const offset = Math.round(durationMs * 0.45);
  return [startMs + offset, durationMs - offset];
}

// ── Context types ────────────────────────────────────────────────────────

interface SoundContextType {
  isSoundEnabled: boolean;
  isSuppressClick: boolean;
  toggleSound: () => void;
  playClickDown: () => void;
  playClickUp: () => void;
  /** @deprecated — kept for backward compat; fires the "down" portion */
  playClick: () => void;
  setIsSuppressClick: (suppress: boolean) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabledState] = useState(true);
  const [isSuppressClick, setIsSuppressClickState] = useState(false);
  const isSoundEnabledRef = useRef(true);
  const isSuppressClickRef = useRef(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const [soundLoaded, setSoundLoaded] = useState(false);

  // Track last picked index for guaranteed variation
  const lastIndexRef = useRef(-1);
  // Store which sprite was picked on mousedown so mouseup plays the same one
  const activeSprite = useRef<[number, number] | null>(null);

  // ── Persist preference ──────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("sound-enabled");
    const initialValue = saved !== null ? saved === "true" : true;
    setTimeout(() => setIsSoundEnabledState(initialValue), 0);
    isSoundEnabledRef.current = initialValue;
  }, []);

  // ── Load audio sprite ───────────────────────────────────────────────
  useEffect(() => {
    let disposed = false;

    const initAudio = async () => {
      try {
        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        const response = await fetch("/sounds/sound.ogg");
        if (!response.ok) {
          console.warn("Sound sprite not available");
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        if (!disposed) {
          audioBufferRef.current = decoded;
          setSoundLoaded(true);
        }
      } catch (error) {
        console.warn("Failed to load sound sprite:", error);
      }
    };

    initAudio();

    return () => {
      disposed = true;
      audioContextRef.current?.close();
    };
  }, []);

  // ── Core sprite playback ────────────────────────────────────────────
  const playSprite = useCallback(
    (startMs: number, durationMs: number) => {
      const ctx = audioContextRef.current;
      const buffer = audioBufferRef.current;
      if (!ctx || !buffer) return;

      // Resume if suspended (browser autoplay policy)
      if (ctx.state === "suspended") ctx.resume();

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Optional: slight gain reduction so it's not jarring
      const gain = ctx.createGain();
      gain.gain.value = 0.8;
      source.connect(gain);
      gain.connect(ctx.destination);

      source.start(0, startMs / 1000, durationMs / 1000);
    },
    [],
  );

  // ── Pick a random sprite (different from the last) ──────────────────
  const pickSprite = useCallback((): [number, number] => {
    const count = SPRITE_POOL.length;
    let idx: number;
    do {
      idx = Math.floor(Math.random() * count);
    } while (count > 1 && idx === lastIndexRef.current);
    lastIndexRef.current = idx;
    return SPRITE_POOL[idx];
  }, []);

  // ── Public API ──────────────────────────────────────────────────────
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

  const playClickDown = useCallback(() => {
    if (!isSoundEnabledRef.current || isSuppressClickRef.current) return;
    if (!soundLoaded) return;

    const sprite = pickSprite();
    activeSprite.current = sprite;

    const [startMs, durationMs] = deriveDown(sprite);
    playSprite(startMs, durationMs);
  }, [soundLoaded, pickSprite, playSprite]);

  const playClickUp = useCallback(() => {
    if (!isSoundEnabledRef.current || isSuppressClickRef.current) return;
    if (!soundLoaded) return;

    // Use the same sprite that was picked during mousedown
    const sprite = activeSprite.current;
    if (!sprite) return;

    const [startMs, durationMs] = deriveUp(sprite);
    playSprite(startMs, durationMs);
    activeSprite.current = null;
  }, [soundLoaded, playSprite]);

  // Backward-compat shim
  const playClick = playClickDown;

  return (
    <SoundContext.Provider
      value={{
        isSoundEnabled,
        isSuppressClick,
        toggleSound,
        playClickDown,
        playClickUp,
        playClick,
        setIsSuppressClick,
      }}
    >
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

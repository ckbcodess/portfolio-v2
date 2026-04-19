"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import Image from "next/image";
import { useSound } from "@/components/SoundProvider";

interface Balloon {
  id: number;
  x: number;
  y: number;
  image: string;
  glow: string;
  size: number;
  duration: number;
  sway: number;
  angle: number; // launch angle from preview
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
}

// Sophisticated palette — translucent to feel airy
const BALLOON_ASSETS = [
  { image: "/images/balloons/red.png", glow: "rgba(255, 107, 107, 0.3)" },
  { image: "/images/balloons/blue.png", glow: "rgba(78, 205, 196, 0.3)" }, // blue/cyan
  { image: "/images/balloons/green.png", glow: "rgba(100, 220, 140, 0.3)" },
  { image: "/images/balloons/purple.png", glow: "rgba(130, 120, 255, 0.3)" },
];

const POP_SOUNDS = ["/sounds/pop-1.wav", "/sounds/pop-2.wav", "/sounds/pop-3.wav"];

interface BalloonGameProps {
  isActive: boolean;
  onClose: () => void;
}

export default function BalloonGame({ isActive, onClose }: BalloonGameProps) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popAudioPool = useRef<HTMLAudioElement[] | null>(null);
  const lastPopIndex = useRef(-1);
  const idCounter = useRef(0);
  const { setIsSuppressClick } = useSound();

  // Lazily init the pop sound pool
  const playPopSound = useCallback(() => {
    if (!popAudioPool.current) {
      popAudioPool.current = POP_SOUNDS.map((src) => {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = 0.35; // satisfying but not jarring
        return audio;
      });
    }
    const pool = popAudioPool.current;
    let idx: number;
    do {
      idx = Math.floor(Math.random() * pool.length);
    } while (pool.length > 1 && idx === lastPopIndex.current);
    lastPopIndex.current = idx;

    const audio = pool[idx];
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  // Get the preview element's bounding rect as the spawn origin
  const getSpawnOrigin = useCallback(() => {
    // The preview card position — matches the portal: fixed, right-[120px], bottom pb-12, w-600 h-338
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Preview card rect approximation
    const previewRight = 120;
    const previewWidth = 600;
    const previewHeight = 338;
    const previewBottom = 48; // pb-12 = 48px

    const cardLeft = w - previewRight - previewWidth;
    const cardTop = h - previewBottom - previewHeight;

    return {
      centerX: cardLeft + previewWidth / 2,
      centerY: cardTop + previewHeight / 2,
      left: cardLeft,
      top: cardTop,
      width: previewWidth,
      height: previewHeight,
    };
  }, []);

  const spawnBalloon = useCallback(() => {
    idCounter.current += 1;
    const asset = BALLOON_ASSETS[Math.floor(Math.random() * BALLOON_ASSETS.length)];
    const size = 64 + Math.random() * 32; // slightly larger for detail
    const duration = 5 + Math.random() * 4;
    const sway = 30 + Math.random() * 60;

    // Spawn from somewhere within the preview card area
    const origin = getSpawnOrigin();
    const startX = origin.left + Math.random() * origin.width;
    const startY = origin.top + Math.random() * (origin.height * 0.5);

    // Launch angle: mostly upward with some spread
    const angle = -60 - Math.random() * 60; // -60° to -120° (upward fan)

    setBalloons((prev) => [
      ...prev.slice(-18),
      {
        id: idCounter.current,
        x: startX,
        y: startY,
        image: asset.image,
        glow: asset.glow,
        size,
        duration,
        sway,
        angle,
      },
    ]);
  }, [getSpawnOrigin]);

  useEffect(() => {
    if (!isActive) {
      const timeout = setTimeout(() => {
        setBalloons([]);
        setParticles([]);
        setScore(0);
        setCombo(0);
      }, 600);
      return () => clearTimeout(timeout);
    }

    // Suppress default click sound while playing
    setIsSuppressClick(true);

    const interval = setInterval(spawnBalloon, 900);
    // Initial burst
    setTimeout(() => spawnBalloon(), 100);
    setTimeout(() => spawnBalloon(), 350);
    setTimeout(() => spawnBalloon(), 600);
    setTimeout(() => spawnBalloon(), 850);

    return () => {
      clearInterval(interval);
      setIsSuppressClick(false);
    };
  }, [isActive, spawnBalloon, setIsSuppressClick]);

  // Keyboard escape to close
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive, onClose]);

  const popBalloon = useCallback(
    (id: number, clientX: number, clientY: number, color: string) => {
      playPopSound();

      setBalloons((prev) => prev.filter((b) => b.id !== id));

      // Burst particles
      const count = 8 + Math.floor(Math.random() * 4);
      const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
        id: Date.now() * 1000 + i,
        x: clientX,
        y: clientY,
        color,
        angle: (360 / count) * i + Math.random() * 20,
        distance: 25 + Math.random() * 45,
        size: 2.5 + Math.random() * 3.5,
      }));
      setParticles((prev) => [...prev.slice(-50), ...newParticles]);
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.find((np) => np.id === p.id))
        );
      }, 600);

      setScore((s) => s + 1);
      setCombo((c) => c + 1);
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => setCombo(0), 1500);
    },
    [playPopSound]
  );

  // removed immediate return to allow AnimatePresence to handle exit
  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop — subtle focus shift */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[39] bg-background/40 dark:bg-background/60 backdrop-blur-[3px] pointer-events-none"
          />

          {/* Close button — top-right, always accessible */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            className="fixed top-8 right-8 md:top-12 md:right-12 lg:right-[120px] z-[43] w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer group"
            aria-label="Close Play Mode"
          >
            <X size={16} className="text-foreground/60 group-hover:text-foreground transition-colors" />
          </motion.button>

          {/* Score HUD */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[42] pointer-events-none select-none"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-baseline gap-2">
                <motion.span
                  key={score}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-foreground text-5xl font-light font-sans tabular-nums"
                >
                  {score}
                </motion.span>
              </div>
              <span className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-medium">
                popped
              </span>
              <AnimatePresence>
                {combo > 2 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-primary text-[11px] uppercase tracking-widest font-semibold mt-1"
                  >
                    {combo}× combo!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Hint text — fades out after a few seconds */}
          <HintText />

          {/* Balloons layer — scales down on game exit */}
          <motion.div 
            exit={{ 
              scale: 0.8, 
              opacity: 0,
              filter: "blur(10px)",
              transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
            }}
            className="fixed inset-0 pointer-events-none z-[40] overflow-hidden"
          >
            <AnimatePresence>
              {balloons.map((balloon) => {
                const travelDistance = window.innerHeight * 0.9;
                const endX = balloon.x + Math.cos((balloon.angle * Math.PI) / 180) * travelDistance * 0.4;
                const endY = -balloon.size * 2;

                return (
                  <motion.div
                    key={balloon.id}
                    initial={{
                      x: balloon.x,
                      y: balloon.y,
                      opacity: 0,
                      scale: 0.3,
                    }}
                    animate={{
                      x: [balloon.x, balloon.x + balloon.sway * 0.5, endX - balloon.sway * 0.3, endX],
                      y: [balloon.y, balloon.y - travelDistance * 0.3, balloon.y - travelDistance * 0.6, endY],
                      opacity: [0, 1, 1, 0.6],
                      scale: [0.3, 1, 1, 0.9],
                    }}
                    exit={{
                      scale: [1, 1.4, 0],
                      opacity: [1, 0.6, 0],
                      transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
                    }}
                    transition={{
                      duration: balloon.duration,
                      ease: "easeOut",
                      times: [0, 0.15, 0.6, 1],
                    }}
                    onAnimationComplete={() => {
                      setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));
                    }}
                    className="absolute pointer-events-auto cursor-pointer"
                    style={{
                      width: balloon.size,
                      height: balloon.size * 1.25,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      popBalloon(balloon.id, e.clientX, e.clientY, balloon.glow);
                    }}
                  >
                    {/* Soft glow */}
                    <div
                      className="absolute inset-[-20%] rounded-full blur-2xl opacity-40"
                      style={{ backgroundColor: balloon.glow }}
                    />

                    {/* 3D Balloon Image — True transparency */}
                    <div
                      className="w-full h-full relative transition-transform duration-150 hover:scale-110 active:scale-95"
                    >
                        <Image 
                            src={balloon.image}
                            alt="Balloon"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          <div className="fixed inset-0 pointer-events-none z-[41] overflow-hidden">
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
                  animate={{
                    x: p.x + Math.cos((p.angle * Math.PI) / 180) * p.distance,
                    y: p.y + Math.sin((p.angle * Math.PI) / 180) * p.distance,
                    opacity: 0,
                    scale: 0.2,
                  }}
                  transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    boxShadow: `0 0 8px ${p.color}`,
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Brief instruction hint that fades after 3 seconds */
function HintText() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[42] text-muted-foreground text-xs font-medium tracking-wide pointer-events-none select-none"
        >
          Click balloons to pop · Press <kbd className="px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/60 text-[10px] font-mono mx-0.5">Esc</kbd> to exit
        </motion.p>
      )}
    </AnimatePresence>
  );
}

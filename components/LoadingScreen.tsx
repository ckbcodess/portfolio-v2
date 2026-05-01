"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const SESSION_KEY = "rg_portfolio_loaded";

const PATHS = {
  hidden:    "M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z",
  curveDown: "M 0 0 Q 50 0 100 0 L 100 0 Q 50 50 0 0 Z",
  end:       "M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z",
};

const CRITICAL_ASSETS = [
  // Core Images
  "/avatar.webp",
  "/allex-card.png",
  "/allex-hero.webp",
  "/gcb-card-v4.png",
  "/cs-img-6.webp",
  // Interface Sounds
  "/sounds/click-1.wav",
  "/sounds/click-2.wav",
  "/sounds/click-3.wav",
  "/sounds/click-4.wav",
  "/sounds/pop-1.wav",
  "/sounds/pop-2.wav",
  "/sounds/pop-3.wav",
];

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function LoadingScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const greetRef = useRef<HTMLDivElement>(null);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      if (overlayRef.current) overlayRef.current.style.display = "none";
      // @ts-expect-error global flag
      globalThis.appLoaded = true;
      window.dispatchEvent(new Event("apps-loaded"));
      return;
    }
    
    sessionStorage.setItem(SESSION_KEY, "1");
    setShouldAnimate(true);

    // Asset Preloading Logic
    let loadedCount = 0;
    const totalCount = CRITICAL_ASSETS.length;

    const updateProgress = () => {
      loadedCount++;
      const currentProgress = Math.round((loadedCount / totalCount) * 100);
      setProgress(currentProgress);
      if (loadedCount === totalCount) {
        setIsAssetsLoaded(true);
      }
    };

    CRITICAL_ASSETS.forEach(src => {
      if (src.endsWith('.wav') || src.endsWith('.ogg') || src.endsWith('.mp3')) {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', updateProgress, { once: true });
        audio.src = src;
        audio.load();
      } else {
        const img = new Image();
        img.onload = updateProgress;
        img.onerror = updateProgress; // Don't block if one image fails
        img.src = src;
      }
    });

    // Fallback in case loading hangs
    const timeout = setTimeout(() => {
        setIsAssetsLoaded(true);
        setProgress(100);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useGSAP(() => {
    if (!shouldAnimate || !isAssetsLoaded) return;

    const overlay = overlayRef.current!;
    const path = pathRef.current!;
    const counter = countRef.current!;
    const greet = greetRef.current!;

    const tl = gsap.timeline({
      delay: 0.2, // Small buffer after assets are ready
      onComplete: () => {
        gsap.set(overlay, { display: "none", pointerEvents: "none" });
        // @ts-expect-error global flag
        globalThis.appLoaded = true;
        window.dispatchEvent(new Event("apps-loaded"));
      }
    });

    // ─── Phase 2: swap count → greeting ────────────────────────────────────
    tl.to(counter, { autoAlpha: 0, y: -20, duration: 0.2, ease: "power2.in" });
    tl.fromTo(
      greet,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }
    );

    // ─── Phase 3: hold & exit ───────────────────────────────────────────────
    tl.to({}, { duration: 0.5 }); 

    tl.set(path, { attr: { d: "M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z" } });
    tl.to(path, {
      duration: 0.4,
      attr: { d: PATHS.curveDown },
      ease: "power3.in",
    });
    tl.to(path, {
      duration: 0.5,
      attr: { d: PATHS.end },
      ease: "power4.out",
    });

  }, [shouldAnimate, isAssetsLoaded]);

  // Update visible counter based on progress state
  useEffect(() => {
    if (countRef.current) {
        countRef.current.textContent = `${progress}%`;
    }
  }, [progress]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center pointer-events-auto"
      style={{ zIndex: 9999999, background: "var(--foreground)" }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          ref={pathRef}
          d="M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z"
          fill="var(--foreground)"
        />
      </svg>

      <span
        ref={countRef}
        className="relative z-10 text-background font-light tabular-nums select-none tracking-tighter"
        style={{ fontSize: "clamp(3rem, 10vw, 7rem)", lineHeight: 1 }}
        aria-live="polite"
      >
        {progress}%
      </span>

      <div
        ref={greetRef}
        className="absolute inset-0 flex items-center justify-center z-10 opacity-0 select-none"
        aria-hidden="true"
      >
        <p
          className="text-background font-light text-center tracking-tight flex items-center gap-4"
          style={{ fontSize: "clamp(2rem, 7vw, 4rem)", lineHeight: 1.1 }}
        >
          hi there
          <span className="inline-block w-2 h-2 rounded-full bg-background opacity-80 mt-2" />
        </p>
      </div>
    </div>
  );
}


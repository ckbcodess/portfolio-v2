"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import RefractiveNav from "./RefractiveNav";

const SESSION_KEY = "rg_portfolio_loaded";

const PATHS = {
  hidden:    "M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z",
  curveDown: "M 0 0 Q 50 0 100 0 L 100 0 Q 50 50 0 0 Z",
  end:       "M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z",
};

// Comprehensive list of critical assets for the "best experience"
const CRITICAL_ASSETS = [
  "/avatar.webp",
  "/allex-hero.webp",
  "/cs-img-6.webp",
  "/gcb-card-v4.png",
  "/noise.svg",
  "/globe.svg",
  "/file.svg",
  "/window.svg"
];

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function LoadingScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const greetRef = useRef<HTMLDivElement>(null);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [counterFinished, setCounterFinished] = useState(false);

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

    // ─── 1. Asset Preloading ────────────────────────────────────────────────
    let loadedCount = 0;
    const totalCount = CRITICAL_ASSETS.length + 2; // +1 for fonts, +1 for sounds

    const onAssetLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalCount) {
        setAssetsLoaded(true);
      }
    };

    // Fonts
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(onAssetLoaded).catch(onAssetLoaded);
    } else {
      onAssetLoaded();
    }

    // Sounds (Synchronization with SoundProvider)
    const checkSounds = () => {
      // @ts-expect-error global flag
      if (window.soundsLoaded) {
        onAssetLoaded();
      } else {
        setTimeout(checkSounds, 100);
      }
    };
    checkSounds();

    // Images & SVG
    CRITICAL_ASSETS.forEach(src => {
      const img = new Image();
      img.onload = onAssetLoaded;
      img.onerror = onAssetLoaded; 
      img.src = src;
    });

    // Fallback for asset loading
    const assetTimeout = setTimeout(() => setAssetsLoaded(true), 6000);

    // ─── 2. Buttery Counter ────────────────────────────────────────────────
    const counterObj = { value: 0 };
    gsap.to(counterObj, {
      value: 100,
      duration: 2.8, // Slightly slower for more "bracing" time
      ease: "power2.inOut",
      onUpdate: () => {
        const val = Math.round(counterObj.value);
        setProgress(val);
      },
      onComplete: () => {
        setCounterFinished(true);
      }
    });

    return () => clearTimeout(assetTimeout);
  }, []);

  useGSAP(() => {
    // Only reveal once BOTH assets are loaded AND counter has reached 100
    if (!shouldAnimate || !assetsLoaded || !counterFinished) return;

    const overlay = overlayRef.current!;
    const path = pathRef.current!;
    const counter = countRef.current!;
    const greet = greetRef.current!;

    const tl = gsap.timeline({
      delay: 0.5, // Hold for a beat to let browser breathe
      onComplete: () => {
        gsap.set(overlay, { display: "none", pointerEvents: "none" });
        // @ts-expect-error global flag
        globalThis.appLoaded = true;
        window.dispatchEvent(new Event("apps-loaded"));
      }
    });

    // Fade out counter and slide in greeting
    tl.to(counter, { autoAlpha: 0, y: -40, duration: 0.4, ease: "power3.in" });
    tl.fromTo(
      greet,
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "power4.out" },
      "-=0.2"
    );

    // Hold greeting
    tl.to({}, { duration: 1.0 }); 

    // Morph path and slide up
    tl.set(path, { attr: { d: "M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z" } });
    tl.to(path, {
      duration: 0.8,
      attr: { d: PATHS.curveDown },
      ease: "power4.in",
    });
    tl.to(path, {
      duration: 0.6,
      attr: { d: PATHS.end },
      ease: "power4.out",
    });

    // Final fade of greeting as path exits
    tl.to(greet, { autoAlpha: 0, y: -20, duration: 0.3 }, "-=0.8");

  }, [shouldAnimate, assetsLoaded, counterFinished]);

  return (
    <>
      {/* Warm-up Container: Renders off-screen to trigger GPU/Shader compilation */}
      <div 
        className="fixed opacity-0 pointer-events-none -z-[9999]" 
        aria-hidden="true"
        style={{ left: '-9999px', top: '-9999px' }}
      >
        <RefractiveNav settings={{ radius: 24, blur: 2 }}>
          <div className="w-10 h-10" />
        </RefractiveNav>
      </div>

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
          {progress}
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
    </>
  );
}


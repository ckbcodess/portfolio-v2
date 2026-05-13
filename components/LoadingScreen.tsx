"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import RefractiveNav from "./RefractiveNav";

const SESSION_KEY = "rg_portfolio_loaded";

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
  const countRef = useRef<HTMLSpanElement>(null);

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
      duration: 2.8, 
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
    const counter = countRef.current!;

    const tl = gsap.timeline({
      delay: 0.3, // Brief hold at 100
      onComplete: () => {
        gsap.set(overlay, { display: "none", pointerEvents: "none" });
        // @ts-expect-error global flag
        globalThis.appLoaded = true;
        window.dispatchEvent(new Event("apps-loaded"));
      }
    });

    // Slide the entire overlay up to reveal the content
    tl.to(overlay, {
      yPercent: -100,
      duration: 1.1,
      ease: "power4.inOut"
    });

    // Fade and slide the counter up slightly faster
    tl.to(counter, { 
      autoAlpha: 0, 
      y: -100, 
      duration: 0.7, 
      ease: "power3.in" 
    }, 0);

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
        className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center pointer-events-auto overflow-hidden transform-gpu"
        style={{ zIndex: 9999999, background: "var(--background)" }}
      >
        <span
          ref={countRef}
          className="relative z-10 text-foreground font-light tabular-nums select-none tracking-tighter"
          style={{ fontSize: "clamp(3rem, 10vw, 7rem)", lineHeight: 1 }}
          aria-live="polite"
        >
          {progress}
        </span>
      </div>
    </>
  );
}


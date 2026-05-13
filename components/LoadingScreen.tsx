"use client";

import { useRef, useState, useLayoutEffect, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import RefractiveNav from "./RefractiveNav";

const SESSION_KEY = "rg_portfolio_loaded";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Comprehensive Asset Manifest ──────────────────────────────────────────────
// Every image, video, and SVG the site uses — preloaded during the progress bar
// so the rest of the experience is buttery smooth.
const PRELOAD_IMAGES = [
  "/avatar.webp",
  "/allex-hero.webp",
  "/cs-img-6.webp",
  "/gcb-card-v4.png",
  "/noise.svg",
  "/globe.svg",
  "/file.svg",
  "/window.svg",
  // Playground carousel
  "/playground/health.png",
  "/playground/slide-7.png",
  "/playground/slide-4.png",
  "/playground/slide-6.png",
  // Case study / landing page assets
  "/cs-img-7.webp",
  "/img-60.webp",
  "/lp-img-5.avif",
  "/lp-img-6.avif",
  "/lp-img-7.avif",
  "/lp-img-8.webp",
];

const PRELOAD_VIDEOS = [
  "/playground/slide-5.mp4",
  "/playground/slide-7-elegant.mp4",
];

export default function LoadingScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [realProgress, setRealProgress] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [barComplete, setBarComplete] = useState(false);

  // ─── Asset Preloading Engine ───────────────────────────────────────────────
  const startPreload = useCallback(() => {
    let loaded = 0;
    // +1 for fonts, +1 for sounds
    const total = PRELOAD_IMAGES.length + PRELOAD_VIDEOS.length + 2;

    const tick = () => {
      loaded++;
      setRealProgress(loaded / total);
      if (loaded >= total) setAssetsReady(true);
    };

    // Fonts
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(tick).catch(tick);
    } else {
      tick();
    }

    // Sounds
    const checkSounds = () => {
      // @ts-expect-error global flag set by SoundProvider
      if (window.soundsLoaded) {
        tick();
      } else {
        setTimeout(checkSounds, 80);
      }
    };
    checkSounds();

    // Images
    PRELOAD_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = tick;
      img.onerror = tick;
      img.src = src;
    });

    // Videos — fetch head to prime browser cache
    PRELOAD_VIDEOS.forEach((src) => {
      const vid = document.createElement("video");
      vid.preload = "auto";
      vid.muted = true;
      vid.playsInline = true;
      vid.oncanplaythrough = tick;
      vid.onerror = () => tick();
      vid.src = src;
      // force load start
      vid.load();
    });

    // Hard ceiling so we never block forever
    const timeout = setTimeout(() => setAssetsReady(true), 8000);
    return () => clearTimeout(timeout);
  }, []);

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
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
    return startPreload();
  }, [startPreload]);

  // ─── Progress Bar Animation ────────────────────────────────────────────────
  // GSAP tweens the bar width to track realProgress with a smooth ease.
  // Once both assets are loaded AND the bar visually reaches 100%, we mark complete.
  useGSAP(() => {
    if (!shouldAnimate || !fillRef.current) return;

    gsap.to(fillRef.current, {
      scaleX: realProgress,
      duration: 0.6,
      ease: "power2.out",
      overwrite: "auto",
      onUpdate() {
        // Check if visually full
        const current = gsap.getProperty(fillRef.current!, "scaleX") as number;
        if (current >= 0.995 && assetsReady) {
          setBarComplete(true);
        }
      },
    });
  }, [realProgress, assetsReady, shouldAnimate]);

  // ─── Exit Animation ───────────────────────────────────────────────────────
  useGSAP(() => {
    if (!shouldAnimate || !barComplete) return;

    const overlay = overlayRef.current!;
    const track = trackRef.current!;

    const tl = gsap.timeline({
      delay: 0.35, // brief hold at 100% so it feels intentional
      onComplete: () => {
        gsap.set(overlay, { display: "none", pointerEvents: "none" });
        // @ts-expect-error global flag
        globalThis.appLoaded = true;
        window.dispatchEvent(new Event("apps-loaded"));
      },
    });

    // Fade out the progress bar track first
    tl.to(track, {
      autoAlpha: 0,
      duration: 0.4,
      ease: "power2.in",
    });

    // Then dissolve the overlay
    tl.to(overlay, {
      autoAlpha: 0,
      duration: 0.7,
      ease: "power3.inOut",
    }, "-=0.15");

  }, [shouldAnimate, barComplete]);

  return (
    <>
      {/* Warm-up Container: Renders off-screen to trigger GPU/Shader compilation */}
      <div
        className="fixed opacity-0 pointer-events-none -z-[9999]"
        aria-hidden="true"
        style={{ left: "-9999px", top: "-9999px" }}
      >
        <RefractiveNav settings={{ radius: 24, blur: 2 }}>
          <div className="w-10 h-10" />
        </RefractiveNav>
      </div>

      {/* Loading Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center pointer-events-auto overflow-hidden transform-gpu"
        style={{ zIndex: 9999999, background: "var(--background)" }}
        role="progressbar"
        aria-valuenow={Math.round(realProgress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Loading portfolio"
      >
        {/* Progress Track — a thin, precise line */}
        <div
          ref={trackRef}
          className="relative"
          style={{ width: "clamp(140px, 22vw, 240px)", height: "2px" }}
        >
          {/* Background track */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "color-mix(in oklch, var(--foreground), transparent 88%)",
            }}
          />
          {/* Active fill */}
          <div
            ref={fillRef}
            className="absolute inset-0 rounded-full origin-left"
            style={{
              background: "var(--foreground)",
              transform: "scaleX(0)",
              willChange: "transform",
            }}
          />
        </div>
      </div>
    </>
  );
}

"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const SESSION_KEY = "rg_portfolio_loaded";

// Same SVG path grammar as TransitionProvider
const PATHS = {
  hidden:    "M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z",
  curveDown: "M 0 0 Q 50 0 100 0 L 100 0 Q 50 50 0 0 Z",
  end:       "M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z",
};

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function LoadingScreen() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const greetRef = useRef<HTMLDivElement>(null);

  const [shouldAnimate, setShouldAnimate] = useState(false);

  useIsomorphicLayoutEffect(() => {
    // If it's not the first visit, instantly hide the overlay before it paints
    if (sessionStorage.getItem(SESSION_KEY)) {
      if (overlayRef.current) overlayRef.current.style.display = "none";
      // @ts-expect-error global appLoaded flag
      globalThis.appLoaded = true;
      window.dispatchEvent(new Event("apps-loaded"));
      return;
    }
    
    // Otherwise, mark it for the session and prep animation
    sessionStorage.setItem(SESSION_KEY, "1");
    setShouldAnimate(true);
  }, []);

  useGSAP(() => {
    if (!shouldAnimate) return;

    const overlay = overlayRef.current!;
    const path = pathRef.current!;
    const counter = countRef.current!;
    const greet = greetRef.current!;

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: "none", pointerEvents: "none" });
        // Let other components know loading has finished
        // @ts-expect-error global appLoaded flag
        globalThis.appLoaded = true;
        window.dispatchEvent(new Event("apps-loaded"));
      }
    });

    // ─── Phase 1: count 0 → 100 over ~1.8s ─────────────────────────────────
    tl.to(
      {},
      {
        duration: 0.4,
        ease: "power2.inOut",
        onUpdate() {
          const pct = Math.round(this.progress() * 100);
          if (counter) counter.textContent = `${pct}%`;
        },
      }
    );

    // ─── Phase 2: swap count → greeting ────────────────────────────────────
    tl.to(counter, { autoAlpha: 0, y: -20, duration: 0.15, ease: "power2.in" });
    tl.fromTo(
      greet,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }
    );

    // ─── Phase 3: hold & exit ───────────────────────────────────────────────
    tl.to({}, { duration: 0.2 }); 

    // Exit: path sweeps up (same as TransitionProvider exit)
    tl.set(path, { attr: { d: "M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z" } });
    tl.to(path, {
      duration: 0.2,
      attr: { d: PATHS.curveDown },
      ease: "power2.in",
    });
    tl.to(path, {
      duration: 0.3,
      attr: { d: PATHS.end },
      ease: "power4.out",
    });

  }, [shouldAnimate]);

  // We always render the overlay, so on the server it creates the DOM for it.
  // On the client, it is either instantly hidden or animates out.
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center pointer-events-auto"
      style={{ zIndex: 9999999, background: "var(--foreground)" }}
    >
      {/* SVG wipe layer */}
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

      {/* Counter */}
      <span
        ref={countRef}
        className="relative z-10 text-background font-light tabular-nums select-none tracking-tighter"
        style={{ fontSize: "clamp(3rem, 10vw, 7rem)", lineHeight: 1 }}
        aria-live="polite"
      >
        0%
      </span>

      {/* Greeting */}
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

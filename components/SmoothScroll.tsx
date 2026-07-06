"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenis = useLenis();
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);

  // Connect Lenis to GSAP scroll updates
  useEffect(() => {
    if (!lenis) return;
    
    // Connect ScrollTrigger to Lenis scroll updates
    lenis.on("scroll", ScrollTrigger.update);
    
    // Use GSAP's ticker to drive Lenis RAF
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      gsap.ticker.remove(tick);
    };
  }, [lenis]);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}

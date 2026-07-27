"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useTransition } from "./TransitionProvider";

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
  const { isLightboxOpen, isArchiveOpen, isInfoOpen } = useTransition();

  // Pause Lenis smooth scroll when Lightbox or modal sheets are active
  useEffect(() => {
    if (!lenis) return;
    if (isLightboxOpen || isArchiveOpen || isInfoOpen) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [lenis, isLightboxOpen, isArchiveOpen, isInfoOpen]);

  // Scroll to top on route change
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname, lenis]);



  // Connect Lenis to GSAP scroll updates safely
  useEffect(() => {
    if (!lenis) return;
    
    const handleScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", handleScroll);
    return () => {
      lenis.off("scroll", handleScroll);
    };
  }, [lenis]);

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}

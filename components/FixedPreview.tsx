"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import PreviewCard from "./PreviewCard";
import Lightbox from "./Lightbox";

interface FixedPreviewProps {
  activeImage: string;
  isVisible?: boolean;
  hoveredSlug?: string | null;
}

const PLAYGROUND_ASSETS = [
  "/playground/health.png",
  "/playground/slide-7.png",
  "/playground/slide-5.mp4",
  "/playground/slide-7-elegant.mp4",
  "/playground/slide-4.png",
  "/playground/slide-6.png"
];

export default function FixedPreview({ activeImage, isVisible = true, hoveredSlug }: FixedPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxAsset, setLightboxAsset] = useState<string | null>(null);
  
  // Final Reflection Properties (Calculated via Debug Tool)
  const REFLECTION_CONFIG = {
    angle: 62,
    maskEnd: 29,
    height: 309,
    topGap: 25,
    opacity: 0.33,
    blur: 147,
    blurStart: 71,
    overallBlur: 13
  };

  const isHoveringCaseStudy = !!hoveredSlug;

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  useEffect(() => {
    if (isHoveringCaseStudy) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PLAYGROUND_ASSETS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isHoveringCaseStudy]);

  if (!mounted) return null;

  const currentAsset = isHoveringCaseStudy ? activeImage : PLAYGROUND_ASSETS[currentIndex];

  return createPortal(
    <>
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-x-0 bottom-[calc(8vh+1rem)] px-[var(--page-px)] flex justify-end pointer-events-none z-[100] hidden lg:flex">
            <motion.aside
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20, transition: { duration: 0.4, delay: 0 } }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.8,
              }}
              style={{ aspectRatio: "628 / 346" }}
              className="fixed-preview-portal pointer-events-auto w-[clamp(350px,38vw,628px)] h-auto cursor-pointer group"
              aria-label="Case study preview"
              onClick={() => setLightboxAsset(currentAsset)}
            >
              <div className="relative w-full h-full">
                {/* Floor Reflection Glow (High-Performance Progressive Blur) */}
                <div 
                  className="absolute left-[-20%] right-[-20%] z-0 mix-blend-screen pointer-events-none origin-top flex justify-center"
                  style={{ 
                    top: `calc(100% + ${REFLECTION_CONFIG.topGap}px)`,
                    height: `${REFLECTION_CONFIG.height}px`,
                    transform: `perspective(400px) rotateX(${REFLECTION_CONFIG.angle}deg)`,
                    opacity: REFLECTION_CONFIG.opacity,
                  }}
                  aria-hidden="true"
                >
                  <div className="w-[71.4%] relative transform-gpu" style={{
                    height: `${REFLECTION_CONFIG.height}px`,
                    maskImage: `linear-gradient(to bottom, black 0%, transparent ${REFLECTION_CONFIG.maskEnd}%)`,
                    WebkitMaskImage: `linear-gradient(to bottom, black 0%, transparent ${REFLECTION_CONFIG.maskEnd}%)`,
                    filter: `blur(${REFLECTION_CONFIG.overallBlur}px)`,
                  }}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentAsset}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="w-full h-full absolute inset-0"
                      >
                        {/* Single, lightweight media element */}
                        {currentAsset.endsWith(".mp4") ? (
                          <video src={currentAsset} autoPlay muted loop playsInline className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <img src={currentAsset} alt="" className="w-full h-full object-cover opacity-80" />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Hardware-Accelerated Progressive Blur Overlay */}
                    <div className="absolute inset-0 z-10 transform-gpu" style={{
                      backdropFilter: `blur(${REFLECTION_CONFIG.blur}px) saturate(2)`,
                      WebkitBackdropFilter: `blur(${REFLECTION_CONFIG.blur}px) saturate(2)`,
                      maskImage: `linear-gradient(to bottom, transparent 0%, black ${REFLECTION_CONFIG.blurStart}%)`,
                      WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black ${REFLECTION_CONFIG.blurStart}%)`,
                    }} />
                  </div>
                </div>

                {/* Main Card */}
                <div className="relative z-10 w-full h-full">
                  <PreviewCard activeImage={currentAsset} className="!h-full shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-90" />
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <Lightbox 
        src={lightboxAsset} 
        onClose={() => setLightboxAsset(null)} 
        alt="Preview"
      />
    </>,
    document.body
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Lock } from "lucide-react";
import PreviewCard from "./PreviewCard";
import Lightbox from "./Lightbox";
import { memo, useMemo, useCallback } from "react";

interface FixedPreviewProps {
  activeImage: string;
  isVisible?: boolean;
  hoveredSlug?: string | null;
  isLocked?: boolean;
  assets?: string[];
}

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

const FixedPreview = memo(({ activeImage, isVisible = true, hoveredSlug, isLocked, assets }: FixedPreviewProps) => {
  const [mounted, setMounted] = useState(false);
  const [lightboxAsset, setLightboxAsset] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const openLightbox = useCallback(() => {
    if (assets && assets.length > 0) {
      const idx = assets.indexOf(activeImage);
      setLightboxIndex(idx);
      setLightboxAsset(activeImage);
    } else {
      setLightboxAsset(activeImage);
    }
  }, [assets, activeImage]);

  const closeLightbox = useCallback(() => {
    setLightboxAsset(null);
    setLightboxIndex(-1);
  }, []);

  const navigateLightbox = useCallback((direction: 1 | -1) => {
    if (!assets || lightboxIndex === -1) return;
    const nextIdx = (lightboxIndex + direction + assets.length) % assets.length;
    setLightboxIndex(nextIdx);
    setLightboxAsset(assets[nextIdx]);
  }, [assets, lightboxIndex]);

  const isVideo = useMemo(() => activeImage.endsWith(".mp4"), [activeImage]);
  const reflectionStyles = useMemo(() => ({
    top: `calc(100% + ${REFLECTION_CONFIG.topGap}px)`,
    height: `${REFLECTION_CONFIG.height}px`,
    transform: `perspective(400px) rotateX(${REFLECTION_CONFIG.angle}deg)`,
    opacity: REFLECTION_CONFIG.opacity,
    willChange: "transform, opacity"
  }), []);

  const innerReflectionStyles = useMemo(() => ({
    height: `${REFLECTION_CONFIG.height}px`,
    maskImage: `linear-gradient(to bottom, black 0%, transparent ${REFLECTION_CONFIG.maskEnd}%)`,
    WebkitMaskImage: `linear-gradient(to bottom, black 0%, transparent ${REFLECTION_CONFIG.maskEnd}%)`,
    filter: `blur(${REFLECTION_CONFIG.overallBlur}px)`,
    willChange: "filter"
  }), []);

  const blurOverlayStyles = useMemo(() => ({
    backdropFilter: `blur(${REFLECTION_CONFIG.blur}px) saturate(2)`,
    WebkitBackdropFilter: `blur(${REFLECTION_CONFIG.blur}px) saturate(2)`,
    maskImage: `linear-gradient(to bottom, transparent 0%, black ${REFLECTION_CONFIG.blurStart}%)`,
    WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black ${REFLECTION_CONFIG.blurStart}%)`,
  }), []);

  if (!mounted) return null;

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
              onClick={openLightbox}
            >
              <div className="relative w-full h-full">
                {/* Floor Reflection Glow (High-Performance Progressive Blur) */}
                <div 
                  className={`absolute left-[-20%] right-[-20%] z-0 pointer-events-none origin-top flex justify-center ${
                    resolvedTheme === "dark" ? "mix-blend-screen" : "mix-blend-multiply"
                  }`}
                  style={reflectionStyles}
                  aria-hidden="true"
                >
                  <div className="w-[71.4%] relative transform-gpu" style={innerReflectionStyles}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={activeImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="w-full h-full absolute inset-0 transform-gpu scale-[1.01]"
                      >
                        {/* Single, lightweight media element */}
                        {isVideo ? (
                          <video src={activeImage} autoPlay muted loop playsInline preload="metadata" className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <img src={activeImage} alt="" className="w-full h-full object-cover opacity-80" loading="eager" />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Hardware-Accelerated Progressive Blur Overlay */}
                    <div className="absolute inset-0 z-10 transform-gpu" style={blurOverlayStyles} />
                  </div>
                </div>

                {/* Main Card */}
                <div className="relative z-10 w-full h-full">
                  <PreviewCard activeImage={activeImage} className="!h-full shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-90" />
                  
                  {/* Padlock Icon for Locked Case Studies */}
                  {isLocked && (
                    <div
                      className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center text-foreground shadow-lg border border-border/50 transition-transform duration-500 group-hover:scale-[1.02]"
                    >
                      <Lock size={14} className="opacity-80" />
                    </div>
                  )}
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <Lightbox 
        src={lightboxAsset} 
        onClose={closeLightbox} 
        onNext={assets && lightboxIndex !== -1 ? () => navigateLightbox(1) : undefined}
        onPrev={assets && lightboxIndex !== -1 ? () => navigateLightbox(-1) : undefined}
        alt="Preview"
      />
    </>,
    document.body
  );
});

export default FixedPreview;

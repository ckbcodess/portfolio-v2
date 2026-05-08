"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  speed?: number;
}

export default function ParallaxImage({ 
  src, 
  alt, 
  className = "", 
  aspectRatio = "aspect-video",
  speed = 0.1 
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden rounded-2xl bg-muted ${aspectRatio} ${className}`}
    >
      <motion.div 
        style={{ y, height: "120%", top: "-10%", position: "absolute", width: "100%" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1400px) 100vw, 1400px"
        />
      </motion.div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  motion, 
  useAnimationFrame, 
  useMotionValue, 
  useTransform, 
  useSpring,
  useVelocity,
  PanInfo,
  useInView
} from "motion/react";
import { wrap } from "motion";
import { cn } from "@/lib/utils";

interface InfiniteTickerProps {
  children: React.ReactNode[];
  baseVelocity?: number;
  speed?: number; // Added as an alias for baseVelocity
  className?: string;
  gap?: number;
}

export function InfiniteTicker({
  children,
  baseVelocity,
  speed,
  className,
  gap = 24,
}: InfiniteTickerProps) {
  // Use speed as baseVelocity if provided, otherwise use baseVelocity or default to -1
  const effectiveVelocity = speed !== undefined ? -speed : (baseVelocity ?? -1);
  const baseX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isDragging = useRef(false);

  // Roulette-like physics settings - Tuned for a fast 1.5s resolution
  const speedMultiplier = useMotionValue(1); 
  const springSpeedMultiplier = useSpring(speedMultiplier, {
    damping: 40, 
    stiffness: 120, 
    mass: 1, 
    restDelta: 0.001
  });

  const hasInitialized = useRef(false);
  const targetMultiplier = isHovered ? 0 : 1;
  
  useEffect(() => {
    if (!hasInitialized.current) {
        // The "Roulette Spin" - Sharp and Short (1.5s total duration)
        speedMultiplier.set(200); 

        const slowToCruise = setTimeout(() => {
            speedMultiplier.set(1); 
            hasInitialized.current = true;
        }, 50); // Drop speed immediately for sharp deceleration

        return () => clearTimeout(slowToCruise);
    } else {
        speedMultiplier.set(targetMultiplier);
    }
  }, [isHovered, targetMultiplier, speedMultiplier]);

  const items = React.Children.toArray(children);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Calculate the width of one full set of items
        const firstSet = containerRef.current.children[0];
        if (firstSet) {
            const setWidth = Array.from(firstSet.children)
              .slice(0, items.length)
              .reduce((acc, child) => acc + (child as HTMLElement).offsetWidth + gap, 0);
            setContentWidth(setWidth);
        }
      }
    };

    updateWidth();
    // Use a small delay to ensure all images/content are rendered
    const timeout = setTimeout(updateWidth, 500);
    window.addEventListener("resize", updateWidth);
    return () => {
        window.removeEventListener("resize", updateWidth);
        clearTimeout(timeout);
    };
  }, [items.length, gap]);

  const isInView = useInView(containerRef);

  useAnimationFrame((t, delta) => {
    if (isDragging.current || !isInView) return;
    
    // Normalizing to roughly 60fps delta
    const moveBy = effectiveVelocity * (delta / 16) * springSpeedMultiplier.get();
    
    baseX.set(baseX.get() + moveBy);
  });

  // Wrap the X position so it loops
  const x = useTransform(baseX, (v) => {
    if (contentWidth === 0) return "0px";
    // We need enough sets to cover the screen. wrap works on one set width.
    return `${wrap(-contentWidth, 0, v)}px`;
  });

  const handleWheel = (e: React.WheelEvent) => {
    // Add horizontal scroll delta to baseX
    // We multiply by a factor to make it feel responsive
    baseX.set(baseX.get() + e.deltaX * -0.5);
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    isDragging.current = false;
    
    // "Flick" logic: add a momentary boost based on swipe velocity
    const flickVelocity = Math.abs(info.velocity.x) / 100;
    if (flickVelocity > 2) {
        speedMultiplier.set(flickVelocity * 4); // Boost speed based on flick
        
        // Immediately schedule return to base cruise
        setTimeout(() => {
            speedMultiplier.set(targetMultiplier);
        }, 50);
    }
  };

  const handleDrag = (_: any, info: PanInfo) => {
    baseX.set(baseX.get() + info.delta.x);
  };

  return (
    <div 
        className={cn("overflow-hidden w-full cursor-grab active:cursor-grabbing", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onWheel={handleWheel}
    >
      <motion.div 
        ref={containerRef}
        style={{ x }}
        className="flex shrink-0"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }} // We handle constraints manually via wrap
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
      >
        {/* Render multiple sets to fill the screen and loop smoothly */}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex shrink-0" style={{ gap: `${gap}px`, paddingRight: `${gap}px` }}>
            {items.map((item, index) => (
              <div key={`${i}-${index}`} className="flex shrink-0 pointer-events-auto">
                {item}
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

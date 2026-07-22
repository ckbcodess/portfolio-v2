"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { animate, createTimer } from 'animejs';
import { scrambleText } from 'animejs/text';
import { MaskReveal } from "@/components/MaskReveal";

const tabsData = [
  {
    name: "For all",
    text: "I find the simple version that was hiding the whole time.",
  },
  {
    name: "Recruiters",
    text: "I've spent three years proving that you don't ever have to choose between speed and craft.",
  },
  {
    name: "Product Designers",
    text: "I know every rule in the system, and exactly when to break one.",
  },
  {
    name: "Vibe Coders",
    text: "I prompted a full portfolio in 48 hours... and I'll do it again :)",
  },
  {
    name: "Artists",
    text: "Eight years an artist before this. same craft, new problems.",
  },
];

export default function TabsSection({ canAnimate = true }: { canAnimate?: boolean }) {
  const [active, setActive] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const textRef = useRef<HTMLSpanElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const allowSoundRef = useRef(false);
  const soundTimerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (!soundTimerRef.current) {
      soundTimerRef.current = createTimer({
        onUpdate: () => { allowSoundRef.current = true; },
        frameRate: 30
      });
    }

    return () => {
      if (soundTimerRef.current) soundTimerRef.current.pause();
    };
  }, []);

  const tickSound = () => {
    const ctx = audioCtxRef.current;
    if (!ctx || !allowSoundRef.current || ctx.state === 'suspended') return;

    allowSoundRef.current = false;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();

    // Triangle wave for a more mechanical click sound
    o.type = 'triangle';
    o.frequency.setValueAtTime(2500 + Math.random() * 500, t);

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.008, t + 0.001);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.004);

    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.005);
  };

  const isAnimatingRef = useRef(false);
  const animeInstanceRef = useRef<any>(null);

  const runScramble = (force = false) => {
    if (!textRef.current || (isAnimatingRef.current && !force)) return;

    if (animeInstanceRef.current) {
      animeInstanceRef.current.pause();
    }

    setIsScrambling(true);
    isAnimatingRef.current = true;
    animeInstanceRef.current = animate(textRef.current, {
      innerHTML: scrambleText({
        text: tabsData[3].text,
        chars: '01<>[]{}_—=+*^?#&$!/\\|;:',
        from: 'left',
        duration: 400,
        settleDuration: 100,
        perturbation: 0.5,
        cursor: '_',
        onChange: tickSound
      }),
      onComplete: () => {
        setIsScrambling(false);
        isAnimatingRef.current = false;
        animeInstanceRef.current = null;
      }
    });
  };

  useEffect(() => {
    return () => {
      if (animeInstanceRef.current) animeInstanceRef.current.pause();
    };
  }, []);

  useEffect(() => {
    if (active === 3) {
      // Wait for ref to be available (especially important with AnimatePresence mode="wait")
      let rafId: number;
      const checkAndRun = () => {
        if (textRef.current) {
          runScramble(true);
        } else {
          rafId = requestAnimationFrame(checkAndRun);
        }
      };
      rafId = requestAnimationFrame(checkAndRun);
      return () => {
        cancelAnimationFrame(rafId);
        if (animeInstanceRef.current) {
          animeInstanceRef.current.pause();
        }
        setIsScrambling(false);
        isAnimatingRef.current = false;
      };
    } else {
      if (animeInstanceRef.current) {
        animeInstanceRef.current.pause();
      }
      setIsScrambling(false);
      isAnimatingRef.current = false;
    }
  }, [active]);
  useEffect(() => {
    if (canAnimate) {
      const timer = setTimeout(() => setIsInitialLoad(false), 0);
      return () => clearTimeout(timer);
    }
  }, [canAnimate]);

  const handleTabClick = (i: number) => {
    setActive(i);
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setIsScrolled(e.currentTarget.scrollLeft > 10);
  };

  const [containerHeight, setContainerHeight] = useState<number | "auto">("auto");
  const contentRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setContainerHeight(entry.contentRect.height);
        }
      }
    });
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [active]);

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-6 sm:gap-8">
      <motion.div
        animate={{ height: containerHeight }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full relative grid [grid-template-areas:'stack'] overflow-hidden"
      >
        <AnimatePresence mode="popLayout">
          <motion.h1
            key={active}
            ref={contentRef}
            id="tabs-content"
            role="tabpanel"
            aria-labelledby={`tab-${active}`}
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="[grid-area:stack] text-xl sm:text-2xl text-foreground font-normal font-heading leading-[1.4] tracking-tight text-left w-full m-0 relative tabular-nums h-fit"
          >
            {active === 3 ? (
              <>
                {/* Ghost text to hold the layout volume */}
                <span className="invisible select-none pointer-events-none block" aria-hidden="true">
                  {tabsData[active].text}
                </span>
                {/* Scramble reveal layer */}
                <span
                  ref={textRef}
                  className={`absolute inset-0 w-full h-full transition-all duration-700 ${
                    isScrambling 
                      ? "text-[#00FF41] drop-shadow-[0_0_8px_rgba(0,255,65,0.4)]" 
                      : "text-foreground"
                  }`}
                />
              </>
            ) : (
              tabsData[active].text.split(/(\s+)/).map((word, i) => {
                if (/\s+/.test(word)) {
                  return <span key={i} className="inline">{word}</span>;
                }
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 4.6 }}
                    animate={{
                      opacity: canAnimate ? 1 : 0,
                      y: canAnimate ? 0 : 4.6,
                      transition: { duration: 0.2, delay: (isInitialLoad ? 0.5 : 0.04) + i * 0.015, ease: "easeOut" }
                    }}
                    exit={{
                      opacity: 0,
                      y: -3.5,
                      transition: { duration: 0.12, delay: i * 0.01, ease: "easeIn" }
                    }}
                    className="inline-block origin-[50%_55%] will-change-[transform,opacity]"
                  >
                    {word}
                  </motion.span>
                );
              })
            )}
          </motion.h1>
        </AnimatePresence>
      </motion.div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="tablist"
        aria-label="Content filters"
        className="flex flex-row items-center self-stretch overflow-x-auto lg:overflow-x-visible justify-start gap-4 pb-2 md:pb-0 scroll-fade-x scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-[var(--page-px)] px-[var(--page-px)] lg:scroll-fade-none lg:mx-0 lg:px-0"
      >
        {tabsData.map((tab, i) => (
          <MaskReveal 
            key={tab.name} 
            delay={0.1 + i * 0.06} 
            duration={0.6}
            className="shrink-0"
          >
            <button
              id={`tab-${i}`}
              role="tab"
              aria-selected={active === i}
              aria-controls="tabs-content"
              onClick={() => handleTabClick(i)}
              data-cursor="pointer"
              className={`text-center shrink-0 whitespace-nowrap justify-start text-sm sm:text-base font-normal font-sans leading-5 transition-all duration-300 outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm ${active === i
                ? "text-foreground opacity-100"
                : "text-foreground opacity-35 hover:opacity-60"
                }`}
            >
              {tab.name}
            </button>
          </MaskReveal>
        ))}
      </div>
    </div>
  );
}


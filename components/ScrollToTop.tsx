"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  visible?: boolean;
}

export default function ScrollToTop({ visible }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible !== undefined) {
      setIsVisible(visible);
    } else {
      const handleScroll = () => {
        setIsVisible(window.scrollY > 300);
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [visible]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-to-top"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          data-cursor="pointer"
          className="fixed bottom-6 right-6 z-[999] flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900/80 dark:bg-white/10 text-white backdrop-blur-md border border-white/10 shadow-lg hover:bg-neutral-800 dark:hover:bg-white/20 transition-all duration-200 focus:outline-none cursor-pointer"
        >
          <ArrowUp size={16} strokeWidth={2.2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

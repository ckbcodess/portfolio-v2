"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { InputOTP } from "@heroui/react";
import { AnimatePresence } from "framer-motion";
import { CaseStudyContent } from "@/content/case-studies/types";
import { useSound } from "@/components/SoundProvider";
import GateHeader from "./GateHeader";

interface LockedCaseStudyProps {
  caseStudy: CaseStudyContent;
  onUnlock: () => void;
}

/**
 * LockedCaseStudy component provides a PIN-entry gate for protected content.
 * Built with Hero UI's InputOTP for accessibility and high-fidelity interaction.
 */
export const LockedCaseStudy: React.FC<LockedCaseStudyProps> = ({ caseStudy, onUnlock }) => {
  const [value, setValue] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { playClick } = useSound();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-refocus on failure to keep the flow frictionless
  useEffect(() => {
    if (!isSubmitting && isInvalid) {
      // Small delay to ensure the component is fully re-enabled before focusing
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSubmitting, isInvalid]);

  const handleVerify = useCallback(async (code: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsInvalid(false);

    try {
      // Artificial delay for high-fidelity verification feel
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (code === (caseStudy.password || "2024")) {
        if (typeof playClick === 'function') playClick();
        onUnlock();
      } else {
        setIsInvalid(true);
        setValue("");
        setIsSubmitting(false);
        
        // Auto-reset error state after a short duration for a cleaner UX
        setTimeout(() => {
          setIsInvalid(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      setIsSubmitting(false);
    }
  }, [caseStudy.password, onUnlock, isSubmitting, playClick]);

  const handleChange = useCallback((val: string) => {
    setValue(val);
    if (isInvalid) setIsInvalid(false);
  }, [isInvalid]);

  return (
    <div className="w-full min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden selection:bg-primary/10">
      <GateHeader />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] flex flex-col items-center justify-center gap-12 md:gap-16"
      >
        {/* Header Content */}
        <div className="flex flex-col gap-8 md:gap-10 items-center text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-8 h-[38px] text-foreground opacity-60"
          >
            <svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C10.4772 0 6 4.47715 6 10V13H4C1.79086 13 0 14.7909 0 17V34C0 36.2091 1.79086 38 4 38H28C30.2091 38 32 36.2091 32 34V17C32 14.7909 30.2091 13 28 13H26V10C26 4.47715 21.5228 0 16 0ZM24 13H8V10C8 5.58172 11.5817 2 16 2C20.4183 2 24 5.58172 24 10V13ZM16 21C17.6569 21 19 22.3431 19 24C19 25.6569 17.6569 27 16 27C14.3431 27 13 25.6569 13 24C13 22.3431 14.3431 21 16 21Z" fill="currentColor" />
            </svg>
          </motion.div>
          <h1 className="text-2xl md:text-[28px] leading-[1.3] font-normal tracking-tight text-foreground max-w-[400px]">
            You'd need to know the code to see this case study.
          </h1>
        </div>

        {/* PIN Input Area */}
        <div className="flex flex-col items-center w-full">
          <motion.div 
            animate={isInvalid ? { x: [-8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center gap-8"
          >
            <div className="relative flex flex-col items-center gap-8">
              <InputOTP
                ref={inputRef}
                autoFocus
                isDisabled={isSubmitting}
                isInvalid={isInvalid}
                maxLength={4}
                value={value}
                onChange={handleChange}
                onComplete={handleVerify}
                variant="secondary"
                className="gap-4"
              >
                <InputOTP.Group>
                  <InputOTP.Slot index={0} className={`w-14 h-14 md:w-16 md:h-16 text-2xl transition-all duration-300 ease-in-out border-1.5 ${isInvalid ? "border-danger" : "border-transparent data-[active=true]:border-black data-[active=true]:dark:border-white"}`} />
                  <InputOTP.Slot index={1} className={`w-14 h-14 md:w-16 md:h-16 text-2xl transition-all duration-300 ease-in-out border-1.5 ${isInvalid ? "border-danger" : "border-transparent data-[active=true]:border-black data-[active=true]:dark:border-white"}`} />
                  <InputOTP.Slot index={2} className={`w-14 h-14 md:w-16 md:h-16 text-2xl transition-all duration-300 ease-in-out border-1.5 ${isInvalid ? "border-danger" : "border-transparent data-[active=true]:border-black data-[active=true]:dark:border-white"}`} />
                  <InputOTP.Slot index={3} className={`w-14 h-14 md:w-16 md:h-16 text-2xl transition-all duration-300 ease-in-out border-1.5 ${isInvalid ? "border-danger" : "border-transparent data-[active=true]:border-black data-[active=true]:dark:border-white"}`} />
                </InputOTP.Group>
              </InputOTP>

              <div className="h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isInvalid && (
                    <motion.p 
                      key="error"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="text-sm text-danger font-medium tracking-tight"
                    >
                      Incorrect code. Please try again.
                    </motion.p>
                  )}
                  {isSubmitting && !isInvalid && (
                    <motion.p 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-sm text-foreground/70 animate-pulse"
                    >
                      Verifying...
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Link */}
        <div className="mt-10">
          <a 
            href="mailto:ransford@haletop.design"
            className="text-sm text-muted-foreground hover:text-foreground underline decoration-border underline-offset-8 transition-all duration-500 ease-out"
          >
            Reach out to me if you want the code :)
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default LockedCaseStudy;

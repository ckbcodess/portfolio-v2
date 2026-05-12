"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { CaseStudyContent } from "@/content/case-studies/types";
import { useSound } from "@/components/SoundProvider";
import { useTransition } from "@/components/TransitionProvider";
import GateHeader from "./GateHeader";

interface LockedCaseStudyProps {
  caseStudy: CaseStudyContent;
  onUnlock: () => void;
}

const CODE_LENGTH = 4;

const createEmptyDigits = () => Array.from({ length: CODE_LENGTH }, () => "");

/**
 * LockedCaseStudy component provides a PIN-entry gate for protected content.
 * The code input is implemented locally so focus, borders, and keyboard behavior
 * are fully controlled by the project instead of a third-party OTP primitive.
 */
export const LockedCaseStudy: React.FC<LockedCaseStudyProps> = ({ caseStudy, onUnlock }) => {
  const { canAnimate } = useTransition();
  const [digits, setDigits] = useState<string[]>(createEmptyDigits);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { playClick } = useSound();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusSlot = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, CODE_LENGTH - 1));
    const input = inputRefs.current[clampedIndex];

    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  // Auto-refocus on failure to keep the flow frictionless
  useEffect(() => {
    if (!isSubmitting && isInvalid) {
      // Small delay to ensure the component is fully re-enabled before focusing
      const timer = setTimeout(() => {
        focusSlot(0);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [focusSlot, isSubmitting, isInvalid]);

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
        setDigits(createEmptyDigits());
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

  const handleCompletedCode = useCallback((nextDigits: string[]) => {
    const code = nextDigits.join("");

    if (code.length === CODE_LENGTH && !nextDigits.includes("")) {
      void handleVerify(code);
    }
  }, [handleVerify]);

  const handleChange = useCallback((index: number, rawValue: string) => {
    if (isSubmitting) return;

    const sanitized = rawValue.replace(/\D/g, "");

    if (isInvalid) {
      setIsInvalid(false);
    }

    if (!sanitized) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    const nextDigits = [...digits];
    let nextIndex = index;

    for (const char of sanitized) {
      if (nextIndex >= CODE_LENGTH) break;
      nextDigits[nextIndex] = char;
      nextIndex += 1;
    }

    setDigits(nextDigits);

    if (nextIndex < CODE_LENGTH) {
      focusSlot(nextIndex);
    } else {
      inputRefs.current[CODE_LENGTH - 1]?.blur();
    }

    handleCompletedCode(nextDigits);
  }, [digits, focusSlot, handleCompletedCode, isInvalid, isSubmitting]);

  const handleKeyDown = useCallback((index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSubmitting) return;

    if (event.key === "Backspace") {
      event.preventDefault();

      if (isInvalid) {
        setIsInvalid(false);
      }

      setDigits((prev) => {
        const next = [...prev];

        if (next[index]) {
          next[index] = "";
          return next;
        }

        if (index > 0) {
          next[index - 1] = "";
          queueMicrotask(() => focusSlot(index - 1));
        }

        return next;
      });

      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusSlot(index - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusSlot(index + 1);
    }
  }, [focusSlot, isInvalid, isSubmitting]);

  const handlePaste = useCallback((index: number, event: React.ClipboardEvent<HTMLInputElement>) => {
    if (isSubmitting) return;

    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");

    if (!pasted) return;

    event.preventDefault();

    if (isInvalid) {
      setIsInvalid(false);
    }

    const nextDigits = [...digits];
    let nextIndex = index;

    for (const char of pasted) {
      if (nextIndex >= CODE_LENGTH) break;
      nextDigits[nextIndex] = char;
      nextIndex += 1;
    }

    setDigits(nextDigits);

    if (nextIndex < CODE_LENGTH) {
      focusSlot(nextIndex);
    } else {
      inputRefs.current[CODE_LENGTH - 1]?.blur();
    }

    handleCompletedCode(nextDigits);
  }, [digits, focusSlot, handleCompletedCode, isInvalid, isSubmitting]);

  return (
    <div className="w-full min-h-[100dvh] bg-background flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden selection:bg-primary/10">
      <GateHeader />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={canAnimate ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] flex flex-col items-center justify-center gap-12 md:gap-16"
      >
        {/* Header Content */}
        <div className="flex flex-col gap-8 md:gap-10 items-center text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={canAnimate ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
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
              <div
                className="flex items-center gap-4"
                aria-label="Case study access code"
                role="group"
              >
                {digits.map((digit, index) => (
                  <div
                    key={index}
                    className={[
                      "relative w-14 h-14 md:w-16 md:h-16 rounded-[18px] border bg-muted flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden",
                      isInvalid ? "border-danger" : "border-transparent",
                      isInvalid ? "focus-within:border-danger" : "focus-within:border-primary",
                      isSubmitting && "opacity-60 cursor-not-allowed"
                    ].join(" ")}
                  >
                    <input
                      ref={(node) => {
                        inputRefs.current[index] = node;
                      }}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      autoFocus={index === 0}
                      className={[
                        "absolute inset-0 w-full h-full text-center text-lg md:text-xl",
                        "bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none",
                        "text-transparent caret-foreground leading-none",
                        "disabled:cursor-not-allowed",
                      ].join(" ")}
                      disabled={isSubmitting}
                      inputMode="numeric"
                      maxLength={CODE_LENGTH}
                      onChange={(event) => handleChange(index, event.target.value)}
                      onFocus={(event) => event.target.select()}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      onPaste={(event) => handlePaste(index, event)}
                      pattern="[0-9]*"
                      type="text"
                      value={digit}
                    />
                    <AnimatePresence>
                      {digit && (
                        <motion.span
                          key={`${index}-${digit}`}
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ 
                            type: "spring", 
                            damping: 15, 
                            stiffness: 400,
                          }}
                          className="text-lg md:text-xl font-medium text-foreground pointer-events-none select-none"
                        >
                          {digit}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="h-4 flex items-center justify-center">
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

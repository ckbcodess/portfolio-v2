"use client";

import { useSound } from "@/components/SoundProvider";
import ThemeControls from "./ThemeControls";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Volume2, VolumeX } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function FloatingControls() {
  const { isSoundEnabled, toggleSound } = useSound();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const isCaseStudy = pathname.startsWith("/work/");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHero = isCaseStudy && !scrolled;

  return (
    <>
      {/* Bottom Left: Sound */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0)+var(--page-px))] left-[calc(env(safe-area-inset-left,0)+var(--page-px))] z-[1000] pointer-events-auto">
        <Tooltip>
          <TooltipTrigger
            onClick={toggleSound}
            className={`${
              isHero ? "text-white" : "text-foreground/60 hover:text-foreground"
            } transition-colors p-3 -m-3 md:p-2 md:-m-2 flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm`}
            aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
          >
            {isSoundEnabled ? <Volume2 size={16} strokeWidth={2} /> : <VolumeX size={16} strokeWidth={2} />}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={12} className="hidden md:block">
            {isSoundEnabled ? "Mute" : "Unmute"}
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Bottom Right: Theme */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0)+var(--page-px))] right-[calc(env(safe-area-inset-right,0)+var(--page-px))] z-[1000] pointer-events-auto">
        <ThemeControls isHero={isHero} />
      </div>
    </>
  );
}

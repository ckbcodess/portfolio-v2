"use client";

import TransitionLink from "./TransitionLink";
import { usePathname } from "next/navigation";

/**
 * GateHeader is a minimal header used on the Locked Case Study screen.
 * It only contains the "RG" logo link to the homepage.
 */
export default function GateHeader() {
  const pathname = usePathname();
  const isCaseStudy = pathname.startsWith("/work/");

  return (
    <header className="w-full fixed top-0 left-0 z-[1000] pointer-events-none pt-6 md:pt-[48px]">
      <div className="w-full px-[var(--page-px)] flex items-center relative h-20">
        <div className="flex-1 flex justify-start pointer-events-auto">
          <TransitionLink
            href="/"
            label="Home"
            className="text-sm font-normal tracking-tight transition-colors p-4 -m-4 text-foreground"
          >
            RG
          </TransitionLink>
        </div>
      </div>
    </header>
  );
}

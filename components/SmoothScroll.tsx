"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

export default function SmoothScroll() {
    const pathname = usePathname();

    useEffect(() => {
        // Disable browser's native scroll restoration
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
        
        // Force window to top before engine initializes
        window.scrollTo(0, 0);

        const ctx = gsap.context(() => {
            const smoother = ScrollSmoother.create({
                wrapper: "#smooth-wrapper",
                content: "#smooth-content",
                smooth: 0.4,
                effects: true,
            });

            // Double-tap the scroll reset to ensure it sticks across page loads
            smoother.scrollTop(0);
            requestAnimationFrame(() => smoother.scrollTop(0));
        });

        return () => ctx.revert();
    }, [pathname]);

    return null;
}

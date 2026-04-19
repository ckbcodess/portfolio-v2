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
        // Disable browser's native scroll restoration BEFORE ScrollSmoother initializes.
        // Otherwise the browser jumps to the previous scroll position for one frame,
        // then ScrollSmoother snaps back — causing the visible bounce on refresh.
        window.history.scrollRestoration = "manual";

        const ctx = gsap.context(() => {
            ScrollSmoother.create({
                wrapper: "#smooth-wrapper",
                content: "#smooth-content",
                smooth: 0.4,
                effects: true,
            });
        });

        return () => ctx.revert();
    }, [pathname]);

    return null;
}

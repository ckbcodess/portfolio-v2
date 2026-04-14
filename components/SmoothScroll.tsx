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
        // We delay slightly to let Next.js mount the new page's #smooth-wrapper
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

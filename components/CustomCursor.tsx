"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [cursorType, setCursorType] = useState<"default" | "copy" | "copied" | "pointer">("default");
    const isMobile = useRef(false);

    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) {
            isMobile.current = true;
            return;
        }

        const handleCursorChange = (e: any) => {
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
            setCursorType(e.detail);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const cursorAttr = target.closest("[data-cursor]")?.getAttribute("data-cursor");
            
            if (cursorType === "copied") return; 

            if (cursorAttr) {
                if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
                setCursorType(cursorAttr as any);
            } else {
                if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
                resetTimeoutRef.current = setTimeout(() => {
                    setCursorType("default");
                }, 50);
            }
        };

        window.addEventListener("cursor-change", handleCursorChange);
        window.addEventListener("mouseover", handleMouseOver);
        
        return () => {
            window.removeEventListener("cursor-change", handleCursorChange);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [cursorType]);

    useGSAP(() => {
        if (isMobile.current || !cursorRef.current) {
            if (cursorRef.current) gsap.set(cursorRef.current, { display: "none" });
            return;
        }

        gsap.set(cursorRef.current, { autoAlpha: 0, xPercent: -50, yPercent: -50 });

        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power2.out" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power2.out" });

        let isVisible = false;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isVisible) {
                gsap.to(cursorRef.current, { autoAlpha: 1, duration: 0.3 });
                isVisible = true;
            }
            xTo(e.clientX);
            yTo(e.clientY);
        };

        const handleMouseDown = () => {
            // Only scale down if we hold for more than 100ms
            gsap.to(cursorRef.current, { 
                scale: 0.8, 
                duration: 0.15, 
                delay: 0.1, // This mimics the 'extended period' logic
                ease: "power2.out",
                overwrite: "auto" 
            });
        };
        
        const handleMouseUp = () => {
            // Immediately snap back to 1
            gsap.to(cursorRef.current, { 
                scale: 1, 
                duration: 0.15, 
                delay: 0, 
                ease: "power4.out", 
                overwrite: "auto" 
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, { scope: cursorRef });

    useGSAP(() => {
        if (!cursorRef.current) return;

        if (cursorType === "copy") {
            gsap.set(cursorRef.current, { mixBlendMode: "normal" });
            gsap.to(cursorRef.current, {
                width: 100,
                height: 40,
                borderRadius: "20px",
                backgroundColor: "var(--foreground)",
                duration: 0.4,
                ease: "elastic.out(1, 0.82)"
            });
        } else if (cursorType === "copied") {
            gsap.set(cursorRef.current, { mixBlendMode: "normal" });
            gsap.to(cursorRef.current, {
                backgroundColor: "#22c55e",
                duration: 0.2,
            });
            gsap.to(cursorRef.current, {
                scale: 1.1,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
        } else if (cursorType === "pointer") {
            gsap.to(cursorRef.current, {
                width: 8,
                height: 8,
                borderRadius: "100%",
                backgroundColor: "white",
                mixBlendMode: "difference",
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            gsap.to(cursorRef.current, {
                width: 16,
                height: 16,
                borderRadius: "100%",
                backgroundColor: "white",
                mixBlendMode: "difference",
                duration: 0.4,
                ease: "power3.out"
            });
        }
    }, { dependencies: [cursorType] });

    return (
        <div
            ref={cursorRef}
            className="hidden lg:flex fixed top-0 left-0 items-center justify-center pointer-events-none z-[9999] overflow-hidden whitespace-nowrap text-[10px] uppercase tracking-wider font-bold text-background opacity-0"
            style={{ willChange: "transform, width, height, border-radius, background-color" }}
        >
            <span className={`transition-opacity duration-300 ${cursorType === "copy" ? "opacity-100" : "opacity-0 invisible"}`}>
                Copy Email
            </span>
            <span className={`absolute transition-opacity duration-300 ${cursorType === "copied" ? "opacity-100" : "opacity-0 invisible"}`}>
                Copied!
            </span>
            <div className={`transition-opacity duration-300 ${cursorType === "pointer" ? "opacity-100" : "opacity-0 invisible"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white mix-blend-difference">
                   <path d="M10 13V6a2 2 0 0 1 4 0v7" />
                   <path d="M18 11.5a2 2 0 0 1 4 0V20a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5v-2" />
                   <path d="M21 11V7.5a2 2 0 0 1 4 0V11" />
                   <path d="M7 10.5a2 2 0 0 0-4 0v3.5" />
                </svg>
            </div>
        </div>
    );
}


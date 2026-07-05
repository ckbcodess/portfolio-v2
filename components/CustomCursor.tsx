"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

export default function CustomCursor({ isTransitioning }: { isTransitioning?: boolean }) {
    const pathname = usePathname();
    const { resolvedTheme } = useTheme();
    const cursorRef = useRef<HTMLDivElement>(null);
    const [cursorType, setCursorType] = useState<"default" | "copy" | "copied" | "pointer" | "case-study" | "confidential" | "none" | "wrap" | "lightbox-left" | "lightbox-right" | "close" | "hold">("default");
    
    const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [enabled, setEnabled] = useState(false);

    // Track enabled state based on screen size and coarse pointer
    useEffect(() => {
        const checkEnabled = () => {
            const isTouch = window.matchMedia("(pointer: coarse)").matches;
            const isLargeScreen = window.innerWidth >= 1024;
            setEnabled(!isTouch && isLargeScreen);
        };

        checkEnabled();
        window.addEventListener("resize", checkEnabled);
        return () => {
            window.removeEventListener("resize", checkEnabled);
        };
    }, []);

    // Reset cursor type on route change to prevent stale state
    useEffect(() => {
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        setCursorType("default");
    }, [pathname]);

    // Keep refs of values to prevent recreating listeners constantly
    const cursorTypeRef = useRef(cursorType);
    const targetPosRef = useRef(targetPos);
    const isTransitioningRef = useRef(isTransitioning);
    const isVisibleRef = useRef(false);
    const hasMoved = useRef(false);
    const lastMouseX = useRef<number | null>(null);
    const lastMouseY = useRef<number | null>(null);
    const lastMouseMoveTime = useRef<number>(0);
    const stuckCount = useRef<number>(0);
    const xToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
    const yToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

    useEffect(() => {
        cursorTypeRef.current = cursorType;
    }, [cursorType]);

    useEffect(() => {
        targetPosRef.current = targetPos;
    }, [targetPos]);

    // Helper to safely manage custom cursor classes on the root document element
    const setCursorActiveState = (active: boolean) => {
        if (active) {
            document.documentElement.classList.add("custom-cursor-active");
            if (!document.documentElement.classList.contains("watchdog-tick") && 
                !document.documentElement.classList.contains("watchdog-tock")) {
                document.documentElement.classList.add("watchdog-tick");
            }
        } else {
            document.documentElement.classList.remove("custom-cursor-active", "watchdog-tick", "watchdog-tock");
        }
    };

    // Watchdog Ticker & Stuck Detection Loop
    useEffect(() => {
        if (!enabled) {
            setCursorActiveState(false);
            return;
        }

        const initTweens = () => {
            if (!cursorRef.current) return;
            xToRef.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power2.out" });
            yToRef.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power2.out" });
        };

        let isTick = true;
        const interval = setInterval(() => {
            const now = Date.now();

            // 1. Ticking CSS watchdog to prevent cursor vanishing if JS freezes
            if (isTransitioningRef.current || !isVisibleRef.current) {
                document.documentElement.classList.remove("watchdog-tick", "watchdog-tock");
            } else {
                if (isTick) {
                    document.documentElement.classList.remove("watchdog-tock");
                    document.documentElement.classList.add("watchdog-tick");
                } else {
                    document.documentElement.classList.remove("watchdog-tick");
                    document.documentElement.classList.add("watchdog-tock");
                }
                isTick = !isTick;
            }

            // 2. JS position checking watchdog to reset GSAP if stuck/frozen
            if (!isTransitioningRef.current && isVisibleRef.current && now - lastMouseMoveTime.current < 800) {
                if (cursorRef.current && lastMouseX.current !== null && lastMouseY.current !== null) {
                    const rect = cursorRef.current.getBoundingClientRect();
                    const cursorCenterX = rect.left + rect.width / 2;
                    const cursorCenterY = rect.top + rect.height / 2;

                    const dx = lastMouseX.current - cursorCenterX;
                    const dy = lastMouseY.current - cursorCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // If distance > 150px while moving, reset GSAP quickTo and snap position
                    if (distance > 150) {
                        stuckCount.current += 1;
                        if (stuckCount.current >= 3) { // Stuck for ~600ms
                            console.warn("Custom cursor watchdog detected freeze/lag. Recovering...");
                            
                            const targetX = targetPosRef.current ? targetPosRef.current.x : lastMouseX.current;
                            const targetY = targetPosRef.current ? targetPosRef.current.y : lastMouseY.current;
                            
                            gsap.set(cursorRef.current, { x: targetX, y: targetY, autoAlpha: 1, overwrite: "auto" });
                            cursorRef.current.style.transform = `translate3d(${targetX}px, ${targetY}px, 0px) translate(-50%, -50%)`;
                            cursorRef.current.style.opacity = "1";
                            cursorRef.current.style.visibility = "visible";
                            
                            initTweens();
                            stuckCount.current = 0;
                        }
                    } else {
                        stuckCount.current = 0;
                    }
                }
            } else {
                stuckCount.current = 0;
            }
        }, 200);

        // 3. Global unhandled error recovery failsafe
        const handleError = () => {
            setCursorActiveState(false);
        };
        window.addEventListener("error", handleError);
        window.addEventListener("unhandledrejection", handleError);

        return () => {
            clearInterval(interval);
            setCursorActiveState(false);
            window.removeEventListener("error", handleError);
            window.removeEventListener("unhandledrejection", handleError);
        };
    }, [enabled]);

    // Handle isTransitioning changes
    useEffect(() => {
        isTransitioningRef.current = isTransitioning;
        
        if (isTransitioning) {
            if (isVisibleRef.current && cursorRef.current) {
                gsap.to(cursorRef.current, { autoAlpha: 0, duration: 0.2, overwrite: true });
                isVisibleRef.current = false;
            }
            setCursorActiveState(false);
        } else {
            // Transition ended. If mouse has moved and we are enabled, restore custom cursor visibility
            if (hasMoved.current && enabled && cursorRef.current) {
                gsap.to(cursorRef.current, { autoAlpha: 1, duration: 0.2 });
                isVisibleRef.current = true;
                setCursorActiveState(true);
                
                // Immediately snap to the last known position to prevent jumping
                if (lastMouseX.current !== null && lastMouseY.current !== null) {
                    if (targetPosRef.current) {
                        gsap.set(cursorRef.current, { x: targetPosRef.current.x, y: targetPosRef.current.y });
                    } else {
                        gsap.set(cursorRef.current, { x: lastMouseX.current, y: lastMouseY.current });
                    }
                }
            }
        }
    }, [isTransitioning, enabled]);

    // Listeners for data-cursor hovers (only active when enabled)
    useEffect(() => {
        if (!enabled) return;

        const handleCursorChange = (e: Event) => {
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
            setCursorType((e as CustomEvent).detail);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const cursorAttr = target.closest("[data-cursor]")?.getAttribute("data-cursor");
            
            if (cursorTypeRef.current === "copied") return; 

            if (cursorAttr) {
                if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
                setCursorType(cursorAttr as any);
                
                const element = target.closest("[data-cursor]");
                if (cursorAttr === "wrap" && element) {
                    const rect = element.getBoundingClientRect();
                    setTargetPos({
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    });
                } else {
                    setTargetPos(null);
                }
            } else {
                if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
                resetTimeoutRef.current = setTimeout(() => {
                    setCursorType("default");
                    setTargetPos(null);
                }, 50);
            }
        };

        window.addEventListener("cursor-change", handleCursorChange);
        window.addEventListener("mouseover", handleMouseOver);
        
        return () => {
            window.removeEventListener("cursor-change", handleCursorChange);
            window.removeEventListener("mouseover", handleMouseOver);
            if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
        };
    }, [enabled]);

    // 1. Coordinates and basic position tracking (Registered when enabled is true)
    useGSAP(() => {
        if (!enabled || !cursorRef.current) {
            if (cursorRef.current) gsap.set(cursorRef.current, { display: "none" });
            return;
        }

        gsap.set(cursorRef.current, { display: "flex", autoAlpha: 0, xPercent: -50, yPercent: -50 });

        xToRef.current = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power2.out" });
        yToRef.current = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power2.out" });

        const handleMouseMove = (e: MouseEvent) => {
            lastMouseX.current = e.clientX;
            lastMouseY.current = e.clientY;
            lastMouseMoveTime.current = Date.now();
            hasMoved.current = true;

            if (isTransitioningRef.current) return;

            if (!isVisibleRef.current) {
                gsap.to(cursorRef.current, { autoAlpha: 1, duration: 0.2 });
                isVisibleRef.current = true;
                setCursorActiveState(true);
            }
            
            if (targetPosRef.current) {
                xToRef.current?.(targetPosRef.current.x);
                yToRef.current?.(targetPosRef.current.y);
            } else {
                xToRef.current?.(e.clientX);
                yToRef.current?.(e.clientY);
            }
        };

        const handleMouseEnter = (e: MouseEvent) => {
            lastMouseX.current = e.clientX;
            lastMouseY.current = e.clientY;
            lastMouseMoveTime.current = Date.now();
            
            if (!isTransitioningRef.current && hasMoved.current) {
                gsap.to(cursorRef.current, { autoAlpha: 1, duration: 0.2 });
                isVisibleRef.current = true;
                setCursorActiveState(true);
                
                if (targetPosRef.current) {
                    xToRef.current?.(targetPosRef.current.x);
                    yToRef.current?.(targetPosRef.current.y);
                } else {
                    xToRef.current?.(e.clientX);
                    yToRef.current?.(e.clientY);
                }
            }
        };

        const handleMouseLeave = () => {
            if (isVisibleRef.current) {
                gsap.to(cursorRef.current, { autoAlpha: 0, duration: 0.2 });
                isVisibleRef.current = false;
                setCursorActiveState(false);
            }
        };

        const handleBlur = () => {
            if (isVisibleRef.current) {
                gsap.to(cursorRef.current, { autoAlpha: 0, duration: 0.2 });
                isVisibleRef.current = false;
                setCursorActiveState(false);
            }
        };

        const handleMouseDown = () => {
            if (isTransitioningRef.current) return;
            gsap.to(cursorRef.current, { 
                scale: 0.8, 
                duration: 0.15, 
                delay: 0.1, 
                ease: "power2.out",
                overwrite: "auto" 
            });
        };
        
        const handleMouseUp = () => {
            if (isTransitioningRef.current) return;
            gsap.to(cursorRef.current, { 
                scale: 1, 
                duration: 0.15, 
                ease: "power4.out", 
                overwrite: "auto" 
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseenter", handleMouseEnter);
        window.addEventListener("mouseleave", handleMouseLeave);
        document.documentElement.addEventListener("mouseleave", handleMouseLeave);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseenter", handleMouseEnter);
            window.removeEventListener("mouseleave", handleMouseLeave);
            document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            setCursorActiveState(false);
        };
    }, { scope: cursorRef, dependencies: [enabled] });

    // 2. Styling and size transitions (Triggered only when state actually changes)
    useGSAP(() => {
        if (!enabled || !cursorRef.current) return;

        if (isTransitioning) {
            gsap.to(cursorRef.current, { autoAlpha: 0, duration: 0.2, overwrite: true });
            return;
        }

        // Variant Styling logic (consolidated)
        if (cursorType === "hold") {
            const isLight = resolvedTheme === "light";
            gsap.to(cursorRef.current, {
                mixBlendMode: "normal",
                width: 76, height: 40,
                borderRadius: "20px",
                backgroundColor: isLight ? "#000000" : "#ffffff",
                color: isLight ? "#ffffff" : "#000000",
                border: "0px solid transparent",
                duration: 0.4,
                ease: "elastic.out(1, 0.82)"
            });
        } else if (cursorType === "copy") {
            gsap.to(cursorRef.current, {
                mixBlendMode: "normal",
                width: 100, height: 40,
                borderRadius: "20px",
                backgroundColor: "#ffffff",
                color: "#000000",
                border: "0px solid transparent",
                duration: 0.4,
                ease: "elastic.out(1, 0.82)"
            });
        } else if (cursorType === "copied") {
            gsap.to(cursorRef.current, {
                mixBlendMode: "normal",
                backgroundColor: "#22c55e",
                color: "#ffffff",
                duration: 0.2,
            });
            gsap.to(cursorRef.current, {
                scale: 1.1,
                duration: 0.1,
                yoyo: true,
                repeat: 1
            });
        } else if (cursorType === "case-study" || cursorType === "confidential") {
            const isLight = resolvedTheme === "light";
            gsap.to(cursorRef.current, {
                mixBlendMode: "normal",
                width: cursorType === "case-study" ? 160 : 120,
                height: 40,
                borderRadius: "20px",
                backgroundColor: isLight ? "#000000" : "#ffffff",
                color: isLight ? "#ffffff" : "#000000",
                border: "0px solid transparent",
                duration: 0.4,
                ease: "elastic.out(1, 0.82)"
            });
        } else if (cursorType === "wrap") {
            gsap.to(cursorRef.current, {
                mixBlendMode: "difference",
                width: 44,
                height: 44,
                borderRadius: "100%",
                backgroundColor: "transparent",
                border: "1.5px solid white",
                duration: 0.4,
                ease: "power3.out"
            });
        } else if (["lightbox-left", "lightbox-right", "close"].includes(cursorType)) {
            gsap.to(cursorRef.current, {
                mixBlendMode: "difference",
                width: 48,
                height: 48,
                borderRadius: "100%",
                backgroundColor: "white",
                color: "white",
                border: "0px solid transparent",
                duration: 0.4,
                ease: "power3.out"
            });
        } else if (cursorType === "none") {
            gsap.to(cursorRef.current, {
                autoAlpha: 0,
                duration: 0.2
            });
        } else if (cursorType === "pointer") {
            gsap.to(cursorRef.current, {
                width: 8, height: 8,
                borderRadius: "100%",
                backgroundColor: "white",
                mixBlendMode: "difference",
                color: "#ffffff",
                border: "0px solid transparent",
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            gsap.to(cursorRef.current, {
                width: 16, height: 16,
                borderRadius: "100%",
                backgroundColor: "white",
                mixBlendMode: "difference",
                color: "#ffffff",
                border: "0px solid transparent",
                duration: 0.4,
                ease: "power3.out"
            });
        }
    }, { scope: cursorRef, dependencies: [cursorType, isTransitioning, resolvedTheme, enabled] });

    if (!enabled) return null;

    return (
        <div
            ref={cursorRef}
            className="custom-cursor-element hidden lg:flex fixed top-0 left-0 items-center justify-center pointer-events-none z-[2000000] overflow-hidden whitespace-nowrap tracking-tight font-normal opacity-0"
            style={{ willChange: "transform, width, height, border-radius, background-color" }}
        >
            <span className={`transition-opacity duration-300 uppercase text-xs font-normal tracking-wider ${cursorType === "copy" ? "opacity-100" : "opacity-0 invisible"}`}>
                Copy Email
            </span>
            <span className={`absolute transition-opacity duration-300 uppercase text-xs font-bold tracking-wider ${cursorType === "hold" ? "opacity-100 animate-cursor-flash" : "opacity-0 invisible"}`}>
                Hold
            </span>
            <span className={`absolute transition-opacity duration-300 uppercase text-xs font-normal tracking-wider ${cursorType === "copied" ? "opacity-100" : "opacity-0 invisible"}`}>
                Copied!
            </span>
            <span className={`absolute transition-opacity duration-300 text-sm ${cursorType === "case-study" ? "opacity-100" : "opacity-0 invisible"}`}>
                View Case Study
            </span>
            <span className={`absolute transition-opacity duration-300 text-sm ${cursorType === "confidential" ? "opacity-100" : "opacity-0 invisible"}`}>
                Confidential
            </span>
            <div className={`transition-opacity duration-300 ${cursorType === "pointer" ? "opacity-100" : "opacity-0 invisible"}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white mix-blend-difference">
                   <path d="M10 13V6a2 2 0 0 1 4 0v7" />
                   <path d="M18 11.5a2 2 0 0 1 4 0V20a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5v-2" />
                   <path d="M21 11V7.5a2 2 0 0 1 4 0V11" />
                   <path d="M7 10.5a2 2 0 0 0-4 0v3.5" />
                 </svg>
            </div>
            <div className={`absolute transition-opacity duration-300 ${cursorType === "lightbox-left" ? "opacity-100" : "opacity-0 invisible"}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="m15 18-6-6 6-6" />
                </svg>
            </div>
            <div className={`absolute transition-opacity duration-300 ${cursorType === "lightbox-right" ? "opacity-100" : "opacity-0 invisible"}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="m9 18 6-6-6-6" />
                </svg>
            </div>
            <div className={`absolute transition-opacity duration-300 ${cursorType === "close" ? "opacity-100" : "opacity-0 invisible"}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M18 6 6 18M6 6l12 12" />
                </svg>
            </div>
        </div>
    );
}

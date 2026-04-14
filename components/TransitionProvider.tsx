"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const LoadingScreen = dynamic(() => import("./LoadingScreen"), { ssr: false });
const FloatingNav = dynamic(() => import("./FloatingNav"), { ssr: false });

interface TransitionContextType {
    navigate: (href: string, label: string, color?: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({
    navigate: () => { },
});

export const useTransition = () => useContext(TransitionContext);

export default function TransitionProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [label, setLabel] = useState("");
    const overlayRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Check if we are currently mid-transition
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [overlayColor, setOverlayColor] = useState("#111111");

    // SVG Paths for the page wipe
    const initialPath = "M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z";
    const curveUpPath = "M 0 0 Q 50 -50 100 0 L 100 100 Q 50 100 0 100 Z";
    const fullCoverPath = "M 0 0 Q 50 0 100 0 L 100 100 Q 50 100 0 100 Z";
    const curveDownPath = "M 0 0 Q 50 0 100 0 L 100 0 Q 50 50 0 0 Z";
    const endPath = "M 0 0 Q 50 0 100 0 L 100 0 Q 50 0 0 0 Z";

    const navigate = (href: string, newLabel: string, color?: string) => {
        if (pathname === href) return;
        setLabel(newLabel);
        setOverlayColor(color || "#111111");
        setIsTransitioning(true);

        const tl = gsap.timeline({
            onComplete: () => {
                // Actually trigger Next.js router change once the screen is covered
                router.push(href);
            }
        });

        // 1. Show the overlay
        tl.set(overlayRef.current, { pointerEvents: "auto", display: "flex", zIndex: 999999 });
        tl.set(pathRef.current, { attr: { d: initialPath } });
        tl.set(textRef.current, { autoAlpha: 0, y: 30 });

        // 2. Animate the path into full cover
        tl.to(pathRef.current, {
            duration: 0.5,
            attr: { d: curveUpPath },
            ease: "power4.in",
        });
        tl.to(pathRef.current, {
            duration: 0.3,
            attr: { d: fullCoverPath },
            ease: "power2.out",
        });

        // 3. Fade in the text
        tl.to(textRef.current, {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out"
        }, "-=0.2");

        // 4. Scale down and round the content slightly
        gsap.to(contentRef.current, {
            scale: 0.94,
            borderRadius: "40px",
            duration: 0.7,
            ease: "power3.inOut"
        });
    };

    // When the pathname changes, handle the exit animation
    useEffect(() => {
        if (isTransitioning) {
            const tl = gsap.timeline({
                delay: 0.1, // Hold on black for a fraction of a second
                onComplete: () => {
                    setIsTransitioning(false);
                    gsap.set(overlayRef.current, { display: "none", pointerEvents: "none" });
                }
            });

            // 1. Fade out the text
            tl.to(textRef.current, {
                autoAlpha: 0,
                y: -30,
                duration: 0.3,
                ease: "power2.in"
            });

            // 2. Animate the path to reveal the new page
            tl.set(pathRef.current, { attr: { d: fullCoverPath } });
            tl.to(pathRef.current, {
                duration: 0.3,
                attr: { d: curveDownPath },
                ease: "power2.in",
            }, "-=0.1");
            tl.to(pathRef.current, {
                duration: 0.5,
                attr: { d: endPath },
                ease: "power4.out",
            });

            // 3. Scale back and flatten the content
            gsap.fromTo(contentRef.current, {
                scale: 0.94,
                borderRadius: "40px",
            }, {
                scale: 1,
                borderRadius: "0px",
                duration: 0.8,
                ease: "power3.out",
                clearProps: "all"
            });
        }
    }, [pathname]);

    return (
        <TransitionContext.Provider value={{ navigate }}>
            <div 
                id="smooth-wrapper"
                ref={contentRef} 
                className="w-full min-h-screen origin-center transition-all duration-700 ease-out"
            >
                <div id="smooth-content" className="w-full flex flex-col items-center">
                    {children}
                </div>
            </div>

            {/* The Global Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center pointer-events-none hidden"
                style={{ zIndex: 999999 }}
            >
                <svg
                    ref={svgRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <path
                        ref={pathRef}
                        d="M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z"
                        fill={overlayColor}
                    />
                </svg>
                <div
                    ref={textRef}
                    className="relative z-10 text-white text-[1.5rem] md:text-[2rem] font-medium tracking-tight flex items-center gap-4"
                >
                    <span className="w-2 h-2 rounded-full bg-white opacity-80 mt-1" />
                    {label}
                </div>
            </div>

            {/* Client-Only HUD Elements */}
            <LoadingScreen />
            <SmoothScroll />
            <CustomCursor />
            <FloatingNav />
        </TransitionContext.Provider>
    );
}

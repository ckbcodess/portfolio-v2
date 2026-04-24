"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const LoadingScreen = dynamic(() => import("./LoadingScreen"), { ssr: false });

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
    const contentRef = useRef<HTMLDivElement>(null);

    // Check if we are currently mid-transition
    const [isTransitioning, setIsTransitioning] = useState(false);

    const navigate = (href: string, newLabel: string, color?: string) => {
        if (pathname === href) return;
        setIsTransitioning(true);

        gsap.to(contentRef.current, {
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
                router.push(href);
            }
        });
    };

    // When the pathname changes, handle the entrance animation
    useEffect(() => {
        // We always animate in on mount/pathname change for a smooth experience
        gsap.fromTo(contentRef.current, {
            opacity: 0
        }, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
                setIsTransitioning(false);
            }
        });
    }, [pathname]);

    return (
        <TransitionContext.Provider value={{ navigate }}>
            {/* 
                These IDs are required by ScrollSmoother in components/SmoothScroll.tsx. 
                Do not rename or remove them without updating that file.
            */}
            <div
                id="smooth-wrapper"
                ref={contentRef}
                className="w-full origin-top"
                style={{ willChange: "opacity" }}
            >
                <div id="smooth-content" className="w-full flex flex-col items-center">
                    {children}
                </div>
            </div>

            {/* Client-Only HUD Elements */}
            <LoadingScreen />
            <SmoothScroll />
            <CustomCursor />
        </TransitionContext.Provider>
    );
}

"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import gsap from "gsap";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const LoadingScreen = dynamic(() => import("./LoadingScreen"), { ssr: false });

interface HeaderProps {
    variant?: "default" | "case-study";
    title?: string;
    backLink?: string;
}

interface TransitionContextType {
    navigate: (href: string, label: string, color?: string) => void;
    isTransitioning: boolean;
    pendingHref: string | null;
    setHeaderProps: (props: HeaderProps) => void;
}

const TransitionContext = createContext<TransitionContextType>({
    navigate: () => { },
    isTransitioning: false,
    pendingHref: null,
    setHeaderProps: () => { },
});

export const useTransition = () => useContext(TransitionContext);

export default function TransitionProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

    const [headerProps, setHeaderProps] = useState<HeaderProps>({ variant: "default" });

    // Check if we are currently mid-transition
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    const navigate = (href: string, _newLabel: string, _color?: string) => {
        if (pathname === href) return;
        setIsTransitioning(true);
        setPendingHref(href);

        gsap.to([contentRef.current, ".fixed-preview-portal"], {
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
        // Reset header props on navigation unless the page specifically sets them
        // This ensures the header returns to default when moving away from a case study
        setTimeout(() => setHeaderProps({ variant: "default" }), 0);
        setTimeout(() => setPendingHref(null), 0);

        // We always animate in on mount/pathname change for a smooth experience
        gsap.fromTo([contentRef.current, ".fixed-preview-portal"], {
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
        <TransitionContext.Provider value={{ navigate, isTransitioning, pendingHref, setHeaderProps }}>
            {/* Persistent Header */}
            <Header {...headerProps} />

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
                <div id="smooth-content" className="w-full flex flex-col items-start">
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

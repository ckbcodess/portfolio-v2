"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect } from "react";
import gsap from "gsap";
import { animate } from 'animejs';
import { scrambleText } from 'animejs/text';
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import PageCurtain from "@/components/PageCurtain";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
const LoadingScreen = dynamic(() => import("./LoadingScreen"), { ssr: false });

interface HeaderProps {
    variant?: "default" | "case-study";
    title?: string;
    backLink?: string;
    isCaseStudy?: boolean;
    scrolled?: boolean;
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
    const curtainRef = useRef<HTMLDivElement>(null);

    const [headerProps, setHeaderProps] = useState<HeaderProps>({ variant: "default" });
    const [currentLabel, setCurrentLabel] = useState("");

    // Check if we are currently mid-transition
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    const navigate = (href: string, label: string, _color?: string) => {
        if (pathname === href) return;
        setIsTransitioning(true);
        setPendingHref(href);
        setCurrentLabel(label);

        // Reset text position and visibility for consistent upward motion
        // Use 110% to ensure it's completely hidden
        gsap.set(".curtain-text", { y: "110%", autoAlpha: 1 });

        // Animate curtain IN (Faster)
        const tl = gsap.timeline({
            onComplete: () => {
                window.scrollTo(0, 0);
                router.push(href);
            }
        });

        tl.to(curtainRef.current, {
            autoAlpha: 1,
            duration: 0.6,
            ease: "power3.inOut",
        });

        // Animate text reveal - START AFTER CURTAIN IS FULLY IN
        tl.to(".curtain-text", {
            y: 0,
            duration: 0.8,
            ease: "power4.out",
            onStart: () => {
                // Scramble effect
                const el = document.getElementById("curtain-text-el");
                if (el) {
                    animate(el, {
                        innerHTML: scrambleText({
                            text: label,
                            chars: '01<>[]{}_—=+*^?#&$!/\\|;:',
                            from: 'left',
                            duration: 400,
                            settleDuration: 80,
                        })
                    });
                }
            }
        });

        // Add a slight hold for cinematic effect
        tl.to({}, { duration: 0.3 });

        // Optionally slightly fade content too
        tl.to(contentRef.current, {
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.inOut",
        }, 0);
    };

    // Helper to get a label from the pathname for browser navigation
    const getLabelFromPath = (path: string) => {
        if (path === "/") return "Home";
        if (path === "/about") return "Bio";
        if (path === "/playground") return "Playground";
        if (path.startsWith("/work/")) {
            const slug = path.split("/").pop();
            return slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ") : "Project";
        }
        return "Navigating";
    };

    // When the pathname changes, handle the entrance animation
    useEffect(() => {
        // Handle header props
        setTimeout(() => {
            if (pathname.startsWith("/work/")) {
                setHeaderProps({ variant: "default", isCaseStudy: true });
            } else {
                setHeaderProps({ variant: "default" });
            }
        }, 0);
        setTimeout(() => setPendingHref(null), 0);

        // If we are NOT transitioning, it means browser back/forward was used
        if (!isTransitioning) {
            setCurrentLabel(getLabelFromPath(pathname));
            
            // Create a full entrance sequence to match manual clicks
            const browserTl = gsap.timeline({
                onComplete: () => {
                    setIsTransitioning(false);
                }
            });

            // Hide content and show curtain
            gsap.set(contentRef.current, { autoAlpha: 0 });
            gsap.set(".curtain-text", { y: "110%", autoAlpha: 1 });
            
            browserTl.to(curtainRef.current, {
                autoAlpha: 1,
                duration: 0.6,
                ease: "power3.inOut",
            });

            browserTl.to(".curtain-text", {
                y: 0,
                duration: 0.8,
                ease: "power4.out",
                onStart: () => {
                    const el = document.getElementById("curtain-text-el");
                    if (el) {
                        animate(el, {
                            innerHTML: scrambleText({
                                text: getLabelFromPath(pathname),
                                chars: '01<>[]{}_—=+*^?#&$!/\\|;:',
                                from: 'left',
                                duration: 400,
                                settleDuration: 80,
                            })
                        });
                    }
                }
            });

            browserTl.to({}, { duration: 0.3 });

            browserTl.to(".curtain-text", {
                autoAlpha: 0,
                y: -10,
                duration: 0.4,
                ease: "power2.in",
            });

            browserTl.to(curtainRef.current, {
                autoAlpha: 0,
                duration: 0.6,
                ease: "power3.inOut",
            }, "+=0.05");

            browserTl.to(contentRef.current, {
                autoAlpha: 1,
                duration: 0.5,
                ease: "power2.out",
            }, "-=0.4");

            return; // Exit early, browserTl handles everything
        }

        // Animate curtain OUT (For manual clicks)
        const tl = gsap.timeline({
            delay: 0.05,
            onComplete: () => {
                setIsTransitioning(false);
            }
        });

        tl.to(".curtain-text", {
            autoAlpha: 0,
            y: -10,
            duration: 0.4,
            ease: "power2.in",
        });

        tl.to(curtainRef.current, {
            autoAlpha: 0,
            duration: 0.6,
            ease: "power3.inOut",
        }, "+=0.05");

        tl.to(contentRef.current, {
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
        }, "-=0.4");

    }, [pathname]);

    return (
        <TransitionContext.Provider value={{ navigate, isTransitioning, pendingHref, setHeaderProps }}>
            <PageCurtain ref={curtainRef} label={currentLabel} />
            
            <div
                id="smooth-wrapper"
                ref={contentRef}
                className="w-full origin-top relative z-10"
            >
                <div id="smooth-content" className="w-full">
                    {children}
                </div>
            </div>

            <LoadingScreen />
            <SmoothScroll />
            <CustomCursor />
            <Header {...headerProps} />
        </TransitionContext.Provider>
    );
}

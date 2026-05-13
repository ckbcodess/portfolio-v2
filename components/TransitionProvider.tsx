"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { animate } from 'animejs';
import { scrambleText } from 'animejs/text';
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import PageCurtain from "@/components/PageCurtain";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
import LoadingScreen from "./LoadingScreen";

interface HeaderProps {
    variant?: "default" | "case-study";
    title?: string;
    backLink?: string;
    isCaseStudy?: boolean;
    scrolled?: boolean;
    hidden?: boolean;
}

interface TransitionContextType {
    navigate: (href: string, label: string, color?: string) => void;
    isTransitioning: boolean;
    pendingHref: string | null;
    setHeaderProps: (props: HeaderProps | ((prev: HeaderProps) => HeaderProps)) => void;
    setMaskActive: (active: boolean) => void;
    isMaskActive: boolean;
    canAnimate: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
    navigate: () => { },
    isTransitioning: false,
    pendingHref: null,
    setHeaderProps: () => { },
    setMaskActive: () => { },
    isMaskActive: false,
    canAnimate: false,
});

export const useTransition = () => useContext(TransitionContext);

export default function TransitionProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);
    const curtainRef = useRef<HTMLDivElement>(null);

    const [headerProps, setHeaderProps] = useState<HeaderProps>({ variant: "default" });
    const [isMaskActive, setIsMaskActive] = useState(false);
    const [currentLabel, setCurrentLabel] = useState("");

    // Check if we are currently mid-navigation
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const isFirstMount = useRef(true);

    const navigateRef = useRef((href: string, label: string, color?: string) => {});

    const setMaskActive = useCallback((active: boolean) => {
        setIsMaskActive(active);
    }, []);

    // 1. Initial Load Synchronization & Global Scroll Mask
    useEffect(() => {
        // @ts-expect-error global flag
        if (globalThis.appLoaded) {
            setInitialLoadDone(true);
            return;
        }
        const handler = () => setInitialLoadDone(true);
        window.addEventListener("apps-loaded", handler);
        return () => window.removeEventListener("apps-loaded", handler);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setMaskActive(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Check initial scroll
        return () => window.removeEventListener("scroll", handleScroll);
    }, [setMaskActive]);

    const navigate = (href: string, label: string, _color?: string) => {
        if (pathname === href) return;
        setIsTransitioning(true);
        setPendingHref(href);
        setCurrentLabel(label);

        gsap.set(".curtain-text", { y: "110%", autoAlpha: 1 });

        const tl = gsap.timeline({
            onComplete: () => {
                window.scrollTo(0, 0);
                router.push(href);
            }
        });

        tl.to(contentRef.current, {
            autoAlpha: 0,
            duration: 0.3,
            ease: "power2.inOut",
        });

        tl.to(curtainRef.current, {
            autoAlpha: 1,
            duration: 0.4,
            ease: "power3.inOut",
        }, "-=0.1");

        // Animate text reveal
        tl.to(".curtain-text", {
            y: 0,
            duration: 0.5,
            ease: "power4.out",
            onStart: () => {
                const el = document.getElementById("curtain-text-el");
                if (el) {
                    animate(el, {
                        innerHTML: scrambleText({
                            text: label,
                            chars: '01<>[]{}_—=+*^?#&$!/\\|;:',
                            from: 'left',
                            duration: 300,
                            settleDuration: 50,
                        })
                    });
                }
            }
        }, "-=0.2");

        tl.to({}, { duration: 0.1 });
    };

    // Update the ref so the context value doesn't need to depend on the function directly if it closes over changing state,
    // although in this case navigate itself doesn't depend on much.
    useEffect(() => {
        navigateRef.current = navigate;
    });

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

    // 2. Route Change Listener
    useEffect(() => {
        // Reset state on path change
        setPendingHref(null);
        setMaskActive(false);

        // Update default header props for the new route
        setHeaderProps((prev) => {
            const isWork = pathname.startsWith("/work/");
            return {
                ...prev,
                variant: "default",
                isCaseStudy: isWork,
                hidden: false
            };
        });

        // A. Skip everything on the very first mount (Refresh/Initial Landing)
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        // B. Handle Browser Back/Forward
        if (!isTransitioning) {
            const label = getLabelFromPath(pathname);
            setCurrentLabel(label);
            
            const browserTl = gsap.timeline({
                onComplete: () => {
                    setIsTransitioning(false);
                }
            });

            gsap.set(contentRef.current, { autoAlpha: 0 });
            gsap.set(".curtain-text", { y: "110%", autoAlpha: 1 });
            
            browserTl.to(curtainRef.current, {
                autoAlpha: 1,
                duration: 0.4,
                ease: "power3.inOut",
            });

            browserTl.to(".curtain-text", {
                y: 0,
                duration: 0.5,
                ease: "power4.out",
                onStart: () => {
                    const el = document.getElementById("curtain-text-el");
                    if (el) {
                        animate(el, {
                            innerHTML: scrambleText({
                                text: label,
                                chars: '01<>[]{}_—=+*^?#&$!/\\|;:',
                                from: 'left',
                                duration: 300,
                                settleDuration: 50,
                            })
                        });
                    }
                }
            }, "-=0.2");

            browserTl.to({}, { duration: 0.1 });

            browserTl.to(".curtain-text", {
                autoAlpha: 0,
                y: -10,
                duration: 0.3,
                ease: "power2.in",
            });

            browserTl.to(curtainRef.current, {
                autoAlpha: 0,
                duration: 0.4,
                ease: "power3.inOut",
            }, "+=0.02");

            browserTl.to(contentRef.current, {
                autoAlpha: 1,
                duration: 0.4,
                ease: "power2.out",
            }, "-=0.3");

            return;
        }

        // C. Handle Manual Navigation
        const tl = gsap.timeline({
            delay: 0.05,
            onComplete: () => {
                setIsTransitioning(false);
            }
        });

        tl.to(".curtain-text", {
            autoAlpha: 0,
            y: -10,
            duration: 0.3,
            ease: "power2.in",
        });

        tl.to(curtainRef.current, {
            autoAlpha: 0,
            duration: 0.4,
            ease: "power3.inOut",
        }, "+=0.02");

        tl.to(contentRef.current, {
            autoAlpha: 1,
            duration: 0.4,
            ease: "power2.out",
        }, "-=0.3");

    }, [pathname, setMaskActive]);

    const canAnimate = initialLoadDone && !isTransitioning;

    const contextValue = useMemo(() => ({
        navigate: (...args: Parameters<typeof navigate>) => navigateRef.current(...args),
        isTransitioning,
        pendingHref,
        setHeaderProps,
        setMaskActive,
        isMaskActive,
        canAnimate
    }), [isTransitioning, pendingHref, isMaskActive, canAnimate, setMaskActive]);

    return (
        <TransitionContext.Provider value={contextValue}>
            <PageCurtain ref={curtainRef} label={currentLabel} />
            
            <div
                id="smooth-wrapper"
                ref={contentRef}
                className={`w-full origin-top relative z-10 transition-opacity duration-700 ${isMaskActive ? 'case-study-mask' : ''}`}
                style={{ opacity: initialLoadDone ? 1 : 0, visibility: initialLoadDone ? 'visible' : 'hidden' }}
            >
                <div id="smooth-content" className="w-full">
                    {children}
                </div>
            </div>

            <LoadingScreen />
            <SmoothScroll />
            <CustomCursor isTransitioning={isTransitioning} />
            <div className={`transition-all duration-500 ease-in-out ${(!initialLoadDone || headerProps.hidden) ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'}`}>
                <Header {...headerProps} />
            </div>
        </TransitionContext.Provider>
    );
}

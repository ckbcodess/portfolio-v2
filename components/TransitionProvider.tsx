"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback, useMemo, Suspense } from "react";
import gsap from "gsap";
import { animate } from 'animejs';
import { scrambleText } from 'animejs/text';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import PageCurtain from "@/components/PageCurtain";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
import LoadingScreen from "./LoadingScreen";
import ArchiveDrawer from "@/components/ArchiveDrawer";
import InfoSheet from "@/components/InfoSheet";
import type { ArchiveRow } from "@/lib/types";

interface HeaderProps {
    variant?: "default" | "case-study";
    title?: string;
    backLink?: string;
    isCaseStudy?: boolean;
    scrolled?: boolean;
    hidden?: boolean;
}

function SearchParamsTracker({ setInfoOpen }: { setInfoOpen: (open: boolean) => void }) {
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams?.get("info") === "true") {
            setInfoOpen(true);
            const url = new URL(window.location.href);
            url.searchParams.delete("info");
            window.history.replaceState(null, "", url.pathname + url.search);
        }
    }, [searchParams, setInfoOpen]);
    return null;
}

interface TransitionContextType {
    navigate: (href: string, label: string, color?: string) => void;
    isTransitioning: boolean;
    pendingHref: string | null;
    setHeaderProps: (props: HeaderProps | ((prev: HeaderProps) => HeaderProps)) => void;
    setMaskActive: (active: boolean) => void;
    isMaskActive: boolean;
    canAnimate: boolean;
    isArchiveOpen: boolean;
    setArchiveOpen: (open: boolean) => void;
    isInfoOpen: boolean;
    setInfoOpen: (open: boolean) => void;
}

const TransitionContext = createContext<TransitionContextType>({
    navigate: () => { },
    isTransitioning: false,
    pendingHref: null,
    setHeaderProps: () => { },
    setMaskActive: () => { },
    isMaskActive: false,
    canAnimate: false,
    isArchiveOpen: false,
    setArchiveOpen: () => { },
    isInfoOpen: false,
    setInfoOpen: () => { },
});

export const useTransition = () => useContext(TransitionContext);

export default function TransitionProvider({
    children,
    archiveRows,
}: {
    children: ReactNode;
    archiveRows: ArchiveRow[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);
    const curtainRef = useRef<HTMLDivElement>(null);

    const [headerProps, setHeaderProps] = useState<HeaderProps>({ variant: "default" });
    const [isMaskActive, setIsMaskActive] = useState(false);
    const [currentLabel, setCurrentLabel] = useState("");
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    // Check if we are currently mid-navigation
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);
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

        const tl = gsap.timeline({
            onComplete: () => {
                window.scrollTo(0, 0);
                router.push(href);
            }
        });

        tl.to(contentRef.current, {
            autoAlpha: 0,
            duration: 0.25,
            ease: "power2.out",
        });
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
        if (path === "/resume") return "Resume";
        if (path === "/playground") return "Playground";
        if (path.startsWith("/work/")) {
            const slug = path.split("/").pop();
            return slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ") : "Project";
        }
        return "Navigating";
    };

    const prevPathnameRef = useRef(pathname);

    // 2. Route Change Listener
    useEffect(() => {
        // Only run transition logic when the pathname actually changes
        if (prevPathnameRef.current === pathname) {
            return;
        }
        prevPathnameRef.current = pathname;

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
            
            browserTl.to(contentRef.current, {
                autoAlpha: 1,
                duration: 0.3,
                ease: "power2.out",
            }, "+=0.05");

            return;
        }

        // C. Handle Manual Navigation
        const tl = gsap.timeline({
            delay: 0.05,
            onComplete: () => {
                setIsTransitioning(false);
            }
        });

        tl.to(contentRef.current, {
            autoAlpha: 1,
            duration: 0.3,
            ease: "power2.out",
        });

    }, [pathname, isTransitioning, setMaskActive]);

    const canAnimate = initialLoadDone && !isTransitioning;

    const contextValue = useMemo(() => ({
        navigate: (...args: Parameters<typeof navigate>) => navigateRef.current(...args),
        isTransitioning,
        pendingHref,
        setHeaderProps,
        setMaskActive,
        isMaskActive,
        canAnimate,
        isArchiveOpen,
        setArchiveOpen: setIsArchiveOpen,
        isInfoOpen,
        setInfoOpen: setIsInfoOpen
    }), [isTransitioning, pendingHref, isMaskActive, canAnimate, setMaskActive, isArchiveOpen, isInfoOpen]);

    return (
        <TransitionContext.Provider value={contextValue}>
            <Suspense fallback={null}>
                <SearchParamsTracker setInfoOpen={setIsInfoOpen} />
            </Suspense>
            <PageCurtain ref={curtainRef} label={currentLabel} />
            
            <SmoothScroll>
                <div
                    id="smooth-wrapper"
                    ref={contentRef}
                    className={`w-full relative z-10 transition-transform duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isMaskActive ? 'case-study-mask' : ''} ${isArchiveOpen ? 'md:-translate-x-[200px]' : ''} ${isInfoOpen ? '-translate-y-10' : ''}`}
                    style={{ opacity: initialLoadDone ? 1 : 0, visibility: initialLoadDone ? 'visible' : 'hidden' }}
                >
                    <div id="smooth-content" className="w-full">
                        {children}
                    </div>
                    {/* Dim overlay when info sheet is open */}
                    <div
                        className={`pointer-events-none fixed inset-0 z-[5] bg-black/85 transition-opacity duration-500 ease-out ${isInfoOpen ? 'opacity-100' : 'opacity-0'}`}
                        aria-hidden="true"
                    />
                </div>
            </SmoothScroll>

            <LoadingScreen />
            <CustomCursor isTransitioning={isTransitioning} />
            <div className={`transition-all duration-500 ease-in-out ${(!initialLoadDone || headerProps.hidden) ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'}`}>
                <Header {...headerProps} />
            </div>
            <ArchiveDrawer rows={archiveRows} isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
            <InfoSheet isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
        </TransitionContext.Provider>
    );
}

"use client";

import { createContext, useContext, useState, useRef, ReactNode, useEffect, useCallback, useMemo, Suspense } from "react";
import gsap from "gsap";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";

const SmoothScroll = dynamic(() => import("./SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("./CustomCursor"), { ssr: false });
import LoadingScreen from "./LoadingScreen";
import ArchiveSheet from "@/components/ArchiveSheet";
import InfoSheet from "@/components/InfoSheet";
import type { ArchiveRow, InfoSheetContent } from "@/lib/types";

interface HeaderProps {
    variant?: "default" | "case-study";
    title?: string;
    backLink?: string;
    isCaseStudy?: boolean;
    scrolled?: boolean;
    hidden?: boolean;
}

function SearchParamsTracker({
    setInfoOpen,
    setArchiveOpen
}: {
    setInfoOpen: (open: boolean) => void;
    setArchiveOpen: (open: boolean) => void;
}) {
    const searchParams = useSearchParams();
    useEffect(() => {
        if (searchParams?.get("info") === "true") {
            setInfoOpen(true);
            const url = new URL(window.location.href);
            url.searchParams.delete("info");
            window.history.replaceState(null, "", url.pathname + url.search);
        }
        if (searchParams?.get("archive") === "true") {
            setArchiveOpen(true);
            const url = new URL(window.location.href);
            url.searchParams.delete("archive");
            window.history.replaceState(null, "", url.pathname + url.search);
        }
    }, [searchParams, setInfoOpen, setArchiveOpen]);
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
    isLightboxOpen: boolean;
    setLightboxOpen: (open: boolean) => void;
    isControlsHidden: boolean;
    setControlsHidden: (hidden: boolean) => void;
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
    isLightboxOpen: false,
    setLightboxOpen: () => { },
    isControlsHidden: false,
    setControlsHidden: () => { },
});

export const useTransition = () => useContext(TransitionContext);

export default function TransitionProvider({
    children,
    archiveRows,
    infoSheet,
}: {
    children: ReactNode;
    archiveRows: ArchiveRow[];
    infoSheet: InfoSheetContent;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const contentRef = useRef<HTMLDivElement>(null);

    const [headerProps, setHeaderProps] = useState<HeaderProps>({ variant: "default" });
    const [isMaskActive, setIsMaskActive] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isControlsHidden, setControlsHidden] = useState(false);

    // Check if we are currently mid-navigation
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(() => typeof window !== "undefined" && Boolean((globalThis as any).appLoaded));
    const [pendingHref, setPendingHref] = useState<string | null>(null);
    const navigateRef = useRef((_href: string, _label: string, _color?: string) => {});

    const setMaskActive = useCallback((active: boolean) => {
        setIsMaskActive(active);
    }, []);

    // 1. Initial Load Synchronization & Global Scroll Mask
    useEffect(() => {
        if ((globalThis as any).appLoaded) {
            queueMicrotask(() => setInitialLoadDone(true));
            return;
        }
        const handler = () => setInitialLoadDone(true);
        window.addEventListener("apps-loaded", handler);
        return () => window.removeEventListener("apps-loaded", handler);
    }, []);

    const maskActiveRef = useRef(false);
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== maskActiveRef.current) {
                maskActiveRef.current = isScrolled;
                setMaskActive(isScrolled);
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Check initial scroll
        return () => window.removeEventListener("scroll", handleScroll);
    }, [setMaskActive]);

    const navigate = (href: string, _label: string, _color?: string) => {
        if (pathname === href) return;
        setIsTransitioning(true);
        setPendingHref(href);

        gsap.to(contentRef.current, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.inOut",
            onComplete: () => {
                router.push(href);
            }
        });
    };

    useEffect(() => {
        navigateRef.current = navigate;
    });

    const prevPathnameRef = useRef(pathname);

    // 2. Route Change Listener - Snappy Fade In
    useEffect(() => {
        if (prevPathnameRef.current === pathname) {
            return;
        }
        prevPathnameRef.current = pathname;

        queueMicrotask(() => {
            setPendingHref(null);
            setMaskActive(false);
            setHeaderProps((prev) => {
                const isWork = pathname.startsWith("/work/");
                return {
                    ...prev,
                    variant: "default",
                    isCaseStudy: isWork,
                    hidden: false
                };
            });
        });

        // Fade back in quickly on the new page
        gsap.fromTo(contentRef.current, 
            { opacity: 0 },
            {
                opacity: 1,
                duration: 0.2,
                ease: "power2.out",
                onComplete: () => {
                    setIsTransitioning(false);
                }
            }
        );
    }, [pathname, setMaskActive]);

    const canAnimate = initialLoadDone;

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
        setInfoOpen: setIsInfoOpen,
        isLightboxOpen,
        setLightboxOpen: setIsLightboxOpen,
        isControlsHidden,
        setControlsHidden
    }), [isTransitioning, pendingHref, isMaskActive, canAnimate, setMaskActive, isArchiveOpen, isInfoOpen, isLightboxOpen, isControlsHidden]);

    return (
        <TransitionContext.Provider value={contextValue}>
            <Suspense fallback={null}>
                <SearchParamsTracker setInfoOpen={setIsInfoOpen} setArchiveOpen={setIsArchiveOpen} />
            </Suspense>
            
            <div className="w-full min-h-screen bg-background text-foreground overflow-hidden relative">
                <SmoothScroll>
                    <div
                        id="smooth-wrapper"
                        ref={contentRef}
                        className={`w-full relative z-10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-top ${isMaskActive ? 'case-study-mask' : ''} ${(isInfoOpen || isArchiveOpen) ? 'scale-[0.93] sm:scale-[0.95] rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-2xl' : ''}`}
                        style={{ opacity: initialLoadDone ? 1 : 0, visibility: initialLoadDone ? 'visible' : 'hidden' }}
                    >
                        <div id="smooth-content" className="w-full bg-background min-h-screen">
                            {children}
                        </div>
                    </div>
                </SmoothScroll>
            </div>

            <LoadingScreen />
            <CustomCursor isTransitioning={isTransitioning} />
            <Header {...headerProps} />
            <ArchiveSheet rows={archiveRows} isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
            <InfoSheet content={infoSheet} isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
        </TransitionContext.Provider>
    );
}

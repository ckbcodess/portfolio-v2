"use client";

import TransitionLink from "./TransitionLink";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeControls from "./ThemeControls";
import { useSound } from "@/components/SoundProvider";
import { useTransition } from "./TransitionProvider";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Menu, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HeaderProps {
    variant?: "default" | "case-study";
    title?: string;
    backLink?: string;
}

export default function Header({ variant = "default", backLink = "/" }: HeaderProps) {
    const pathname = usePathname();
    const { isSoundEnabled, toggleSound } = useSound();
    const { pendingHref } = useTransition();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (variant === "case-study") {
        return (
            <header className="fixed top-0 left-0 w-full z-50 flex justify-center mix-blend-normal pointer-events-none">
                <div
                    className={`w-full px-[var(--page-px)] relative flex items-center h-[36px] pointer-events-none transition-all duration-400 ease-out ${scrolled ? "mt-6" : "mt-6 md:mt-10"
                        } justify-between`}
                >
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 pointer-events-auto">
                        <TransitionLink
                            href={backLink}
                            label="Home"
                            className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform duration-300 text-muted-foreground group-hover:text-foreground">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            <span className="text-[1rem] font-light">Back</span>
                        </TransitionLink>
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-foreground font-light text-[1rem]">Ransford Gyasi</span>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="w-full fixed top-0 left-0 z-50 mix-blend-normal pointer-events-none pt-[var(--page-pt)]">
            <div className="w-full px-[var(--page-px)] flex justify-between items-center">
            <div className="flex justify-start items-center gap-6 pointer-events-auto">
                <div className="flex justify-start items-center">
                    <span className="text-foreground text-[16px] font-normal font-sans uppercase tracking-[0.01em]">
                        <Clock />
                    </span>
                </div>
                <div className="w-[1px] h-3 bg-border/20" />
                <ThemeControls />
                <div className="w-[1px] h-3 bg-border/20" />


                <div className="flex items-center gap-4">
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger
                            onClick={toggleSound}
                            className="text-foreground/40 hover:text-foreground flex items-center justify-center gap-2 cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-sm"
                            aria-label={isSoundEnabled ? "Disable sound" : "Enable sound"}
                        >
                            {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={8}>
                            {isSoundEnabled ? "Mute" : "Unmute"}
                        </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <nav className="hidden lg:flex items-center justify-end gap-8 pointer-events-auto">
                {[
                    { href: "/", label: "Work" },
                    { href: "/playground", label: "Playground" },
                    { href: "/about", label: "About" }
                ].map((item) => {
                    const isActive = (pendingHref || pathname) === item.href;
                    return (
                        <TransitionLink
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            className={`text-[14px] font-normal tracking-tight transition-colors ${
                                isActive ? "text-foreground" : "text-foreground/30 hover:text-foreground"
                            }`}
                        >
                            {item.label}
                        </TransitionLink>
                    );
                })}
            </nav>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden pointer-events-auto">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 -mr-2 text-foreground/60 hover:text-foreground transition-colors"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-background flex flex-col pt-8 px-6 pointer-events-auto"
                    >
                        <div className="flex justify-end items-center w-full mb-12">
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 -mr-2 text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-8">
                            {[
                                { label: 'Work', href: '/' },
                                { label: 'Playground', href: '/playground' },
                                { label: 'About', href: '/about' }
                            ].map((item) => {
                                const isActive = (pendingHref || pathname) === item.href;
                                return (
                                    <TransitionLink
                                        key={item.label}
                                        href={item.href}
                                        label={item.label}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`text-4xl font-normal tracking-tight transition-opacity block ${
                                            isActive ? "text-foreground" : "text-foreground/40 hover:opacity-60"
                                        }`}
                                    >
                                        {item.label}
                                    </TransitionLink>
                                );
                            })}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </header>

    );
}

function Clock() {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTimeout(() => setTime(new Date()), 0);
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!time) return <span className="inline-block min-w-[104px]"></span>;

    const timeString = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
    const match = timeString.match(/(.*:)(\d{2})(.*)/);

    if (!match) {
        return <span className="tabular-nums inline-block min-w-[104px] text-left">{timeString}</span>;
    }

    const [, prefix, seconds, suffix] = match;
    const suffixClean = suffix.trim();

    return (
        <span className="tabular-nums inline-flex min-w-[104px] items-center justify-start text-left">
            <span>{prefix}</span>
            <span className="relative inline-flex items-center justify-center">
                <span className="invisible">{seconds}</span>
                <span className="absolute inset-0 flex">
                    {seconds.split("").map((digit, index) => (
                        <span key={index} className="relative inline-flex items-center justify-center">
                            <span className="invisible">{digit}</span>
                            <AnimatePresence>
                                <motion.span
                                    key={digit}
                                    initial={{ opacity: 0, filter: "blur(4px)", y: 4 }}
                                    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                    exit={{ opacity: 0, filter: "blur(4px)", y: -4 }}
                                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    {digit}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    ))}
                </span>
            </span>
            <span className="ml-1.5">{suffixClean}</span>
        </span>
    );
}

"use client";

import TransitionLink from "./TransitionLink";
import { useEffect, useState } from "react";
import ThemeControls from "./ThemeControls";

interface HeaderProps {
    variant?: "default" | "case-study";
    title?: string;
    backLink?: string;
}

export default function Header({ variant = "default", title, backLink = "/" }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (variant !== "case-study") return;

        const handleScroll = () => {
            if (window.scrollY > 80) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [variant]);

    return (
        <header className="fixed top-0 left-0 w-full z-50 flex justify-center mix-blend-normal pointer-events-none">
            <div
                className={`w-full px-6 relative flex items-center h-[36px] pointer-events-none transition-all duration-400 ease-out ${variant === "case-study" && scrolled ? "mt-6" : "mt-6 md:mt-10"
                    } justify-between`}
            >
                {variant === "default" ? (
                    <>

                        <div className="flex items-center gap-4 pointer-events-auto">
                            <ThemeControls />
                            <div className="flex items-center gap-1.5 text-muted-foreground text-[0.7rem] font-medium tracking-wide">
                                <Clock />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4 pointer-events-auto">
                        <TransitionLink
                            href={backLink}
                            label="Home"
                            className="group flex items-center gap-2 text-[#a3a3a3] hover:text-white transition-colors duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform duration-300 text-[#a3a3a3] group-hover:text-white">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            <span className="text-[1rem] font-light">Back</span>
                        </TransitionLink>
                        <div className="w-1 h-1 rounded-full bg-[#a3a3a3]" />
                        <span className="text-white font-light text-[1rem]">Ransford Gyasi</span>
                    </div>
                )}
            </div>
        </header>
    );
}

function Clock() {
    const [time, setTime] = useState("");
    useEffect(() => {
        const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);
    return <span>{time}</span>;
}

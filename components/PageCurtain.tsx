"use client";

import { forwardRef } from "react";

interface PageCurtainProps {
    label: string;
}

const PageCurtain = forwardRef<HTMLDivElement, PageCurtainProps>(({ label }, ref) => {
    return (
        <div
            ref={ref}
            className="fixed inset-0 z-[999999] flex items-center justify-center pointer-events-none opacity-0 invisible bg-background"
            aria-hidden="true"
        >
            <div className="overflow-hidden">
                <h2 
                    id="curtain-text-el"
                    className="text-foreground font-normal tracking-tight select-none translate-y-[110%] curtain-text" 
                    style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)" }}
                >
                    {label}
                </h2>
            </div>
        </div>
    );
});

PageCurtain.displayName = "PageCurtain";

export default PageCurtain;

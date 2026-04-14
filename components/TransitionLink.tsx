"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { useTransition } from "./TransitionProvider";
import { usePathname } from "next/navigation";

interface TransitionLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
    children: ReactNode;
    href: string;
    label: string;
    color?: string;
}

export default function TransitionLink({ children, href, label, color, onClick, ...props }: TransitionLinkProps) {
    const { navigate } = useTransition();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        // If it's a new tab click or a middle click, let the browser handle it
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
            return;
        }

        // Prevent typical instant navigation
        e.preventDefault();

        if (onClick) onClick(e);

        // Don't transition if we are already on the target page
        if (pathname === href) return;

        // Let GSAP intercept and push later
        navigate(href, label, color);
    };

    return (
        <Link href={href} onClick={handleClick} {...props}>
            {children}
        </Link>
    );
}

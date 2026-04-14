"use client";

interface SpecialTextProps {
  children: string;
  className?: string;
}

export function SpecialText({
  children,
  className = "",
}: SpecialTextProps) {
  return (
    <span className={`inline-flex ${className}`}>
      {children}
    </span>
  );
}


"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShimmeringTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function ShimmeringText({ children, className, ...props }: ShimmeringTextProps) {
  return (
    <span
      className={cn("ui-shimmer-text", className)}
      {...props}
    >
      {children}
    </span>
  );
}

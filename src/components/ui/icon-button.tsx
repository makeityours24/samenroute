"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function IconButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-[var(--foreground)] transition active:scale-[0.98]",
        className
      )}
      {...props}
    />
  );
}

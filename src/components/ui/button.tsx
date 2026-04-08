"use client";

import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  pending?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  fullWidth,
  pending,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        fullWidth && "w-full",
        size === "sm" && "min-h-10 px-3 text-sm",
        size === "md" && "min-h-12 px-4 text-sm",
        size === "lg" && "min-h-14 px-5 text-base",
        variant === "primary" && "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-[var(--shadow)]",
        variant === "secondary" && "border border-[var(--border)] bg-white text-[var(--foreground)] shadow-[var(--shadow-soft)]",
        variant === "ghost" && "bg-[var(--surface-subtle)] text-[var(--foreground)]",
        variant === "danger" && "bg-[var(--danger)] text-white shadow-[var(--shadow)]",
        className
      )}
      disabled={disabled || pending}
      {...props}
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

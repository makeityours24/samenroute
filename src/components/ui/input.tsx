import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]",
        className
      )}
      {...props}
    />
  );
}

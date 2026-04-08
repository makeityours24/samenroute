import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "accent" | "success" | "warning" | "danger" }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 text-xs font-medium",
        tone === "neutral" && "bg-[var(--surface-muted)] text-[var(--foreground)]",
        tone === "accent" && "bg-[var(--accent-soft)] text-[var(--accent)]",
        tone === "success" && "bg-[#eaf4ed] text-[#2d6a4f]",
        tone === "warning" && "bg-[#fff1de] text-[var(--warning)]",
        tone === "danger" && "bg-[#fdebea] text-[var(--danger)]",
        className
      )}
      {...props}
    />
  );
}

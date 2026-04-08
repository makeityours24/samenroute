import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function StickyActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "safe-bottom sticky bottom-[5.5rem] z-20 w-full max-w-full overflow-hidden rounded-[24px] border border-[var(--border)] bg-white/96 p-3 shadow-[var(--shadow)] backdrop-blur supports-[backdrop-filter]:bg-white/88",
        className
      )}
    >
      {children}
    </div>
  );
}

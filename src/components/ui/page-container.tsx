import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={cn(
        "safe-top mx-auto flex min-h-screen w-full max-w-md overflow-x-hidden px-4 py-3 pb-[calc(6.75rem+env(safe-area-inset-bottom))]",
        "flex-col gap-3",
        className
      )}
    >
      {children}
    </main>
  );
}

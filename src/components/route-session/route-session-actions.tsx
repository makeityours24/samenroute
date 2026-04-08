import type { ReactNode } from "react";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";

export function RouteSessionActions({ children }: { children: ReactNode }) {
  return <StickyActionBar className="space-y-2 rounded-[28px] bg-white p-2.5 shadow-[0_16px_38px_rgba(18,18,16,0.08)]">{children}</StickyActionBar>;
}

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function PlannerStepCard({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <Card className="space-y-3 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
          {step}
        </div>
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

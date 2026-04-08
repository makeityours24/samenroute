import type { ReactNode } from "react";

export function SectionHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
        {subtitle ? <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

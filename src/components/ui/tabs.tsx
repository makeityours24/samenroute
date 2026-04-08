"use client";

import { cn } from "@/lib/utils/cn";

export function Tabs({
  items,
  value,
  onChange
}: {
  items: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "min-h-10 shrink-0 rounded-full px-4 text-sm font-medium",
            value === item.value ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-muted)] text-[var(--foreground)]"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

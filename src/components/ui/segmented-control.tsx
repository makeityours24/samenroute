"use client";

import { cn } from "@/lib/utils/cn";

export function SegmentedControl({
  items,
  value,
  onChange
}: {
  items: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <div className="inline-flex min-w-full gap-2 rounded-2xl bg-[var(--surface-muted)] p-1">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "min-h-10 shrink-0 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition",
              value === item.value ? "bg-white text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)]"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

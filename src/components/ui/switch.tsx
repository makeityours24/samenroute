"use client";

import { useId } from "react";
import { cn } from "@/lib/utils/cn";

export function Switch({
  checked,
  defaultChecked,
  name,
  disabled
}: {
  checked?: boolean;
  defaultChecked?: boolean;
  name?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const isOn = checked ?? defaultChecked ?? false;

  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center">
      <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} checked={checked} disabled={disabled} className="sr-only" readOnly={checked !== undefined} />
      <span
        className={cn(
          "inline-flex h-7 w-12 items-center rounded-full p-1 transition",
          isOn ? "bg-[var(--accent)]" : "bg-[var(--surface-muted)]"
        )}
      >
        <span className={cn("h-5 w-5 rounded-full bg-white transition", isOn ? "translate-x-5" : "translate-x-0")} />
      </span>
    </label>
  );
}

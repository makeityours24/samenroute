"use client";

import { useOptimistic, useTransition } from "react";
import type { ListPlacePreferenceValue } from "@/server/repositories/list-place-preference.repository";
import { saveListPlacePreferenceAction } from "@/app/(app)/actions";
import { cn } from "@/lib/utils/cn";

type PreferenceOption = {
  value: ListPlacePreferenceValue;
  label: string;
};

export function PlacePreferenceChips({
  listId,
  listPlaceId,
  currentPreference,
  title,
  options
}: {
  listId: string;
  listPlaceId: string;
  currentPreference?: ListPlacePreferenceValue;
  title: string;
  options: PreferenceOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [optimisticPreference, setOptimisticPreference] = useOptimistic(
    currentPreference,
    (_current, next: ListPlacePreferenceValue) => next
  );

  function handleSelect(preference: ListPlacePreferenceValue) {
    if (optimisticPreference === preference || pending) {
      return;
    }

    startTransition(async () => {
      setOptimisticPreference(preference);
      const formData = new FormData();
      formData.set("listId", listId);
      formData.set("listPlaceId", listPlaceId);
      formData.set("preference", preference);
      await saveListPlacePreferenceAction(formData);
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = optimisticPreference === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={pending && !active}
              className={cn(
                "inline-flex min-h-9 items-center rounded-full border px-3 text-xs font-semibold transition",
                active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-white text-[var(--foreground)]",
                pending && !active && "opacity-60"
              )}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export function PlannerStopList({
  items,
  selectedIds,
  fixedIds,
  onToggle,
  onToggleFixed,
  recommendedLabel = "Recommended",
  fixedLabel = "Fixed",
  makeFixedLabel = "Pin slot",
  removeFixedLabel = "Release slot"
}: {
  items: Array<{ id: string; name: string; detail: string; defaultChecked: boolean; recommended?: boolean }>;
  selectedIds: string[];
  fixedIds?: string[];
  onToggle: (id: string, checked: boolean) => void;
  onToggleFixed?: (id: string) => void;
  recommendedLabel?: string;
  fixedLabel?: string;
  makeFixedLabel?: string;
  removeFixedLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);
        const isFixed = fixedIds?.includes(item.id) ?? false;

        return (
          <div
            key={item.id}
            className="flex min-h-14 items-center gap-3 rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm shadow-[var(--shadow-soft)]"
          >
            <label className="flex min-w-0 flex-1 items-center gap-3">
              <Checkbox
                name="listPlaceIds"
                value={item.id}
                checked={isSelected}
                onChange={(event) => onToggle(item.id, event.currentTarget.checked)}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{item.name}</p>
                  {item.recommended ? <Badge tone="accent">{recommendedLabel}</Badge> : null}
                  {isFixed ? <Badge tone="neutral">{fixedLabel}</Badge> : null}
                </div>
                <p className="truncate text-xs text-[var(--muted-foreground)]">{item.detail}</p>
              </div>
            </label>
            {onToggleFixed ? (
              <button
                type="button"
                className="shrink-0 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onToggleFixed(item.id)}
                disabled={!isSelected}
              >
                {isFixed ? removeFixedLabel : makeFixedLabel}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

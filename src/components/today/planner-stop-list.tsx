import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export function PlannerStopList({
  items,
  selectedIds,
  onToggle,
  recommendedLabel = "Recommended"
}: {
  items: Array<{ id: string; name: string; detail: string; defaultChecked: boolean; recommended?: boolean }>;
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  recommendedLabel?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label key={item.id} className="flex min-h-14 items-center gap-3 rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm shadow-[var(--shadow-soft)]">
          <Checkbox
            name="listPlaceIds"
            value={item.id}
            checked={selectedIds.includes(item.id)}
            onChange={(event) => onToggle(item.id, event.currentTarget.checked)}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{item.name}</p>
              {item.recommended ? <Badge tone="accent">{recommendedLabel}</Badge> : null}
            </div>
            <p className="truncate text-xs text-[var(--muted-foreground)]">{item.detail}</p>
          </div>
        </label>
      ))}
    </div>
  );
}

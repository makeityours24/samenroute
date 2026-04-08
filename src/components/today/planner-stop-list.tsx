import { Checkbox } from "@/components/ui/checkbox";

export function PlannerStopList({
  items
}: {
  items: Array<{ id: string; name: string; detail: string; defaultChecked: boolean }>;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <label key={item.id} className="flex min-h-14 items-center gap-3 rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm shadow-[var(--shadow-soft)]">
          <Checkbox name="listPlaceIds" value={item.id} defaultChecked={item.defaultChecked} />
          <div className="min-w-0">
            <p className="truncate font-medium">{item.name}</p>
            <p className="truncate text-xs text-[var(--muted-foreground)]">{item.detail}</p>
          </div>
        </label>
      ))}
    </div>
  );
}

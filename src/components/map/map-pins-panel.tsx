import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function MapPinsPanel({
  items,
  copy
}: {
  items: Array<{ id: string; name: string; active?: boolean }>;
  copy?: { title: string; pins: string; current: string };
}) {
  const labels = copy ?? { title: "Selected places", pins: "pins", current: "Current" };

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">{labels.title}</h2>
        <Badge>{items.length} {labels.pins}</Badge>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm">
            <span>{item.name}</span>
            {item.active ? <Badge tone="accent">{labels.current}</Badge> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

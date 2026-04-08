import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function RecentVisitedList({
  items,
  badgeLabel
}: {
  items: Array<{ id: string; name: string; location: string }>;
  badgeLabel: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{item.name}</p>
            <p className="truncate text-sm text-[var(--muted-foreground)]">{item.location}</p>
          </div>
          <Badge tone="success">{badgeLabel}</Badge>
        </Card>
      ))}
    </div>
  );
}

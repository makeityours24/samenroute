import { Card } from "@/components/ui/card";

export function HistoryGroup({
  heading,
  items
}: {
  heading: string;
  items: Array<{ id: string; action: string; listName: string; dateLabel: string }>;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{heading}</h2>
      {items.map((item) => (
        <Card key={item.id} className="space-y-1">
          <p className="font-semibold">{item.action}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{item.listName}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{item.dateLabel}</p>
        </Card>
      ))}
    </section>
  );
}

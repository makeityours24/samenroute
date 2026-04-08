import { Card } from "@/components/ui/card";

export function HistorySummary({
  visitedCount,
  logCount,
  visitedLabel,
  entriesLabel
}: {
  visitedCount: number;
  logCount: number;
  visitedLabel: string;
  entriesLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="space-y-1">
        <p className="text-xs text-[var(--muted-foreground)]">{visitedLabel}</p>
        <p className="text-2xl font-semibold">{visitedCount}</p>
      </Card>
      <Card className="space-y-1">
        <p className="text-xs text-[var(--muted-foreground)]">{entriesLabel}</p>
        <p className="text-2xl font-semibold">{logCount}</p>
      </Card>
    </div>
  );
}

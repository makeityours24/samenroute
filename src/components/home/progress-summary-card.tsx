import { Card } from "@/components/ui/card";

export function ProgressSummaryCard({
  placesLeft,
  hasActiveRoute,
  placesLeftLabel,
  routeInProgressLabel,
  yesLabel,
  noLabel
}: {
  placesLeft: number;
  hasActiveRoute: boolean;
  placesLeftLabel: string;
  routeInProgressLabel: string;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <Card className="grid grid-cols-2 gap-2 p-3">
      <div className="rounded-[20px] bg-[var(--surface-subtle)] p-3">
        <p className="text-xs text-[var(--muted-foreground)]">{placesLeftLabel}</p>
        <p className="mt-1 text-2xl font-semibold">{placesLeft}</p>
      </div>
      <div className="rounded-[20px] bg-[var(--surface-subtle)] p-3">
        <p className="text-xs text-[var(--muted-foreground)]">{routeInProgressLabel}</p>
        <p className="mt-1 text-2xl font-semibold">{hasActiveRoute ? yesLabel : noLabel}</p>
      </div>
    </Card>
  );
}

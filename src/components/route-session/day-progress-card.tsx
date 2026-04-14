import { Card } from "@/components/ui/card";

export function DayProgressCard({
  title,
  progressLabel,
  currentStopLabel,
  nextStopLabel,
  remainingLabel,
  completedCount,
  totalCount,
  currentStop,
  nextStop,
  remainingCount
}: {
  title: string;
  progressLabel: string;
  currentStopLabel: string;
  nextStopLabel: string;
  remainingLabel: string;
  completedCount: number;
  totalCount: number;
  currentStop: string;
  nextStop: string;
  remainingCount: number;
}) {
  return (
    <Card className="space-y-3 border-transparent bg-[linear-gradient(180deg,#f6f2e8_0%,#ffffff_100%)]">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{title}</p>
        <p className="text-sm text-[var(--foreground)]">
          {progressLabel}: {completedCount}/{totalCount}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl bg-white px-3 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-xs text-[var(--muted-foreground)]">{currentStopLabel}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{currentStop}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-xs text-[var(--muted-foreground)]">{nextStopLabel}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{nextStop}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-3 shadow-[var(--shadow-soft)]">
          <p className="text-xs text-[var(--muted-foreground)]">{remainingLabel}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{remainingCount}</p>
        </div>
      </div>
    </Card>
  );
}

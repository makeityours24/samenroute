import Link from "next/link";
import type { Route } from "next";
import { Card } from "@/components/ui/card";

export function ActiveDayStatusCard({
  title,
  body,
  progressLabel,
  completedCount,
  totalCount,
  currentStopLabel,
  currentStop,
  nextStopLabel,
  nextStop,
  buttonLabel,
  href
}: {
  title: string;
  body: string;
  progressLabel: string;
  completedCount: number;
  totalCount: number;
  currentStopLabel: string;
  currentStop: string;
  nextStopLabel: string;
  nextStop: string;
  buttonLabel: string;
  href: string;
}) {
  return (
    <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#256b56_0%,#1f5d4c_100%)] p-4 text-white shadow-[var(--shadow)]">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-snug">{title}</h2>
        <p className="text-sm leading-6 text-white/80">{body}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <p className="text-xs text-white/70">{progressLabel}</p>
          <p className="mt-1 text-sm font-semibold">{completedCount}/{totalCount}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <p className="text-xs text-white/70">{currentStopLabel}</p>
          <p className="mt-1 text-sm font-semibold">{currentStop}</p>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-3">
          <p className="text-xs text-white/70">{nextStopLabel}</p>
          <p className="mt-1 text-sm font-semibold">{nextStop}</p>
        </div>
      </div>
      <Link
        href={href as Route}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/20 bg-white px-4 text-sm font-semibold text-[var(--accent)] shadow-[var(--shadow-soft)]"
      >
        {buttonLabel}
      </Link>
    </Card>
  );
}

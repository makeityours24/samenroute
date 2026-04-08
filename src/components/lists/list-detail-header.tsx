import Link from "next/link";
import type { Route as AppRoute } from "next";
import { Map, Route, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ListDetailHeader({
  title,
  description,
  plannedCount,
  visitedCount,
  shareHref,
  copy,
  planTodayHref
}: {
  title: string;
  description?: string | null;
  plannedCount: number;
  visitedCount: number;
  shareHref: string;
  planTodayHref?: string;
  copy?: {
    headerBadge: string;
    noDescription: string;
    planned: string;
    visited: string;
    planToday: string;
    actionsHint: string;
    map: string;
    share: string;
  };
}) {
  const labels = copy ?? {
    headerBadge: "List",
    noDescription: "No description yet.",
    planned: "Planned",
    visited: "Visited",
    planToday: "Today",
    actionsHint: "Start with today. Use map and sharing only when you need extra context.",
    map: "Map",
    share: "Share"
  };

  return (
    <Card className="space-y-3 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-3 shadow-[var(--shadow)]">
      <div className="space-y-2">
        <Badge tone="accent">{labels.headerBadge}</Badge>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">{description ?? labels.noDescription}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/80 p-3">
          <p className="text-xs text-[var(--muted-foreground)]">{labels.planned}</p>
          <p className="mt-1 text-xl font-semibold">{plannedCount}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-3">
          <p className="text-xs text-[var(--muted-foreground)]">{labels.visited}</p>
          <p className="mt-1 text-xl font-semibold">{visitedCount}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Link
          href={(planTodayHref ?? "/today") as AppRoute}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow)]"
        >
          <Route className="h-4 w-4" />
          {labels.planToday}
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="#map"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            <Map className="h-4 w-4" />
            {labels.map}
          </a>
          <Link
            href={shareHref as AppRoute}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            <Share2 className="h-4 w-4" />
            {labels.share}
          </Link>
        </div>
        <p className="px-1 text-xs leading-5 text-[var(--muted-foreground)]">{labels.actionsHint}</p>
      </div>
    </Card>
  );
}

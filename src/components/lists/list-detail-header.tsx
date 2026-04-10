import Link from "next/link";
import type { Route as AppRoute } from "next";
import { Map, PencilLine, Route, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ListDetailHeader({
  title,
  description,
  plannedCount,
  visitedCount,
  shareHref,
  editHref,
  copy,
  planTodayHref
}: {
  title: string;
  description?: string | null;
  plannedCount: number;
  visitedCount: number;
  shareHref?: string;
  editHref?: string;
  planTodayHref?: string;
  copy?: {
    headerBadge: string;
    noDescription: string;
    planned: string;
    visited: string;
    planToday: string;
    actionsHint: string;
    todayLabel: string;
    manageLabel: string;
    edit: string;
    map: string;
    share: string;
    shareDisabled?: string;
  };
}) {
  const labels = copy ?? {
    headerBadge: "List",
    noDescription: "No description yet.",
    planned: "Planned",
    visited: "Visited",
    planToday: "Today",
    actionsHint: "Start here if you want to use this list today. Editing and sharing stay available, but out of the way.",
    todayLabel: "Use today",
    manageLabel: "Manage later",
    edit: "Edit",
    map: "Map",
    share: "Share",
    shareDisabled: "Members"
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
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{labels.todayLabel}</p>
        <Link
          href={(planTodayHref ?? "/today") as AppRoute}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow)]"
        >
          <Route className="h-4 w-4" />
          {labels.planToday}
        </Link>
        <p className="px-1 pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{labels.manageLabel}</p>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={editHref ?? "#list-settings"}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]"
          >
            <PencilLine className="h-4 w-4" />
            {labels.edit}
          </a>
          <a
            href="#map"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]"
          >
            <Map className="h-4 w-4" />
            {labels.map}
          </a>
          {shareHref ? (
            <Link
              href={shareHref as AppRoute}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]"
            >
              <Share2 className="h-4 w-4" />
              {labels.share}
            </Link>
          ) : (
            <div className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)]">
              <Share2 className="h-4 w-4" />
              {labels.shareDisabled ?? labels.share}
            </div>
          )}
        </div>
        <p className="px-1 text-xs leading-5 text-[var(--muted-foreground)]">{labels.actionsHint}</p>
      </div>
    </Card>
  );
}

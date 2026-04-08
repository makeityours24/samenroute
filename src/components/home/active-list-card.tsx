import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ActiveListCard({
  listName,
  pendingCount,
  visitedCount,
  href,
  badgeLabel,
  pendingLabel,
  visitedLabel,
  openLabel
}: {
  listName: string;
  pendingCount: number;
  visitedCount: number;
  href: string;
  badgeLabel: string;
  pendingLabel: string;
  visitedLabel: string;
  openLabel: string;
}) {
  return (
    <Card className="space-y-3 overflow-hidden border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] shadow-[var(--shadow)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge tone="accent">{badgeLabel}</Badge>
          <h2 className="text-lg font-semibold">{listName}</h2>
        </div>
        <Link href={href as Route} className="text-[var(--muted-foreground)]" aria-label={openLabel}>
          <ArrowUpRight className="h-5 w-5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/80 p-3">
          <p className="text-xs text-[var(--muted-foreground)]">{pendingLabel}</p>
          <p className="mt-1 text-xl font-semibold">{pendingCount}</p>
        </div>
        <div className="rounded-2xl bg-white/80 p-3">
          <p className="text-xs text-[var(--muted-foreground)]">{visitedLabel}</p>
          <p className="mt-1 text-xl font-semibold">{visitedCount}</p>
        </div>
      </div>
      <Link
        href={href as Route}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow)]"
      >
        {openLabel}
      </Link>
    </Card>
  );
}

import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function RouteAdjustmentCard({
  badge,
  title,
  body,
  options,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref
}: {
  badge: string;
  title: string;
  body: string;
  options: string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}) {
  return (
    <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f6f2e8_100%)] p-4 shadow-[var(--shadow-soft)]">
      <div className="space-y-1">
        <Badge tone="accent">{badge}</Badge>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
      </div>
      <ul className="space-y-2 text-sm text-[var(--foreground)]">
        {options.map((option) => (
          <li key={option} className="rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
            {option}
          </li>
        ))}
      </ul>
      <div className="grid gap-2">
        <Link
          href={primaryHref as Route}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow)]"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref as Route}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
        >
          {secondaryLabel}
        </Link>
      </div>
    </Card>
  );
}

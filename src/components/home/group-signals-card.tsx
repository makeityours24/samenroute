import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function GroupSignalsCard({
  badge,
  title,
  body,
  signals,
  ctaLabel,
  ctaHref
}: {
  badge: string;
  title: string;
  body: string;
  signals: string[];
  ctaLabel: string;
  ctaHref: string;
}) {
  if (signals.length === 0) {
    return null;
  }

  return (
    <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f3efe6_100%)] shadow-[var(--shadow-soft)]">
      <div className="space-y-1">
        <Badge tone="accent">{badge}</Badge>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
      </div>
      <ul className="space-y-2 text-sm text-[var(--foreground)]">
        {signals.map((signal) => (
          <li key={signal} className="rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
            {signal}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref as Route}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
      >
        {ctaLabel}
      </Link>
    </Card>
  );
}

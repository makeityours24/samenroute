import Link from "next/link";
import type { Route } from "next";
import { Card } from "@/components/ui/card";

export function ProactivePlanningCard({
  eyebrow,
  title,
  body,
  buttonLabel,
  href
}: {
  eyebrow: string;
  title: string;
  body: string;
  buttonLabel: string;
  href: string;
}) {
  return (
    <Card className="space-y-4 border-[color:color-mix(in_srgb,var(--accent)_14%,white)] bg-[linear-gradient(180deg,rgba(226,240,234,0.95)_0%,rgba(255,255,255,0.96)_100%)]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]/80">{eyebrow}</p>
        <h2 className="text-lg font-semibold leading-snug text-[var(--foreground)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
      </div>
      <Link
        href={href as Route}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)]"
      >
        {buttonLabel}
      </Link>
    </Card>
  );
}

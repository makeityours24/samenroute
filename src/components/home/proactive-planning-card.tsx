import Link from "next/link";
import type { Route } from "next";
import { Card } from "@/components/ui/card";

export function ProactivePlanningCard({
  eyebrow,
  title,
  body,
  steps,
  buttonLabel,
  href,
  secondaryLabel,
  secondaryHref
}: {
  eyebrow: string;
  title: string;
  body: string;
  steps: string[];
  buttonLabel: string;
  href: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Card className="space-y-4 border-[color:color-mix(in_srgb,var(--accent)_14%,white)] bg-[linear-gradient(180deg,rgba(226,240,234,0.95)_0%,rgba(255,255,255,0.96)_100%)]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]/80">{eyebrow}</p>
        <h2 className="text-lg font-semibold leading-snug text-[var(--foreground)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
      </div>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={`${index}-${step}`}
            className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          href={href as Route}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)]"
        >
          {buttonLabel}
        </Link>
        {secondaryLabel && secondaryHref ? (
          <Link
            href={secondaryHref as Route}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function NextBestStepCard({
  eyebrow,
  title,
  body,
  bullets,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#215948_0%,#1a473a_100%)] p-5 text-white shadow-[var(--shadow)]">
      <div className="space-y-2">
        <Badge tone="accent">{eyebrow}</Badge>
        <h2 className="text-xl font-semibold leading-tight">{title}</h2>
        <p className="text-sm leading-6 text-white/80">{body}</p>
      </div>
      <ul className="space-y-2 text-sm">
        {bullets.map((bullet) => (
          <li key={bullet} className="rounded-2xl bg-white/10 px-4 py-3 text-white">
            {bullet}
          </li>
        ))}
      </ul>
      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          href={primaryHref as Route}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-[var(--accent)] shadow-[var(--shadow-soft)]"
        >
          {primaryLabel}
        </Link>
        {secondaryLabel && secondaryHref ? (
          <Link
            href={secondaryHref as Route}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

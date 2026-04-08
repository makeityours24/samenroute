import Link from "next/link";
import type { Route } from "next";
import { Card } from "@/components/ui/card";

export function ActiveRouteBanner({
  href,
  eyebrow,
  title,
  buttonLabel
}: {
  href: string;
  eyebrow: string;
  title: string;
  buttonLabel: string;
}) {
  return (
    <Card className="space-y-3 border-transparent bg-[linear-gradient(180deg,#256b56_0%,#1f5d4c_100%)] p-4 text-white shadow-[var(--shadow)]">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.18em] text-white/70">{eyebrow}</p>
        <h2 className="text-lg font-semibold leading-snug">{title}</h2>
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

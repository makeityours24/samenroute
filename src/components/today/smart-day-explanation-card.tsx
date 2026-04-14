import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function SmartDayExplanationCard({
  badge,
  title,
  body,
  reasons,
  learningTitle,
  learningBody
}: {
  badge: string;
  title: string;
  body: string;
  reasons: string[];
  learningTitle: string;
  learningBody: string;
}) {
  if (reasons.length === 0) {
    return null;
  }

  return (
    <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#f3f0e7_0%,#ffffff_100%)]">
      <div className="space-y-1">
        <Badge tone="accent">{badge}</Badge>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
      </div>
      <ul className="space-y-2 text-sm text-[var(--foreground)]">
        {reasons.map((reason) => (
          <li key={reason} className="rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
            {reason}
          </li>
        ))}
      </ul>
      <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">{learningTitle}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{learningBody}</p>
      </div>
    </Card>
  );
}

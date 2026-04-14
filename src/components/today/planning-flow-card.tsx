import { Card } from "@/components/ui/card";

export function PlanningFlowCard({
  title,
  subtitle,
  steps
}: {
  title: string;
  subtitle: string;
  steps: string[];
}) {
  return (
    <Card className="space-y-3 border-transparent bg-[linear-gradient(180deg,#f6f2e8_0%,#ffffff_100%)]">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{subtitle}</p>
      </div>
      <div className="grid gap-2">
        {steps.map((step, index) => (
          <div
            key={`${index}-${step}`}
            className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
              {index + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

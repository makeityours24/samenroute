import { Card } from "@/components/ui/card";

export function NextStopCard({ name, label, helper }: { name: string; label?: string; helper?: string }) {
  return (
    <Card className="space-y-1.5 bg-[var(--surface-subtle)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label ?? "Next"}</p>
      <p className="text-base font-semibold leading-snug">{name}</p>
      {helper ? <p className="text-sm leading-5 text-[var(--muted-foreground)]">{helper}</p> : null}
    </Card>
  );
}
